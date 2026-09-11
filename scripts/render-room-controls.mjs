import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
// Set HD_BROWSER_PACKAGES to a directory containing playwright, or install it locally.
const require=createRequire(process.env.HD_BROWSER_PACKAGES ? `${process.env.HD_BROWSER_PACKAGES}/package.json` : import.meta.url);
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,channel:process.env.HD_BROWSER_CHANNEL || 'msedge'});
const directory=process.env.HD_RENDER_DIRECTORY || 'docs/renders/expandable-rooms';await mkdir(directory,{recursive:true});
const page=await browser.newPage();
await page.addInitScript(()=>{const RealDate=Date;window.Date=class extends RealDate {constructor(...args){super(...(args.length?args:['2026-09-07T08:00:00+02:00']));}static now(){return new RealDate('2026-09-07T08:00:00+02:00').getTime();}};});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
async function open(query='') {
  await page.goto(`http://127.0.0.1:4173/room-controls.html${query}`);
  await page.waitForFunction(()=>window.roomFixture && document.querySelector('home-dashboard-home-overview').shadowRoot.querySelector('home-dashboard-room-controls'));
  await page.getByRole('button',{name:'Bediening Woonkamer',exact:true}).click();
}
try {
  for(const [name,width,height,query] of [ ['desktop',1440,1100,''],['tablet',1024,1100,''],['mobile',390,844,''],['dark',1440,1100,'?theme=dark'],['warning',1440,1100,'?fixture=warning'],['missing',390,844,'?fixture=missing'],['unavailable',390,844,'?fixture=unavailable'],['kiosk-navigation',1440,1100,'?navigation=kiosk'] ]) {
    await page.setViewportSize({width,height});await open(query);
    assert.equal(await page.getByText('Afvalophaling',{exact:true}).count(),1);
    assert.equal(await page.getByText('Niet recent',{exact:false}).count(),0);
    assert.equal(await page.getByText('Geen recente context',{exact:false}).count(),0);
    assert.equal(await page.locator('home-dashboard-room-controls').count(),4);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    if(name==='kiosk-navigation') {
      assert.equal(await page.locator('home-dashboard-navigation nav a').count(),5);
      assert.equal(await page.getByRole('link',{name:'Home',exact:true}).getAttribute('aria-current'),'page');
    }
    if(name==='warning') assert.equal(await page.getByText('Aandacht nodig',{exact:true}).count(),1);
    if(name==='desktop') await page.getByRole('button',{name:/Woonkamer · Rolluiken.*Toon bediening/}).click();
    await page.screenshot({path:`${directory}/${name}.png`,fullPage:true});
  }
  await page.setViewportSize({width:1440,height:1100});await open();
  const roomToggle=page.getByRole('button',{name:'Bediening Woonkamer',exact:true});
  assert.equal(await roomToggle.getAttribute('aria-expanded'),'true');
  await page.evaluate(()=>{window.lastDetails='';roomFixture.home.addEventListener('hass-more-info',event=>window.lastDetails=event.detail.entityId);});
  const climate=page.getByRole('button',{name:/Woonkamer · Airco \/ verwarming/});
  await climate.click();
  assert.equal(await page.evaluate(()=>lastDetails===roomFixture.config.rooms[0].hvac.entity),true);
  assert.equal(await page.evaluate(()=>roomFixture.calls.length),0);
  await climate.press('Escape');
  assert.equal(await roomToggle.getAttribute('aria-expanded'),'false');
  assert.equal(await roomToggle.evaluate(el=>el.getRootNode().activeElement===el),true);
  await roomToggle.press('Enter');
  assert.equal(await page.getByRole('link',{name:'Volledige kamer Woonkamer',exact:true}).getAttribute('href'),'room-room-0');
  assert.equal(await page.evaluate(()=>location.pathname),'/room-controls.html');
  const homeWidth=await page.locator('home-dashboard-home-overview').evaluate(el=>el.shadowRoot.querySelector('.home').getBoundingClientRect().width);
  assert.ok(homeWidth>1300);
  const light=page.getByRole('button',{name:/Woonkamer · Lichten.*Uitschakelen/});
  await light.click();
  assert.equal(await page.evaluate(()=>roomFixture.calls.length),1);
  assert.equal(await page.evaluate(()=>roomFixture.calls[0].service),'turn_off');
  // No optimistic fake state; source remains on until a state update arrives.
  assert.equal(await light.count(),1);
  await page.getByRole('button',{name:/Woonkamer · Rolluiken.*Toon bediening/}).click();
  const stop=page.getByRole('button',{name:'Woonkamer · Rolluiken Stop',exact:true});await stop.focus();
  await page.evaluate(()=>{const f=roomFixture;f.hass.states[f.config.today.solar_power_entity].state='700';f.home.hass={...f.hass};});
  assert.equal(await stop.evaluate(el=>el.getRootNode().activeElement===el),true);
  await stop.click();assert.equal(await page.evaluate(()=>roomFixture.calls.at(-1).service),'stop_cover');
  // Stop must stay available while a movement request is still awaiting a reply.
  await page.evaluate(()=>{roomFixture.hass.callService=async(domain,service,data)=>{roomFixture.calls.push({domain,service,data});if(service==='open_cover')await new Promise(resolve=>window.finishMovement=resolve);};roomFixture.home.hass=roomFixture.hass;});
  await page.getByRole('button',{name:'Woonkamer · Rolluiken Open',exact:true}).click();
  assert.equal(await stop.isEnabled(),true);await stop.click();
  assert.equal(await page.evaluate(()=>roomFixture.calls.at(-1).service),'stop_cover');
  await page.evaluate(()=>window.finishMovement());
  await open();
  await page.evaluate(()=>window.fixtureReject=true);
  await light.click();
  await page.getByText('Niet bevestigd. Controleer status en rechten via Details voordat je opnieuw probeert.',{exact:true}).waitFor();
  await open();
  await page.getByRole('button',{name:/Woonkamer · Luifel.*Toon bediening/}).click();
  page.once('dialog',dialog=>dialog.dismiss());
  await page.getByRole('button',{name:'Woonkamer · Luifel Uit',exact:true}).click();
  assert.equal(await page.evaluate(()=>roomFixture.calls.length),0);
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Woonkamer · Luifel Uit',exact:true}).click();
  assert.equal(await page.evaluate(()=>roomFixture.calls.length),1);
  await open('?fixture=unavailable');
  await page.getByRole('button',{name:/Woonkamer · Rolluiken.*Open details/}).click();
  assert.equal(await page.evaluate(()=>roomFixture.calls.length),0);
  // Explicit opt-out exposes details only, even with all target mappings present.
  await page.evaluate(()=>{const f=roomFixture;f.config.rooms.forEach(r=>r.controls_enabled=false);f.home.setConfig({...f.config,type:'custom:home-dashboard-home-overview'});f.home.hass=f.hass;});
  assert.equal(await page.getByRole('button',{name:'Bediening Woonkamer',exact:true}).getAttribute('aria-expanded'),'true');
  await page.getByRole('button',{name:/Woonkamer · Lichten.*Open details/}).click();
  assert.equal(await page.evaluate(()=>roomFixture.calls.length),0);
  await open();
  // Every enabled control target meets the declared touch minimum.
  const small=await page.locator('home-dashboard-room-controls button:visible').evaluateAll(elements=>elements.filter(el=>{const r=el.getBoundingClientRect();return r.width<44||r.height<44}).length);
  assert.equal(small,0);
  const performance=await page.evaluate(()=>{
    const f=roomFixture;const card=f.home.shadowRoot.querySelector('home-dashboard-room-controls');
    const before=card.shadowRoot.innerHTML;const start=window.performance.now();
    for(let i=0;i<100;i++){f.hass.states.unrelated_fixture={state:String(i)};f.home.hass={...f.hass};}
    return {ms:window.performance.now()-start,same:card===f.home.shadowRoot.querySelector('home-dashboard-room-controls'),html:before===card.shadowRoot.innerHTML};
  });
  assert.equal(performance.same,true);assert.equal(performance.html,true);
  await page.evaluate(()=>{const f=roomFixture;const room=f.config.rooms[0];room.light_entities=[room.control_light_entity,'second_light_fixture'];room.control_light_entity='';f.hass.states.second_light_fixture={state:'off',attributes:{friendly_name:'Tweede lamp'}};f.home.setConfig({...f.config,type:'custom:home-dashboard-home-overview'});f.home.hass=f.hass;f.home.addEventListener('hass-more-info',event=>window.lastDetails=event.detail.entityId);});
  await page.getByRole('button',{name:/Woonkamer · Lichten.*Toon apparaten/}).click();
  await page.getByRole('button',{name:/Woonkamer · Rolluiken.*Toon bediening/}).click();
  assert.equal(await page.getByRole('button',{name:'Tweede lamp · Uit',exact:true}).isVisible(),false);
  await page.getByRole('button',{name:/Woonkamer · Lichten.*Toon apparaten/}).click();
  await page.screenshot({path:`${directory}/source-tray.png`,fullPage:true});
  await page.getByRole('button',{name:'Tweede lamp · Uit',exact:true}).click();
  assert.equal(await page.evaluate(()=>lastDetails),'second_light_fixture');
  assert.equal(await page.evaluate(()=>roomFixture.calls.length),0);
  const multipleLights=page.getByRole('button',{name:/Woonkamer · Lichten.*Toon apparaten/});
  assert.match(await multipleLights.getAttribute('aria-label'),/2 apparaten · 1 aan/);
  await page.evaluate(()=>{const f=roomFixture;f.hass.states[f.config.rooms[0].light_entities[0]].state='off';f.hass.states.second_light_fixture.state='on';f.home.hass={...f.hass};});
  assert.equal(await multipleLights.evaluate(el=>el.classList.contains('active')),true);
  await page.evaluate(()=>{const f=roomFixture;f.hass.states.second_light_fixture.state='unavailable';f.home.hass={...f.hass};});
  assert.match(await multipleLights.getAttribute('aria-label'),/2 apparaten · 1 onbekend/);
  assert.equal(await multipleLights.evaluate(el=>el.classList.contains('active')),false);
  // An explicit list renders one chip per entity and preserves mixed, repeated types in the chosen order.
  await open();
  await page.evaluate(()=>{const f=roomFixture;const room=f.config.rooms[0];const secondLight=['light','second_fixture'].join('.');const secondCover=['cover','second_fixture'].join('.');f.hass.states[secondLight]={state:'on',attributes:{friendly_name:'Leeslamp',icon:'mdi:floor-lamp'}};f.hass.states[secondCover]={state:'closed',attributes:{friendly_name:'Rolluik terras',supported_features:11,device_class:'shutter',icon:'mdi:blinds-horizontal'}};room.control_entities=[room.control_cover_entity,secondLight,room.control_light_entity,secondCover,room.control_awning_entity,room.control_media_entity,room.hvac.entity];f.home.setConfig({...f.config,type:'custom:home-dashboard-home-overview'});f.home.hass=f.hass;});
  const orderedNames=await page.locator('home-dashboard-room-controls').first().locator('.controls .control strong').allTextContents();
  assert.deepEqual(orderedNames.slice(0,4),['Rolluik','Leeslamp','Lichten','Rolluik terras']);
  assert.equal(await page.evaluate(()=>roomFixture.calls.length),0);
  const orderedCover=page.getByRole('button',{name:/Woonkamer · Rolluik terras:.*Toon bediening/});
  await orderedCover.click();
  assert.equal(await page.evaluate(()=>roomFixture.calls.length),0);
  const orderedOpen=page.locator('home-dashboard-room-controls').first().locator('#control-3 button[data-command="open"]');
  assert.equal(await orderedOpen.getAttribute('aria-label'),'Woonkamer · Rolluik terras Open');
  await orderedOpen.click();
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>roomFixture.calls.at(-1).data.entity_id),['cover','second_fixture'].join('.'));
  await page.screenshot({path:`${directory}/ordered-actions.png`,fullPage:true});
  await page.setViewportSize({width:1440,height:1100});await open();
  const aligned=await page.evaluate(()=>{const root=roomFixture.home.shadowRoot;const today=root.querySelector('.today-main').getBoundingClientRect();const panel=root.querySelector('.security-panel').getBoundingClientRect();const host=root.querySelector('home-dashboard-camera-strip').getBoundingClientRect();const camera=root.querySelector('home-dashboard-camera-strip').shadowRoot.querySelector('ha-card').getBoundingClientRect();return {top:Math.abs(today.top-camera.top),bottom:Math.abs(today.bottom-camera.bottom),today:today.height,panel:panel.height,host:host.height,camera:camera.height};});
  assert.ok(aligned.top<1&&aligned.bottom<1,`Vandaag/camera niet uitgelijnd: ${JSON.stringify(aligned)}`);
  await page.evaluate(()=>{const f=roomFixture;document.body.replaceChildren();const detail=document.createElement('home-dashboard-room-detail');detail.setConfig({type:'custom:home-dashboard-room-detail',room:f.config.rooms[0]});detail.hass=f.hass;document.body.append(detail);window.detailFixture=detail;scrollTo(0,0);});
  assert.equal(await page.getByRole('link',{name:'Ga naar Home',exact:true}).count(),0);
  const detailWidth=await page.locator('home-dashboard-room-detail').evaluate(el=>el.shadowRoot.querySelector('.detail').getBoundingClientRect().width);
  assert.ok(detailWidth>1300);
  await page.screenshot({path:`${directory}/room-detail.png`,fullPage:true});
  // Real editor events, including selector change bubbling, preserve the new fields.
  await page.goto('http://127.0.0.1:4173/editor.html');
  await page.evaluate(()=>document.querySelector('home-dashboard-strategy-editor').addEventListener('config-changed',event=>window.savedRoomConfig=event.detail.config));
  const palette=page.locator('select[data-path="general.palette"]');
  assert.deepEqual(await palette.locator('option').allTextContents(),['Huidig blauw','Warm zand','Rustig salie','Zacht leisteen','Gedempt petrol']);
  await palette.selectOption('quiet_sage');
  assert.equal(await page.evaluate(()=>savedRoomConfig.general.palette),'quiet_sage');
  await page.screenshot({path:`${directory}/palette-selector.png`,fullPage:true});
  await page.locator('[data-section-nav="rooms"]').click();
  await page.locator('details[data-item-token]').first().locator('summary').click();
  await page.locator('input[data-field="home_favorite"]').check();
  await page.locator('input[data-field="controls_enabled"]').check();
  const selector=page.locator('ha-selector[data-field="control_entities"] input');
  const first=['light','fixture_first'].join('.');const second=['cover','fixture_second'].join('.');const third=['light','fixture_third'].join('.');
  await selector.fill([first,second,third].join(', '));await selector.dispatchEvent('change');
  let saved=await page.evaluate(()=>savedRoomConfig.rooms[0]);
  assert.equal(saved.home_favorite,true);assert.equal(saved.controls_enabled,true);assert.deepEqual(saved.control_entities,[first,second,third]);
  await page.locator('[data-room-control-move="down"]').first().click();
  saved=await page.evaluate(()=>savedRoomConfig.rooms[0]);
  assert.deepEqual(saved.control_entities,[first,second,third]);
  await page.locator('[data-room-control-apply]').click();
  saved=await page.evaluate(()=>savedRoomConfig.rooms[0]);
  assert.deepEqual(saved.control_entities,[second,first,third]);
  await page.screenshot({path:`${directory}/editor-ordering.png`,fullPage:true});
  await page.locator('ha-selector[data-field="control_entities"] input').fill('');await page.locator('ha-selector[data-field="control_entities"] input').dispatchEvent('change');
  saved=await page.evaluate(()=>savedRoomConfig.rooms[0]);assert.deepEqual(saved.control_entities,[]);
  assert.deepEqual(errors,[]);
  console.log(`Browserchecks geslaagd: 13 renders, uitlijning, brede kamerdetailpagina, native Home-terugpad, lokale quick-actionvolgorde, vijf kioskroutes, duidelijke specialistlinks, geordende optionele kameracties, afval, focus, touchdoelen en GUI. 100 irrelevante updates: ${performance.ms.toFixed(1)} ms, geen vervanging van kamer-DOM.`);
} finally {await browser.close();}
