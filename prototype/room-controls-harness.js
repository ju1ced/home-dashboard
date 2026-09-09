// All identifiers are assembled from fictional logical keys; no installation data.
class FixtureIcon extends HTMLElement {
  set icon(value) {
    const paths = {
      bulb:'M9 18h6M10 21h4M8 14a6 6 0 1 1 8 0l-1 3H9zM12 1v2M2 10h2M20 10h2',
      cover:'M4 3h16v18H4zM4 7h16M4 11h16M4 15h16M4 19h16',
      radio:'M4 7h16v14H4zM6 7l12-5M15 12h3M15 16h3M11 15a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
      sofa:'M4 12V7h16v5M2 11h4v7h12v-7h4v10H2z',
      awning:'M3 11l3-7h12l3 7zM5 11v10M19 11v10M5 17h14',
      arrow:'M9 5l7 7-7 7',
      down:'M5 9l7 7 7-7',
      left:'M15 5l-7 7 7 7',
      weather:'M6 18h12a4 4 0 0 0 0-8 6 6 0 0 0-11-2 5 5 0 0 0-1 10',
      generic:'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5'
    };
    const key=/lightbulb/.test(value)?'bulb':/shutter/.test(value)?'cover':/radio|speaker|play/.test(value)?'radio':/sofa|chair/.test(value)?'sofa':/awning/.test(value)?'awning':/chevron-down/.test(value)?'down':/chevron-left/.test(value)?'left':/chevron|arrow/.test(value)?'arrow':/weather/.test(value)?'weather':'generic';
    this.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="display:block;width:100%;height:100%"><path d="${paths[key]}"/></svg>`;
  }
}
customElements.define('ha-icon',FixtureIcon);
window.loadCardHelpers=async()=>({createCardElement:()=>{
  const element=document.createElement('div');element.style.cssText='min-height:245px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(#d9eaf2 60%,#aec5a2 60%);color:#284154;text-align:center';
  element.textContent='Fictieve tuinpreview';return element;
}});
const {migrateConfig}=await import('/dist/home-dashboard.js');
const params=new URLSearchParams(location.search);
document.body.classList.toggle('dark',params.get('theme')==='dark');
const ref=(domain,key)=>[domain,`fixture_${key}`].join('.');
const states={};
const put=(domain,key,state,attributes={})=>{const entity=ref(domain,key); states[entity]={state,attributes,last_updated:'2020-01-01T00:00:00Z'};return entity;};
const rooms=['Woonkamer','Bureau','Keuken','Terras'].map((name,index)=>({
  key:`room_${index}`,name,area_id:`EXAMPLE_AREA_${index}`,icon:index===3?'mdi:awning-outline':'mdi:sofa',home_favorite:true,controls_enabled:true,
  control_light_entity:put('light',`light_${index}`,index<2?'on':'off',{friendly_name:`${name} lichten`}),
  control_cover_entity:index<3?put('cover',`cover_${index}`,'open',{friendly_name:`${name} rolluik`,supported_features:11,device_class:'shutter'}):'',
  control_awning_entity:index===0||index===3?put('cover',`awning_${index}`,'closed',{friendly_name:`${name} luifel`,supported_features:11,device_class:'awning'}):'',
  control_media_entity:put('media_player',`radio_${index}`,index<2?'playing':'idle',{friendly_name:`${name} radio`,supported_features:16385}),
  hvac:{entity:index<3?put('climate',`climate_${index}`,'heat',{temperature:21,current_temperature:20,hvac_action:'heating',friendly_name:`${name} klimaat`}):'',comfort_entities:[put('sensor',`temperature_${index}`,String(21-index),{unit_of_measurement:'°C'})]}
}));
const config=migrateConfig({rooms,today:{enabled:true,weather_entity:put('weather','weather','cloudy',{temperature:19,temperature_unit:'°C'}),forecast_days:3,
  battery_soc_entity:put('sensor','battery','42',{unit_of_measurement:'%'}),battery_charge_power_entity:put('sensor','charge','0',{unit_of_measurement:'W'}),battery_discharge_power_entity:put('sensor','discharge','0',{unit_of_measurement:'W'}),solar_power_entity:put('sensor','solar','320',{unit_of_measurement:'W'}),home_consumption_entity:put('sensor','consumption','860',{unit_of_measurement:'W'}),monthly_capacity_peak_entity:put('sensor','peak','4.2',{unit_of_measurement:'kW'}),
  waste_entities:['GFT','Restafval','Papier','PMD'].map((name,i)=>put('sensor',`waste_${i}`,`2026-09-${i<2?'09':'16'}`,{friendly_name:name}))},
  security:{enabled:true,cameras:[{key:'garden',name:'Tuin',camera_entity:put('camera','garden','idle'),privacy_entity:put('input_boolean','garden_privacy','off')},{key:'private',name:'Binnen',camera_entity:put('camera','private','idle'),privacy_entity:put('input_boolean','inside_privacy','on')}]},
  persons:['Bewoner A','Bewoner B'].map((label,i)=>({key:`person_${i}`,label,entity:put('person',`person_${i}`,'home')})),specialists:{kia:{enabled:true},robot:{enabled:true},garden:{enabled:true}}
}).config;
// Include non-favorite safety to prove warnings do not depend on Home selection.
config.rooms.push(migrateConfig({rooms:[{key:'hall',name:'Hal',area_id:'EXAMPLE_HALL',safety_entities:[put('binary_sensor','safety','off',{friendly_name:'Veiligheid hal'})]}]}).config.rooms[0]);
const variant=params.get('fixture')||'normal';
if(variant==='warning') states[ref('binary_sensor','safety')].state='unsafe';
if(variant==='missing') { delete states[config.rooms[0].control_light_entity]; delete states[config.today.waste_entities[0]]; }
if(variant==='unavailable') { states[config.rooms[0].control_cover_entity].state='unavailable'; states[config.today.battery_soc_entity].state='unavailable'; }
const calls=[];
const hass={states,connection:{subscribeMessage:async callback=>{queueMicrotask(()=>callback({forecast:[{datetime:'2026-09-08',condition:'cloudy',temperature:22,templow:14},{datetime:'2026-09-09',condition:'sunny',temperature:24,templow:15},{datetime:'2026-09-10',condition:'cloudy',temperature:21,templow:13}]}));return ()=>{};}},
  callService:async(domain,service,data)=>{calls.push({domain,service,data});if(window.fixtureReject)throw Error('fixture refusal');}
};
const home=document.querySelector('home-dashboard-home-overview');
home.setConfig({type:'custom:home-dashboard-home-overview',...config,theme_mode:'system',navigation_mode:params.get('navigation')==='native'?'native':params.get('navigation')==='kiosk'?'kiosk':'integrated'});home.hass=hass;
window.roomFixture={home,hass,config,calls,ref};
