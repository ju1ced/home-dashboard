window.HD_FIXTURES = (() => {
  "use strict";

  const roomOverview = [
    { floor: "Gelijkvloers", icon: "sofa", title: "Woonkamer", meta: "21,4° · media actief", value: "3 lampen aan", tone: "active", actions: ["Licht uit", "Media"] },
    { floor: "Gelijkvloers", icon: "utensils", title: "Keuken", meta: "20,9° · alles rustig", value: "Normaal", tone: "normal", actions: ["Licht uit", "Cover"] },
    { floor: "Gelijkvloers", icon: "briefcase", title: "Bureau", meta: "20,8° · niet bezet", value: "Alles uit", tone: "normal", actions: ["Werkmodus", "Licht"] },
    { floor: "Gelijkvloers", icon: "garage", title: "Garage", meta: "Poort open sinds 18:42", value: "Open", tone: "warning", actions: ["Bekijken"] },
    { floor: "Gelijkvloers", icon: "droplet", title: "Bijkeuken", meta: "Toestellen en lekdetectie", value: "Normaal", tone: "normal", actions: ["Licht uit"] },
    { floor: "Gelijkvloers", icon: "bulb", title: "Toilet", meta: "Niet bezet", value: "Uit", tone: "normal", actions: ["Licht"] },
    { floor: "Gelijkvloers", icon: "server", title: "Serverruimte", meta: "UPS en netwerk normaal", value: "24,1°", tone: "normal", actions: ["Diagnose"] },
    { floor: "Gelijkvloers", icon: "door", title: "Inkomhal", meta: "Deur dicht · alarm gereed", value: "Veilig", tone: "normal", actions: ["Licht", "Alarm"] },
    { floor: "Gelijkvloers", icon: "utensils", title: "Eetkamer", meta: "Alles rustig", value: "Uit", tone: "normal", actions: ["Avondscene", "Cover"] },
    { floor: "Gelijkvloers", icon: "archive", title: "Berging", meta: "Geen activiteit", value: "Normaal", tone: "normal", actions: ["Licht"] },
    { floor: "Boven", icon: "bath", title: "Badkamer", meta: "22,1° · vocht hoger", value: "68%", tone: "warning", actions: ["Ventilatie", "Cover"] },
    { floor: "Boven", icon: "bed", title: "Slaapkamer", meta: "19,6° · rustig", value: "Normaal", tone: "normal", actions: ["Nachtmodus", "Cover"] },
    { floor: "Boven", icon: "bed", title: "Kinderkamer", meta: "20,2° · rustig", value: "Normaal", tone: "normal", actions: ["Nachtlicht", "Cover"] },
    { floor: "Boven", icon: "bed", title: "Logeerkamer", meta: "Niet bezet", value: "Eco", tone: "normal", actions: ["Licht", "Comfort"] },
    { floor: "Boven", icon: "door", title: "Hal boven", meta: "Geen beweging", value: "Uit", tone: "normal", actions: ["Licht"] },
    { floor: "Buiten", icon: "car", title: "Oprit", meta: "Auto aangesloten", value: "Laden", tone: "active", actions: ["Camera", "Licht"] },
    { floor: "Buiten", icon: "leaf", title: "Tuin & terras", meta: "2 zones droog", value: "Aandacht", tone: "warning", actions: ["Bewatering", "Luifel"] },
    { floor: "Buiten", icon: "pool", title: "Zwembad", meta: "Waterkwaliteit normaal", value: "27,2°", tone: "normal", actions: ["Filter", "Details"] },
    { floor: "Buiten", icon: "utensils", title: "Buitenkeuken", meta: "Geen activiteit", value: "Uit", tone: "normal", actions: ["Licht", "Stopcontact"] },
    { floor: "Buiten", icon: "home", title: "Tuinhuis", meta: "Gesloten en veilig", value: "Normaal", tone: "normal", actions: ["Licht", "Camera"] }
  ];

  const energy = {
    balance: "−1,3 kW",
    balanceMeta: "Nu terugleveren aan het net",
    metrics: [
      { icon: "sun", label: "Zon", value: "2,4 kW", meta: "Vandaag 14,8 kWh", tone: "active" },
      { icon: "home", label: "Woning", value: "1,1 kW", meta: "Vandaag 8,6 kWh", tone: "normal" },
      { icon: "energy", label: "Net", value: "−1,3 kW", meta: "Teruglevering", tone: "normal" },
      { icon: "car", label: "Auto", value: "3,6 kW", meta: "Laden gepland", tone: "active" }
    ],
    cost: "€ 2,84",
    peak: "4,7 kW",
    water: "286 l",
    battery: "64%",
    insights: [
      { label: "Zelfvoorziening", value: "71%", meta: "Vandaag", tone: "active" },
      { label: "Zon zelf gebruikt", value: "58%", meta: "8,6 kWh lokaal", tone: "normal" },
      { label: "Netbalans", value: "−6,2 kWh", meta: "Meer export dan import", tone: "normal" },
      { label: "CO₂-intensiteit", value: "124 g/kWh", meta: "Gemiddeld vandaag", tone: "normal" }
    ],
    sources: [
      { label: "Netafname", energy: "6,4 kWh", cost: "€ 1,92" },
      { label: "Teruglevering", energy: "12,6 kWh", cost: "−€ 0,88" },
      { label: "Zonneproductie", energy: "14,8 kWh", cost: "—" },
      { label: "Batterij in / uit", energy: "4,1 / 3,2 kWh", cost: "—" },
      { label: "Water", energy: "286 l", cost: "€ 1,04" }
    ],
    devices: [
      { label: "Warmtepomp", value: "3,1 kWh", meta: "36% van woning" },
      { label: "Auto laden", value: "2,7 kWh", meta: "Sessie actief" },
      { label: "Keukentoestellen", value: "1,2 kWh", meta: "5 gemeten apparaten" },
      { label: "Mediahoek", value: "0,6 kWh", meta: "Stand-by inbegrepen" }
    ],
    phases: ["L1 231 V", "L2 230 V", "L3 232 V"]
  };

  const today = {
    weather: {
      summary: "Lichte regen",
      temperature: "17,2 °C",
      range: "19° / 12°",
      days: [
        { day: "Za", icon: "sun", range: "19° / 11°" },
        { day: "Zo", icon: "sun", range: "20° / 10°" },
        { day: "Ma", icon: "cloud", range: "18° / 12°" }
      ]
    },
    waste: [
      { label: "Restafval", date: "Woensdag", meta: "over 5 dagen" },
      { label: "GFT", date: "Woensdag", meta: "over 5 dagen" }
    ],
    rail: [
      { icon: "sun", label: "Zon", value: "2,4 kW" },
      { icon: "energy", label: "Net", value: "−1,3 kW" },
      { icon: "home", label: "Woning", value: "1,1 kW" },
      { icon: "car", label: "Laden", value: "3,6 kW" }
    ]
  };

  const cameras = [
    { name: "Oprit", location: "Buiten", status: "Live", privacy: false, tone: "normal", scene: "driveway" },
    { name: "Inkomhal", location: "Binnen", status: "Privémodus", privacy: true, tone: "active", scene: "hall" },
    { name: "Tuin", location: "Buiten", status: "Live", privacy: false, tone: "normal", scene: "garden" }
  ];

  const room = {
    name: "Woonkamer",
    subtitle: "Gelijkvloers · recent bijgewerkt",
    context: ["21,4 °C", "52% vocht", "bezet"],
    devices: [
      { icon: "bulb", title: "Hoofdverlichting", meta: "Warm wit · 60%", value: "Aan", tone: "active", control: "toggle" },
      { icon: "sparkles", title: "Sfeerverlichting", meta: "Avondprofiel", value: "Uit", tone: "normal", control: "toggle" },
      { icon: "thermostat", title: "Thermostaat", meta: "Doel 21 °C", value: "21,4°", tone: "normal", control: "stepper" },
      { icon: "blinds", title: "Raamcover", meta: "Open", value: "35%", tone: "normal", control: "slider" }
    ],
    media: { icon: "speaker", title: "Woonkamer speaker", meta: "Radio Nova · zacht volume", value: "Speelt", tone: "active" },
    ambient: [
      { icon: "thermostat", label: "Temperatuur", value: "21,4 °C", tone: "normal" },
      { icon: "droplet", label: "Vocht", value: "52%", tone: "normal" },
      { icon: "air", label: "CO₂", value: "816 ppm", tone: "warning" },
      { icon: "sun", label: "Licht", value: "18 lux", tone: "normal" },
      { icon: "users", label: "Aanwezigheid", value: "Bezet", tone: "active" },
      { icon: "window", label: "Openingen", value: "Gesloten", tone: "normal" }
    ],
    climate: {
      current: "21,4 °C",
      target: "21,0 °C",
      status: "Inactief",
      modes: ["Uit", "Verwarmen", "Koelen", "Auto"],
      presets: ["Geen", "Afwezig", "Boost"],
      fan: "Auto",
      swing: "Comfort"
    },
    appliances: [
      { icon: "energy", title: "Vloerverwarming", value: "0 W", meta: "Vandaag 1,8 kWh · Auto" },
      { icon: "speaker", title: "Mediahoek", value: "176 W", meta: "Vandaag 0,6 kWh · 231 V" },
      { icon: "energy", title: "Sfeerstopcontact", value: "4 W", meta: "Vandaag 0,1 kWh · aan" },
      { icon: "blinds", title: "Raamcover", value: "35%", meta: "Open · batterij 91%" }
    ],
    safety: [
      { icon: "window", title: "Ramen", meta: "Alles gesloten", value: "Veilig", tone: "normal" },
      { icon: "smoke", title: "Rookmelder", meta: "Laatste test 6 dagen geleden", value: "Normaal", tone: "normal" }
    ]
  };

  const specialistBase = {
    kia: { icon: "car", eyebrow: "Mobiliteit", title: "Kia EV", status: "Laden", metric: "68%", meta: "312 km bereik · 8 min geleden", tone: "active" },
    robot: { icon: "vacuum", eyebrow: "Schoonmaak", title: "Robot", status: "Bezig", metric: "42%", meta: "Woonkamer · 31 min resterend", tone: "active" },
    garden: { icon: "leaf", eyebrow: "Buiten", title: "Tuin", status: "Aandacht", metric: "2 droog", meta: "Irrigatie uit · geen regen", tone: "warning" },
    pool: { icon: "pool", eyebrow: "Water", title: "Zwembad", status: "In orde", metric: "27,2°", meta: "pH 7,3 · filter actief", tone: "normal" }
  };

  return {
    warning: {
      context: [
        { icon: "users", label: "2 thuis", tone: "normal" },
        { icon: "cloud", label: "17° · droog", tone: "normal" },
        { icon: "shield", label: "1 aandachtspunt", tone: "warning" }
      ],
      people: [
        { initials: "A", name: "Alex", status: "Thuis", meta: "Sinds 17:42", tone: "normal" },
        { initials: "S", name: "Sam", status: "Sportclub", meta: "8 min geleden", tone: "active" }
      ],
      alerts: [{ tone: "warning", icon: "garage", title: "Garagedeur staat nog open", detail: "Sinds 18:42 · bekijk beveiliging", action: "Bekijken" }],
      now: [
        { icon: "car", title: "Auto laadt", meta: "3,6 kW · klaar rond 23:10", tone: "active" },
        { icon: "vacuum", title: "Robot is bezig", meta: "Woonkamer · 42% batterij", tone: "active" },
        { icon: "droplet", title: "Hoger watergebruik", meta: "Nu 18 l/min · controleer", tone: "warning" }
      ],
      rooms: roomOverview.slice(0, 3),
      roomOverview,
      cameras,
      specialists: specialistBase,
      today,
      energy,
      room
    },

    normal: {
      context: [
        { icon: "users", label: "2 thuis", tone: "normal" },
        { icon: "cloud", label: "17° · droog", tone: "normal" },
        { icon: "shield", label: "Alles veilig", tone: "normal" }
      ],
      people: [
        { initials: "A", name: "Alex", status: "Thuis", meta: "Telefoon 78% · horloge 64%", tone: "normal" },
        { initials: "S", name: "Sam", status: "Thuis", meta: "Telefoon 83%", tone: "normal" }
      ],
      alerts: [],
      now: [{ icon: "sun", title: "Zonne-energie actief", meta: "2,4 kW · woning gebruikt 1,1 kW", tone: "normal" }],
      rooms: roomOverview.filter((item) => item.tone === "normal").slice(0, 3),
      roomOverview: roomOverview.map((item) => ({ ...item, tone: "normal", value: item.title === "Zwembad" ? "27,2°" : "Normaal" })),
      cameras,
      today,
      specialists: {
        kia: { ...specialistBase.kia, status: "Geparkeerd", metric: "82%", meta: "376 km bereik · 12 min geleden", tone: "normal" },
        robot: { ...specialistBase.robot, status: "Op basis", metric: "100%", meta: "Volgende ronde morgen 10:00", tone: "normal" },
        garden: { ...specialistBase.garden, status: "In orde", metric: "0 droog", meta: "Irrigatie uit · regen verwacht", tone: "normal" },
        pool: specialistBase.pool
      },
      energy,
      room: { ...room, subtitle: "Gelijkvloers · alles werkt" }
    },

    unavailable: {
      context: [
        { icon: "users", label: "1 thuis", tone: "normal" },
        { icon: "cloud", label: "Weer niet beschikbaar", tone: "unavailable" },
        { icon: "shield", label: "Deels gecontroleerd", tone: "warning" }
      ],
      people: [
        { initials: "A", name: "Alex", status: "Thuis", meta: "Sinds 17:42", tone: "normal" },
        { initials: "S", name: "Sam", status: "Locatie onbekend", meta: "Bron niet beschikbaar", tone: "unavailable" }
      ],
      alerts: [{ tone: "unavailable", icon: "offline", title: "Klimaatstatus woonkamer niet beschikbaar", detail: "Andere functies blijven bruikbaar · bekijk bronstatus", action: "Diagnose" }],
      now: [],
      rooms: [
        { ...roomOverview[0], meta: "Klimaatstatus ontbreekt", value: "Deels offline", tone: "unavailable" },
        roomOverview[2]
      ],
      roomOverview: roomOverview.map((item, index) => index === 0 ? { ...item, meta: "Klimaatstatus ontbreekt", value: "Deels offline", tone: "unavailable" } : item),
      cameras: cameras.map((camera, index) => index === 2 ? { ...camera, status: "Stream niet beschikbaar", tone: "unavailable" } : camera),
      specialists: {
        kia: { ...specialistBase.kia, status: "Niet actueel", metric: "—", meta: "Laatste betrouwbare update 2 uur geleden", tone: "unavailable" },
        robot: { ...specialistBase.robot, status: "Op basis", metric: "100%", meta: "Kaartbron niet beschikbaar", tone: "warning" },
        garden: { ...specialistBase.garden, status: "In orde", metric: "0 droog", meta: "1 optionele zone offline", tone: "normal" },
        pool: { ...specialistBase.pool, status: "Deels actueel", meta: "1 optionele sensor offline", tone: "warning" }
      },
      today: {
        ...today,
        weather: { ...today.weather, summary: "Weerbron niet beschikbaar", temperature: "—", days: [] }
      },
      energy: { ...energy, balance: "—", balanceMeta: "Netmeting tijdelijk niet beschikbaar" },
      room: {
        ...room,
        subtitle: "Gelijkvloers · één bron ontbreekt",
        context: ["temperatuur —", "52% vocht", "bezet"],
        devices: room.devices.map((item, index) => index === 2 ? { ...item, meta: "Controleer de klimaatbron", value: "Niet beschikbaar", tone: "unavailable", control: "none" } : item)
      }
    }
  };
})();
