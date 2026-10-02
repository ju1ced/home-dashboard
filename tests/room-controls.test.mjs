import assert from 'node:assert/strict';
import test from 'node:test';
import { migrateConfig, favoriteRooms, roomControlSources, planRoomControl, planEntityControl, executeRoomControl, validateConfig, validateConfigSchema, getHomeStructureSignature, resolveLightGroupState, extractStatisticSeries, filterRoomLogbookEvents, temperatureHumidityEntities } from '../dist/home-dashboard.js';

const ref = (domain, key) => [domain, key].join('.');
function setup() {
  const room = migrateConfig({ rooms: [{ key: 'demo', name: 'Demo', area_id: 'EXAMPLE_AREA', home_favorite: true, controls_enabled: true,
    control_light_entity: ref('light','fixture'), control_cover_entity: ref('cover','fixture'), control_awning_entity: ref('cover','awning_fixture'), control_media_entity: ref('media_player','fixture') }] }).config.rooms[0];
  const calls = [];
  const hass = { states: {
    [room.control_light_entity]: { state: 'off' },
    [room.control_cover_entity]: { state: 'open', attributes: { supported_features: 11, device_class: 'shutter' } },
    [room.control_awning_entity]: { state: 'closed', attributes: { supported_features: 11, device_class: 'awning' } },
    [room.control_media_entity]: { state: 'playing', attributes: { supported_features: 16385 } }
  }, callService: async (...args) => { calls.push(args); } };
  return { room, hass, calls };
}
test('legacy migratie activeert geen doelen of bediening', () => {
  const config = migrateConfig({ rooms: [{key:'demo', name:'Demo', area_id:'EXAMPLE_AREA', light_entities:['light_primary']}] }).config;
  assert.equal(config.rooms[0].controls_enabled, false);
  assert.equal(config.rooms[0].control_light_entity, '');
  assert.deepEqual(favoriteRooms(config.rooms), []);
  assert.deepEqual(validateConfigSchema(config), []);
});
test('favorieten blijven in expliciete volgorde onafhankelijk van activiteit', () => {
  const {room}=setup(); const rooms = [{...room,key:'second'}, {...room,key:'hidden',home_favorite:false},{...room,key:'first'}];
  assert.deepEqual(favoriteRooms(rooms).map(x=>x.key), ['second','first']);
  const config=migrateConfig({rooms:Array.from({length:5},(_,i)=>({...room,key:`room_${i}`}))}).config;
  assert.ok(validateConfig(config).some(x=>x.code==='favorite_limit'));
});
test('licht stuurt uitsluitend het expliciet gekozen doel en gebruikt actuele toestand', async () => {
  const {room,hass,calls}=setup();
  await executeRoomControl(room,hass,'light','toggle');
  assert.deepEqual(calls, [['light','turn_on',{entity_id:room.control_light_entity}]]);
  hass.states[room.control_light_entity].state='on';
  await executeRoomControl(room,hass,'light','toggle');
  assert.equal(calls[1][1],'turn_off');
});
test('beveiligde smart plug blijft via overlappende lichtmapping fail-closed', () => {
  const {room,hass}=setup();
  const protectedTarget=ref('switch','protected_fixture');
  room.light_switch_entities=[protectedTarget];
  room.smart_plugs=[{key:'protected_plug',name:'Beveiligd',switch_entity:protectedTarget,power_entity:'',energy_entity:'',voltage_entity:'',protected:true,protection_reason:'Automatisch beheerd.'}];
  hass.states[protectedTarget]={state:'on'};
  assert.equal(planEntityControl(room,hass,protectedTarget,'light','toggle'),undefined);
});
test('missing unknown unavailable en uitgeschakelde bediening blokkeren calls', async () => {
  for(const state of [undefined,'unknown','unavailable']) {
    const {room,hass,calls}=setup();
    if(state) hass.states[room.control_light_entity].state=state; else delete hass.states[room.control_light_entity];
    await assert.rejects(executeRoomControl(room,hass,'light','toggle'));
    assert.equal(calls.length,0);
  }
  const {room,hass}=setup(); room.controls_enabled=false;
  assert.equal(planRoomControl(room,hass,'light'),undefined);
});
test('covers hebben feature-gating, stop en uitsluiting van deuren/poorten', async () => {
  const {room,hass,calls}=setup();
  await executeRoomControl(room,hass,'cover','stop');
  assert.equal(calls[0][1],'stop_cover');
  hass.states[room.control_cover_entity].attributes.supported_features=1;
  assert.equal(planRoomControl(room,hass,'cover','stop'),undefined);
  assert.equal(planRoomControl(room,hass,'cover','close'),undefined);
  hass.states[room.control_cover_entity].attributes.device_class='garage';
  assert.equal(planRoomControl(room,hass,'cover','open'),undefined);
});
test('luifel vraagt bevestiging voor beweging maar niet voor stop', async () => {
  const {room,hass,calls}=setup();
  await assert.rejects(executeRoomControl(room,hass,'awning','open'));
  await executeRoomControl(room,hass,'awning','open',true);
  await executeRoomControl(room,hass,'awning','stop');
  assert.deepEqual(calls.map(x=>x[1]),['open_cover','stop_cover']);
});
test('radio pauzeert/hervat, kiest geen bron en respecteert ondersteunde functies', () => {
  const {room,hass}=setup(); const state=hass.states[room.control_media_entity];
  assert.equal(planRoomControl(room,hass,'media').service,'media_pause');
  state.state='paused'; assert.equal(planRoomControl(room,hass,'media').service,'media_play');
  for(const value of ['idle','off','on']) {state.state=value; assert.equal(planRoomControl(room,hass,'media'),undefined);}
  state.state='playing'; state.attributes.supported_features=0;
  assert.equal(planRoomControl(room,hass,'media'),undefined);
});
test('verkeerd domein, ongekende actie en backendweigering worden niet omzeild', async () => {
  const {room,hass}=setup();
  room.control_light_entity=room.control_cover_entity;
  assert.equal(planRoomControl(room,hass,'light'),undefined);
  assert.equal(planRoomControl(room,hass,'cover','delete'),undefined);
  hass.callService=async()=>{throw new Error('permission denied');};
  await assert.rejects(executeRoomControl(room,hass,'cover','stop'),/permission denied/);
});
test('HVAC en verlichting veroorzaken zonder Nu actief geen dubbele Home-sectie', () => {
  const {room,hass}=setup();room.hvac.entity='climate_primary';room.light_entities=[room.control_light_entity];
  const config={rooms:[room]};const before=getHomeStructureSignature(hass,config);
  hass.states[room.control_light_entity].state='on';
  assert.equal(before,getHomeStructureSignature(hass,config));
  hass.states.climate_primary={state:'heat',attributes:{hvac_action:'heating'}};
  assert.equal(before,getHomeStructureSignature(hass,config));
  assert.equal(before,getHomeStructureSignature(hass,{...config,show_quick_actions:false}));
});
test('bestaande kamerbronnen worden detailchips zonder automatische actiedoelen', () => {
  const {room,hass}=setup();room.control_light_entity='';room.light_entities=['light_first','light_second'];
  assert.deepEqual(roomControlSources(room,'light'),room.light_entities);
  assert.equal(planRoomControl(room,hass,'light'),undefined);
  room.hvac.entity='climate_primary';hass.states.climate_primary={state:'heat',attributes:{temperature:21}};
  assert.deepEqual(roomControlSources(room,'climate'),['climate_primary']);
  assert.equal(planRoomControl(room,hass,'climate'),undefined);
});
test('geordende quick actions zijn optioneel en ondersteunen herhaalde types', () => {
  const {room,hass}=setup();
  const secondLight=ref('light','second_fixture');
  const secondCover=ref('cover','second_fixture');
  hass.states[secondLight]={state:'on'};
  hass.states[secondCover]={state:'closed',attributes:{supported_features:11,device_class:'shutter'}};
  room.control_entities=[room.control_cover_entity,secondLight,room.control_light_entity,secondCover];
  const migrated=migrateConfig({rooms:[room]}).config.rooms[0];
  assert.deepEqual(migrated.control_entities,room.control_entities);
  room.control_entities=[];
  assert.deepEqual(migrateConfig({rooms:[room]}).config.rooms[0].control_entities,[]);
});
test('Home accepteert alleen expliciet benoemde verlichtingsswitches', () => {
  const {room}=setup();
  const lightSwitch=ref('switch','fixture_lighting');
  room.control_entities=[lightSwitch];
  room.light_switch_entities=[lightSwitch];
  const config=migrateConfig({rooms:[room]}).config;
  assert.deepEqual(validateConfigSchema(config),[]);
  assert.equal(validateConfig(config).some(x=>x.code==='control_domain'),false);
  config.rooms[0].light_switch_entities=[];
  assert.ok(validateConfig(config).some(x=>x.path==='rooms[0].control_entities[0]'&&x.code==='control_domain'));
});
test('legacy Home-fallback toont expliciet gemapte verlichtingsswitches', () => {
  const {room}=setup();
  const lightSwitch=ref('switch','fixture_lighting');
  room.control_entities=undefined;
  room.control_light_entity='';
  room.light_entities=[];
  room.light_switch_entities=[lightSwitch];
  assert.deepEqual(roomControlSources(room,'light'),[lightSwitch]);
});
test('migratie onderscheidt oningestelde legacybediening van een bewust lege actierij', () => {
  const legacy=migrateConfig({rooms:[{key:'legacy',name:'Legacy',area_id:'EXAMPLE_AREA'}]}).config.rooms[0];
  const empty=migrateConfig({rooms:[{key:'empty',name:'Empty',area_id:'EXAMPLE_AREA',control_entities:[]}]}).config.rooms[0];
  assert.equal(legacy.control_entities,undefined);
  assert.deepEqual(empty.control_entities,[]);
});
test('schema accepteert optionele velden en validator weigert verkeerde of dubbele coverdoelen', () => {
  const {room}=setup();const config=migrateConfig({rooms:[room]}).config;
  assert.deepEqual(validateConfigSchema(config),[]);
  config.rooms[0].control_light_entity=room.control_cover_entity;
  config.rooms[0].control_awning_entity=room.control_cover_entity;
  const codes=validateConfig(config).map(x=>x.code);
  assert.ok(codes.includes('control_domain'));assert.ok(codes.includes('duplicate_control'));
  config.rooms[0].control_entities=[ref('switch','fixture')];
  assert.ok(validateConfig(config).some(x=>x.path==='rooms[0].control_entities[0]'&&x.code==='control_domain'));
});

test('lichtgroepstatus onderscheidt uit, aan, gedeeltelijk, onbekend en onbeschikbaar', () => {
  const entities = [ref('light', 'fixture_first'), ref('light', 'fixture_second')];
  assert.equal(resolveLightGroupState({
    [entities[0]]: { state: 'off' },
    [entities[1]]: { state: 'off' }
  }, entities), 'off');
  assert.equal(resolveLightGroupState({
    [entities[0]]: { state: 'on' },
    [entities[1]]: { state: 'on' }
  }, entities), 'on');
  assert.equal(resolveLightGroupState({
    [entities[0]]: { state: 'on' },
    [entities[1]]: { state: 'off' }
  }, entities), 'partial');
  assert.equal(resolveLightGroupState({
    [entities[0]]: { state: 'unknown' },
    [entities[1]]: { state: 'off' }
  }, entities), 'unknown');
  assert.equal(resolveLightGroupState({
    [entities[0]]: { state: 'unavailable' },
    [entities[1]]: { state: 'off' }
  }, entities), 'unavailable');
  assert.equal(resolveLightGroupState({}, entities), 'unknown');
  assert.equal(resolveLightGroupState({}, []), 'unknown');
});

test('HD-205/D-058 point 4: temperatureHumidityEntities filtert de generieke history_entities-bucket op device_class/eenheid', () => {
  const temperature = ref('sensor', 'temp'), humidity = ref('sensor', 'hum'), battery = ref('sensor', 'battery'), explicit = ref('sensor', 'explicit_temp');
  const hass = { states: {
    [temperature]: { state: '21', attributes: { device_class: 'temperature', unit_of_measurement: '°C' } },
    [humidity]: { state: '55', attributes: { device_class: 'humidity', unit_of_measurement: '%' } },
    [battery]: { state: '80', attributes: { unit_of_measurement: '%' } } // no device_class: never matched as humidity (bare "%" risk)
  } };
  const room = { history_entities: [temperature, humidity, battery], hvac: { history_entities: [] }, temperature_history_entity: '' };
  assert.deepEqual(new Set(temperatureHumidityEntities(hass, room)), new Set([temperature, humidity]));

  // temperature_history_entity is always included, even when its state is unavailable and has lost its
  // device_class/unit attributes entirely -- it must never silently disappear from the Historie chart.
  const unavailableHass = { states: { [explicit]: { state: 'unavailable', attributes: {} } } };
  const roomWithExplicit = { history_entities: [], hvac: { history_entities: [] }, temperature_history_entity: explicit };
  assert.deepEqual(temperatureHumidityEntities(unavailableHass, roomWithExplicit), [explicit]);

  // Nothing mapped at all: an empty, well-defined result, never a crash.
  assert.deepEqual(temperatureHumidityEntities(undefined, { history_entities: [], hvac: { history_entities: [] }, temperature_history_entity: '' }), []);
});

test('HD-205/D-058 points 1+2: filterRoomLogbookEvents houdt alleen gemapte entiteiten, dropt automation/script/scene, sorteert nieuwste eerst en cap\'t op 50', () => {
  const mapped = ref('light', 'mapped'), outside = ref('light', 'outside_room');
  const entries = [
    { when: 10, entity_id: mapped, name: 'Mapped oud' },
    { when: 30, entity_id: mapped, name: 'Mapped nieuw' },
    { when: 20, entity_id: outside, name: 'Niet-gemapt' }, // D-058 point 1: never leaks even if the server ever returned it
    { when: 40, entity_id: mapped, name: 'Automatisering', domain: 'automation' } // defensive domain drop
  ];
  const filtered = filterRoomLogbookEvents(entries, [mapped]);
  assert.deepEqual(filtered.map((entry) => entry.name), ['Mapped nieuw', 'Mapped oud']);

  // Hard cap of 50, newest first, even with far more than 50 matching events.
  const many = Array.from({ length: 80 }, (_, index) => ({ when: index, entity_id: mapped }));
  const capped = filterRoomLogbookEvents(many, [mapped]);
  assert.equal(capped.length, 50);
  assert.equal(capped[0].when, 79);

  // An empty allowlist (nothing mapped) never falls back to showing anything -- mirrors the "never call
  // with an empty filter" guard that keeps the WS call itself from ever becoming house-wide.
  assert.deepEqual(filterRoomLogbookEvents(entries, []), []);
});

test('HD-205: extractStatisticSeries onderscheidt afwezige langetermijnstatistiek, een lege periode en echte (ook nul-)waarden', () => {
  const withStats = ref('sensor', 'with_stats'), emptyPeriod = ref('sensor', 'empty_period'), notInResponse = ref('sensor', 'not_in_response');
  const response = {
    [withStats]: [{ start: 0, sum: 1.5 }, { start: 1, sum: 0 }, { start: 2 }],
    [emptyPeriod]: []
  };
  // Absent key: no long-term statistics at all for this source (never shown as a fabricated zero series).
  assert.equal(extractStatisticSeries(response, notInResponse), undefined);
  // Present but empty: has long-term statistics, just none in this window.
  assert.deepEqual(extractStatisticSeries(response, emptyPeriod), []);
  // Present with real buckets: a genuine 0 (`sum: 0`) is kept distinct from a missing bucket (`sum` absent).
  assert.deepEqual(extractStatisticSeries(response, withStats), [
    { start: 0, value: 1.5 }, { start: 1, value: 0 }, { start: 2, value: undefined }
  ]);
});
