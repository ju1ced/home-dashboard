import assert from 'node:assert/strict';
import test from 'node:test';
import { migrateConfig, favoriteRooms, roomControlSources, planRoomControl, executeRoomControl, validateConfig, validateConfigSchema, getHomeStructureSignature } from '../dist/home-dashboard.js';

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
test('HVAC in de klimaat-chip wordt niet gedupliceerd; verborgen chips behouden activiteit', () => {
  const {room,hass}=setup();room.hvac.entity='climate_primary';room.light_entities=[room.control_light_entity];
  const config={rooms:[room]};const before=getHomeStructureSignature(hass,config);
  hass.states[room.control_light_entity].state='on';
  assert.equal(before,getHomeStructureSignature(hass,config));
  hass.states.climate_primary={state:'heat',attributes:{hvac_action:'heating'}};
  assert.equal(before,getHomeStructureSignature(hass,config));
  assert.notEqual(before,getHomeStructureSignature(hass,{...config,show_quick_actions:false}));
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
