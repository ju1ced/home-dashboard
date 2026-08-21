(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const view = params.get("view") || "home";
  const fixtureName = params.get("state") || "warning";
  const theme = params.get("theme") || "light";
  const clean = params.get("clean") === "1";
  const fixture = window.HD_FIXTURES[fixtureName] || window.HD_FIXTURES.warning;

  const iconPaths = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/>',
    rooms: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    domains: '<path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="9"/>',
    more: '<circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c.4-4 2.4-6 6-6s5.6 2 6 6"/><path d="M16 5.5a3 3 0 0 1 0 5.5M17 14c2.4.5 3.7 2.4 4 5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.4-5 3-7 8-7s7.6 2 8 7"/>',
    cloud: '<path d="M6 18h11a4 4 0 0 0 .7-7.9A6 6 0 0 0 6.5 8.5 4.8 4.8 0 0 0 6 18Z"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.8 3 7.8 7.5 9.5 4.5-1.7 7.5-4.7 7.5-9.5V6L12 3Z"/><path d="m9 12 2 2 4-4"/>',
    garage: '<path d="M3 10 12 4l9 6v10H3V10Z"/><path d="M7 20v-7h10v7M7 16h10"/>',
    car: '<path d="m5 11 2-5h10l2 5"/><path d="M4 11h16v7H4v-7Z"/><circle cx="7" cy="15" r="1" fill="currentColor"/><circle cx="17" cy="15" r="1" fill="currentColor"/><path d="M6 18v2M18 18v2"/>',
    vacuum: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M7 6.5 5 4M17 6.5 19 4M8 18l-2 3M16 18l2 3"/>',
    droplet: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11Z"/><path d="M9 15a3 3 0 0 0 3 2"/>',
    sofa: '<path d="M5 12V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4"/><path d="M3 12a2 2 0 0 1 4 0v3h10v-3a2 2 0 0 1 4 0v7H3v-7Z"/><path d="M6 19v2M18 19v2"/>',
    bath: '<path d="M3 13h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-2Z"/><path d="M6 13V7a3 3 0 0 1 6 0"/><path d="M8 20v1M16 20v1"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V4h6v3M3 12h18M10 12v2h4v-2"/>',
    leaf: '<path d="M20 4C11 4 5 8 5 15c0 3 2 5 5 5 7 0 10-7 10-16Z"/><path d="M4 21c3-6 7-9 12-12"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
    offline: '<path d="M2 8.8A15.5 15.5 0 0 1 5 6.5M9 4.2A15.7 15.7 0 0 1 22 8.8M5 13a10.5 10.5 0 0 1 3-2M12 10.5a10.4 10.4 0 0 1 7 2.5M8.5 17.2a5 5 0 0 1 7 0M12 21h.01M3 3l18 18"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M8.5 15.5A6 6 0 1 1 15.5 15.5c-.8.6-1 1.2-1 2.5h-5c0-1.3-.2-1.9-1-2.5Z"/>',
    sparkles: '<path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14ZM19 13l.7 1.8 1.8.7-1.8.7L19 18l-.7-1.8-1.8-.7 1.8-.7L19 13Z"/>',
    thermostat: '<path d="M10 14.8V5a2 2 0 1 1 4 0v9.8a4 4 0 1 1-4 0Z"/><path d="M12 8v8"/>',
    blinds: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 8h16M4 13h16M4 18h16"/>',
    speaker: '<rect x="5" y="3" width="14" height="18" rx="3"/><circle cx="12" cy="14" r="4"/><circle cx="12" cy="8" r="1"/>',
    window: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M12 3v18M4 12h16"/>',
    smoke: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M8 5.2 6 3M16 5.2 18 3"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    energy: '<path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/>',
    pool: '<path d="M3 8c3-2 5 2 8 0s5 2 10 0M3 14c3-2 5 2 8 0s5 2 10 0M3 20c3-2 5 2 8 0s5 2 10 0"/>',
    moon: '<path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/>',
    log: '<path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
    utensils: '<path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-2 3-2 7 0 9h2V3h-2ZM18 12v9"/>',
    server: '<rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01M11 7h7M11 17h7"/>',
    door: '<path d="M5 21V4l13-2v19M5 21h15"/><circle cx="14" cy="12" r=".6" fill="currentColor"/>',
    archive: '<path d="M4 7h16v14H4zM3 3h18v4H3zM9 11h6"/>',
    bed: '<path d="M3 20V9M21 20V9M3 16h18M7 9V6h5a4 4 0 0 1 4 4v6M3 12h4V9H3"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20V7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    air: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a2 2 0 1 1-2 2M3 16h9a3 3 0 1 1-3 3"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
    compare: '<path d="M8 4 4 8l4 4M4 8h13M16 20l4-4-4-4M20 16H7"/>'
    ,camera: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="m8 6 1.5-3h5L16 6"/><circle cx="12" cy="13" r="4"/>'
  };

  function icon(name, className) {
    return `<svg class="icon ${className || ""}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name] || iconPaths.more}</svg>`;
  }

  function withParams(nextView, extras) {
    const next = new URLSearchParams(params);
    next.set("view", nextView);
    Object.entries(extras || {}).forEach(([key, value]) => next.set(key, value));
    return `?${next.toString()}`;
  }

  const viewItems = [
    { id: "home", label: "Home", href: "home" },
    { id: "rooms", label: "Kamers", href: "rooms" },
    { id: "energy", label: "Energie", href: "energy" },
    { id: "domains", label: "Domeinen", href: "integrations" },
    { id: "more", label: "Meer", href: "more" }
  ];

  const haItems = [
    { label: "Huis in beeld", icon: "home", active: true },
    { label: "Kaart", icon: "map" },
    { label: "Logboek", icon: "log" },
    { label: "Instellingen", icon: "settings" }
  ];

  function activeView(id) {
    if (["rooms", "room"].includes(view)) return id === "rooms";
    if (view === "energy") return id === "energy";
    if (["integrations", "specialist", "pool"].includes(view)) return id === "domains";
    if (view === "more") return id === "more";
    return id === "home";
  }

  function renderHaNav() {
    return haItems.map((item) => `<a class="side-nav-item ${item.active ? "is-active" : ""}" href="${item.active ? withParams("home") : "#"}">${icon(item.icon)}<span>${item.label}</span></a>`).join("");
  }

  function renderViewTabs() {
    return viewItems.map((item) => `<a class="view-tab ${activeView(item.id) ? "is-active" : ""}" href="${withParams(item.href)}" ${activeView(item.id) ? 'aria-current="page"' : ""}>${item.label}</a>`).join("");
  }

  function statusPill(label, tone) {
    return `<span class="status-pill tone-${tone || "normal"}">${label}</span>`;
  }

  function contextChips() {
    return fixture.context.map((item) => `<span class="context-chip tone-${item.tone}">${icon(item.icon)}<span>${item.label}</span></span>`).join("");
  }

  function sectionHeading(title, detail, action, href) {
    const actionMarkup = action ? `<a class="text-action" href="${href || "#"}">${action}${icon("chevron")}</a>` : "";
    return `<div class="section-heading"><div><h2>${title}</h2>${detail ? `<p>${detail}</p>` : ""}</div>${actionMarkup}</div>`;
  }

  function alertCard(alert) {
    return `<article class="attention-card tone-${alert.tone}"><span class="attention-icon">${icon(alert.icon)}</span><div><span class="attention-label">${alert.tone === "unavailable" ? "Bronstatus" : "Aandacht nodig"}</span><h2>${alert.title}</h2><p>${alert.detail}</p></div><button class="attention-action" type="button">${alert.action}${icon("arrow")}</button></article>`;
  }

  function compactStateCard(item) {
    return `<article class="state-card tone-${item.tone}"><span class="state-icon">${icon(item.icon)}</span><div class="state-copy"><strong>${item.title}</strong><span>${item.meta}</span></div>${icon("chevron", "state-chevron")}</article>`;
  }

  function personCard(person) {
    const { tone, initials, name, meta, status } = person;
    return `<a class="person-card tone-${tone}" href="${withParams("more")}"><span class="person-avatar">${initials}</span><span class="person-copy"><strong>${name}</strong><small>${meta}</small></span><span class="person-state">${status}</span>${icon("chevron")}</a>`;
  }

  function cameraCard(camera) {
    const { privacy, tone, scene, status, name, location } = camera;
    const privacyLabel = privacy ? "Privacy aan" : "Privacy uit";
    return `<article class="camera-card tone-${tone}"><div class="camera-preview scene-${scene}"><span class="camera-live">${tone === "unavailable" ? icon("offline") : icon("camera")}${status}</span><span class="camera-scene-mark" aria-hidden="true"></span></div><div class="camera-info"><div><strong>${name}</strong><small>${location}</small></div>${statusPill(status, tone)}</div><div class="privacy-control"><span><strong>${privacyLabel}</strong><small>${privacy ? "Geen livebeeld" : "Camera actief"}</small></span><button class="privacy-toggle ${privacy ? "is-private" : ""}" type="button" aria-label="Privacystand ${name} aanpassen" aria-pressed="${privacy}"><i></i></button></div></article>`;
  }

  function roomCard(room) {
    return `<article class="room-card tone-${room.tone}"><div class="room-card-top"><span class="room-icon">${icon(room.icon)}</span>${statusPill(room.value, room.tone)}</div><div><h3>${room.title}</h3><p>${room.meta}</p></div><a href="${withParams("room")}" aria-label="Bekijk ${room.title}">${icon("arrow")}</a></article>`;
  }

  function roomOverviewCard(room) {
    return `<article class="room-overview-card tone-${room.tone}"><a class="room-overview-main" href="${withParams(room.title === "Zwembad" ? "pool" : "room")}"><span class="room-icon">${icon(room.icon)}</span><span><strong>${room.title}</strong><small>${room.meta}</small></span>${statusPill(room.value, room.tone)}${icon("chevron")}</a><div class="room-actions">${room.actions.map((action) => `<button type="button">${action}</button>`).join("")}</div></article>`;
  }

  function specialistHref(key) {
    return key === "pool" ? withParams("pool") : withParams("specialist", { card: key });
  }

  function specialistCard(data, key, large) {
    return `<article class="specialist-card tone-${data.tone} ${large ? "is-large" : ""}"><div class="specialist-head"><span class="specialist-icon">${icon(data.icon)}</span><div><span class="card-eyebrow">${data.eyebrow}</span><h3>${data.title}</h3></div>${statusPill(data.status, data.tone)}</div><div class="specialist-metric"><strong>${data.metric}</strong><span>${data.meta}</span></div>${large ? specialistDetails(key, data) : ""}<a class="card-link" href="${specialistHref(key)}">Volledig dashboard${icon("arrow")}</a></article>`;
  }

  function specialistDetails(key, data) {
    const rows = {
      kia: [["Laadstatus", data.status], ["Bereik", data.tone === "unavailable" ? "—" : "312 km"], ["Dataversheid", data.meta.split("·").pop().trim()]],
      robot: [["Huidige taak", data.status], ["Voortgang", data.tone === "warning" ? "Kaart beperkt" : "Woonkamer"], ["Onderhoud", "Geen actie nodig"]],
      garden: [["Droge zones", data.metric], ["Irrigatie", "Uit"], ["Weercontext", "Geen regen vandaag"]],
      pool: [["Waterkwaliteit", data.status], ["Filter", "Actief"], ["Verwarming", "Stand-by"]]
    };
    return `<div class="detail-list">${rows[key].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("")}</div>`;
  }

  function quickAction(iconName, title, detail) {
    return `<button class="quick-action" type="button"><span>${icon(iconName)}</span><span><strong>${title}</strong><small>${detail}</small></span></button>`;
  }

  function domainCard(iconName, title, meta, href) {
    return `<a class="domain-card" href="${href || "#"}"><span>${icon(iconName)}</span><span><strong>${title}</strong><small>${meta}</small></span>${icon("chevron")}</a>`;
  }

  function renderToday() {
    const { weather, waste, rail } = fixture.today;
    const forecast = weather.days.length ? weather.days.map((day) => `<div class="forecast-day"><span>${day.day}</span>${icon(day.icon)}<strong>${day.range}</strong></div>`).join("") : `<div class="forecast-missing">Geen betrouwbare verwachting</div>`;
    return `<section class="dashboard-section today-section">${sectionHeading("Vandaag", "Weer, ophaling en energiestatus in één compacte strook", "Volledig energieoverzicht", withParams("energy"))}<div class="today-grid"><article class="weather-card"><div class="weather-now"><span>${icon(weather.days.length ? "cloud" : "offline")}</span><div><strong>${weather.summary}</strong><small>Thuis · ${weather.range}</small></div><b>${weather.temperature}</b></div><div class="forecast-row">${forecast}</div></article><div class="today-side"><div class="status-rail">${rail.map((item) => `<a href="${withParams("energy")}"><span>${icon(item.icon)}</span><small>${item.label}</small><strong>${item.value}</strong></a>`).join("")}</div><div class="waste-grid">${waste.map((item) => `<article><span>${icon("calendar")}</span><div><strong>${item.label}</strong><small>${item.date} · ${item.meta}</small></div></article>`).join("")}</div></div></div></section>`;
  }

  function renderHome() {
    const alerts = fixture.alerts.length ? fixture.alerts.map(alertCard).join("") : `<article class="calm-card"><span>${icon("shield")}</span><div><strong>Alles rustig</strong><p>Er zijn geen operationele aandachtspunten.</p></div></article>`;
    const nowItems = fixture.now.length ? fixture.now.map(compactStateCard).join("") : `<div class="empty-inline">${icon("sun")}<span>Geen actieve uitzonderingen</span></div>`;
    return `
      <section class="attention-stack" aria-label="Aandacht">${alerts}</section>
      ${renderToday()}
      <section class="dashboard-section people-section">${sectionHeading("Gezin", "Individuele aanwezigheid zonder adres of coördinaten", "Aanwezigheid", withParams("more"))}<div class="people-grid">${fixture.people.map(personCard).join("")}</div></section>
      <section class="dashboard-section security-section">${sectionHeading("Beveiliging & privacy", "Veeg door camera’s; privacystand blijft per camera zichtbaar", "Beveiliging", "#")}<div class="camera-carousel">${fixture.cameras.map(cameraCard).join("")}</div><p class="security-note">Privacy uitschakelen is een gevoelige actie en vraagt in de echte kaart altijd een expliciete bevestiging.</p></section>
      <div class="home-columns"><section class="dashboard-section">${sectionHeading("Nu actief", "Alleen wat de normale toestand doorbreekt")}<div class="state-list">${nowItems}</div></section><section class="dashboard-section quick-section">${sectionHeading("Snelle acties", "Klein, expliciet en omkeerbaar")}<div class="quick-grid">${quickAction("moon", "Avondscene", "Rustig licht beneden")}${quickAction("bulb", "Lichten beneden uit", "Beoordeeld script")}</div></section></div>
      <section class="dashboard-section">${sectionHeading("Actieve ruimtes", "Alleen ruimtes die nu relevant zijn", "Alle kamers", withParams("rooms"))}<div class="room-grid">${fixture.rooms.map(roomCard).join("")}</div></section>
      <section class="dashboard-section">${sectionHeading("Specialisten", "Vier vaste ingangen; details openen het volledige dashboard")}<div class="specialist-grid">${Object.entries(fixture.specialists).map(([key, data]) => specialistCard(data, key, false)).join("")}</div></section>
      <section class="dashboard-section domains-section">${sectionHeading("Verder in huis", "Woningbrede domeinen")}<div class="domain-grid">${domainCard("energy", "Energie & water", "Volledige pagina", withParams("energy"))}${domainCard("thermostat", "Klimaat", "Comfort per zone")}${domainCard("lock", "Beveiliging", "Alarm en openingen")}${domainCard("pool", "Zwembad", "Volledig dashboard", withParams("pool"))}</div></section>`;
  }

  function renderRooms() {
    const floors = ["Gelijkvloers", "Boven", "Buiten"];
    return `<section class="overview-hero"><div><span class="card-eyebrow">Alle echte ruimtes</span><h2>Kamers</h2><p>Gegroepeerd per verdieping, met maximaal twee passende quick actions en altijd een detailpad.</p></div><div class="overview-count"><strong>${fixture.roomOverview.length}</strong><span>ruimtes</span></div></section>${floors.map((floor) => `<section class="dashboard-section floor-section">${sectionHeading(floor, floor === "Buiten" ? "Buitenruimtes en voorzieningen" : "Dagelijkse kamers en functies")}<div class="room-overview-grid">${fixture.roomOverview.filter((room) => room.floor === floor).map(roomOverviewCard).join("")}</div></section>`).join("")}`;
  }

  function deviceCard(device) {
    const control = device.control === "toggle" ? `<span class="fake-toggle ${device.tone === "active" ? "is-on" : ""}"><i></i></span>` : device.control === "slider" ? `<span class="fake-slider"><i style="width:${device.value}"></i><b style="left:${device.value}"></b></span>` : device.control === "stepper" ? `<span class="fake-stepper"><button type="button" aria-label="Lager">−</button><button type="button" aria-label="Hoger">+</button></span>` : `<button class="small-link" type="button">Diagnose</button>`;
    return `<article class="device-card tone-${device.tone}"><div class="device-main"><span class="device-icon">${icon(device.icon)}</span><div><h3>${device.title}</h3><p>${device.meta}</p></div></div><div class="device-state"><strong>${device.value}</strong>${control}</div></article>`;
  }

  function renderRoom() {
    const room = fixture.room;
    const { current, target, status: climateStatus, modes, presets: climatePresets, fan, swing } = room.climate;
    const ambient = room.ambient.map((item) => `<article class="ambient-card tone-${item.tone}"><span>${icon(item.icon)}</span><div><small>${item.label}</small><strong>${item.value}</strong></div></article>`).join("");
    const climateModes = modes.map((mode, index) => `<button class="${index === 0 ? "is-active" : ""}" type="button">${mode}</button>`).join("");
    const presets = climatePresets.map((preset, index) => `<button class="${index === 0 ? "is-active" : ""}" type="button">${preset}</button>`).join("");
    const appliances = room.appliances.map((item) => `<article class="appliance-row"><span>${icon(item.icon)}</span><div><strong>${item.title}</strong><small>${item.meta}</small></div><b>${item.value}</b><button type="button" aria-label="Meer informatie over ${item.title}">${icon("chevron")}</button></article>`).join("");
    return `<a class="back-link" href="${withParams("rooms")}">${icon("arrow", "back-arrow")}Alle kamers</a><section class="room-hero"><div><span class="card-eyebrow">Gelijkvloers</span><h2>${room.name}</h2><p>${room.subtitle}</p></div><div class="room-context">${room.context.map((item) => `<span>${item}</span>`).join("")}</div></section>${fixtureName === "unavailable" ? alertCard(fixture.alerts[0]) : ""}<section class="dashboard-section">${sectionHeading("Ruimtestatus", "De belangrijkste sensoren blijven op mobiel direct zichtbaar")}<div class="ambient-grid">${ambient}</div></section><div class="room-layout"><section class="dashboard-section room-primary">${sectionHeading("Bediening", "Licht, cover en primaire toestanden")}<div class="device-grid">${room.devices.map(deviceCard).join("")}</div></section><aside class="room-side"><section class="dashboard-section">${sectionHeading("Media")}<div class="state-list">${compactStateCard(room.media)}</div></section><section class="dashboard-section">${sectionHeading("Veiligheid")}<div class="state-list">${room.safety.map(compactStateCard).join("")}</div></section></aside></div><section class="dashboard-section climate-panel">${sectionHeading("Comfort & klimaat", "Volledige dagelijkse bediening zonder diagnostische ruis")}<div class="climate-main"><div class="climate-state"><span>Kamertemperatuur</span><strong>${current}</strong><small>${climateStatus}</small></div><div class="climate-target"><button type="button" aria-label="Doeltemperatuur verlagen">−</button><div><span>Doel</span><strong>${target}</strong></div><button type="button" aria-label="Doeltemperatuur verhogen">+</button></div></div><div class="climate-controls">${climateModes}</div><div class="climate-subcontrols"><div><span>Preset</span><div>${presets}</div></div><div class="climate-readouts"><span>Ventilator <strong>${fan}</strong></span><span>Swing <strong>${swing}</strong></span></div></div></section><div class="room-detail-layout"><section class="dashboard-section history-panel">${sectionHeading("Historie", "Temperatuur, vocht en luchtkwaliteit · 72 uur")}<div class="room-history"><svg viewBox="0 0 600 170" role="img" aria-label="Fictieve temperatuur-, vocht- en CO2-trends"><path class="grid-line" d="M0 35H600M0 85H600M0 135H600"/><path class="history-temp" d="M0 92 C80 60 120 102 190 76 S300 54 360 90 S480 112 600 68"/><path class="history-air" d="M0 126 C75 122 115 92 180 116 S280 132 345 88 S470 105 600 74"/></svg></div><div class="history-legend"><span><i class="temp"></i>Temperatuur / vocht</span><span><i class="air"></i>CO₂</span></div></section><section class="dashboard-section appliances-panel">${sectionHeading("Apparaten & energie", "Actueel, vandaag en relevante toestand")}<div class="appliance-list">${appliances}</div></section></div><section class="dashboard-section detail-links">${sectionHeading("Meer over deze ruimte", "Beheer en diagnose blijven uit het dagelijkse pad")}<div class="domain-grid">${domainCard("energy", "Energie", "Volledig verbruik per apparaat", withParams("energy"))}${domainCard("sliders", "Meer historie", "Dag, week en maand")}${domainCard("offline", "Diagnostiek", "Bronnen en batterijen")}</div></section>`;
  }

  function renderEnergy() {
    const energy = fixture.energy;
    const bars = [36, 28, 22, 18, 24, 42, 66, 82, 74, 58, 46, 62, 78, 70, 54, 44, 37, 31, 28, 25, 22, 20, 18, 16];
    const sourceRows = energy.sources.map((item) => `<div><span>${item.label}</span><strong>${item.energy}</strong><b>${item.cost}</b></div>`).join("");
    const deviceRows = energy.devices.map((item) => `<div class="device-energy-row"><span>${icon("energy")}</span><div><strong>${item.label}</strong><small>${item.meta}</small></div><b>${item.value}</b></div>`).join("");
    return `<section class="energy-toolbar"><div class="period-tabs"><button type="button">Dag</button><button class="is-active" type="button">Week</button><button type="button">Maand</button><button type="button">Jaar</button></div><button class="compare-button" type="button">${icon("compare")}Vergelijk met vorige periode</button></section><section class="energy-hero"><div><span class="card-eyebrow">Actuele energiebalans</span><strong>${energy.balance}</strong><p>${energy.balanceMeta}</p></div><div class="energy-flow">${icon("sun")}<span></span>${icon("home")}<span></span>${icon("energy")}</div></section><section class="energy-metrics">${energy.metrics.map((item) => `<article class="energy-metric tone-${item.tone}"><span>${icon(item.icon)}</span><div><small>${item.label}</small><strong>${item.value}</strong><p>${item.meta}</p></div></article>`).join("")}</section><div class="energy-layout"><section class="dashboard-section energy-chart-card">${sectionHeading("Energie vandaag", "Verbruik, productie en teruglevering per uur", "Per bron", "#")}<div class="energy-chart" role="img" aria-label="Fictieve energiecurve over 24 uur">${bars.map((height, index) => `<i class="${index > 6 && index < 17 ? "solar" : ""}" style="height:${height}%"></i>`).join("")}</div><div class="chart-axis"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>Nu</span></div></section><aside class="energy-side"><section class="dashboard-section energy-summary">${sectionHeading("Vandaag")}<div class="summary-row"><span>Kost</span><strong>${energy.cost}</strong></div><div class="summary-row"><span>Kwartierpiek</span><strong>${energy.peak}</strong></div><div class="summary-row"><span>Batterij</span><strong>${energy.battery}</strong></div><div class="summary-row"><span>Water</span><strong>${energy.water}</strong></div><div class="phase-row">${energy.phases.map((phase) => `<span>${phase}</span>`).join("")}</div></section><section class="dashboard-section energy-summary">${sectionHeading("Laden")}<div class="charge-status"><span>${icon("car")}</span><div><strong>Auto laadt gepland</strong><small>Vertrekklaar tegen 07:30</small></div></div><button class="safe-action" type="button">Laadplanning bekijken</button></section></aside></div><section class="dashboard-section">${sectionHeading("Energie-inzichten", "Dezelfde kernindicatoren als het standaard Energy-dashboard")}<div class="energy-insights">${energy.insights.map((item) => `<article class="tone-${item.tone}"><span>${item.label}</span><strong>${item.value}</strong><small>${item.meta}</small></article>`).join("")}</div></section><div class="energy-detail-grid"><section class="dashboard-section energy-table">${sectionHeading("Bronnen, kosten & compensatie", "Net, zon, batterij en water")}<div class="energy-table-head"><span>Bron</span><span>Hoeveelheid</span><span>Kost</span></div>${sourceRows}</section><section class="dashboard-section device-energy">${sectionHeading("Individuele apparaten", "Grootste verbruikers; hiërarchie voorkomt dubbeltelling")}<div>${deviceRows}</div></section></div><section class="dashboard-section">${sectionHeading("Alle energiedetails", "Standaard Energy blijft fallback en configuratiepad")}<div class="domain-grid">${domainCard("sun", "Zon & batterij", "Productie, opslag en SoC")}${domainCard("energy", "Net & tarieven", "Import, export, kost en CO₂")}${domainCard("car", "Thuisladen", "Sessie en planning")}${domainCard("droplet", "Water", "Debiet, dagverbruik en hiërarchie")}</div></section>`;
  }

  function renderIntegrations() {
    return `<section class="integration-hero"><div><span class="card-eyebrow">Eén samenhangende ervaring</span><h2>Specialistische dashboards</h2><p>De samenvatting leeft in de centrale shell. Een klik opent steeds de volledige, zelfstandige detailcard.</p></div><div class="integration-contract"><span>${icon("shield")}</span><strong>Native shell</strong><small>4 geversioneerde detailcards</small></div></section><div class="integration-grid">${Object.entries(fixture.specialists).map(([key, data]) => specialistCard(data, key, true)).join("")}</div><section class="contract-strip"><div><span>${icon("rooms")}</span><strong>Dezelfde shell</strong><small>Titel, terugpad en spacing</small></div><div><span>${icon("sliders")}</span><strong>Dezelfde semantiek</strong><small>Normaal, actief, waarschuwing en offline</small></div><div><span>${icon("shield")}</span><strong>Eigen veilige logica</strong><small>Confirmations blijven in de broncard</small></div></section>`;
  }

  function renderSpecialist() {
    const key = ["kia", "robot", "garden"].includes(params.get("card")) ? params.get("card") : "kia";
    const data = fixture.specialists[key];
    const names = { kia: "Kia Connect-dashboard", robot: "Robotdashboard", garden: "Tuindashboard" };
    const panels = {
      kia: [["Batterij", data.metric], ["Bereik", "312 km"], ["Laadvermogen", "3,6 kW"], ["Vertrekklaar", "07:30"]],
      robot: [["Batterij", data.metric], ["Zone", "Woonkamer"], ["Resterend", "31 min"], ["Onderhoud", "In orde"]],
      garden: [["Droge zones", data.metric], ["Regen", "Niet verwacht"], ["Bewatering", "Uit"], ["Bodem", "Gemengd"]]
    };
    return `<a class="back-link" href="${withParams("integrations")}">${icon("arrow", "back-arrow")}Specialisten</a><section class="specialist-full-hero tone-${data.tone}"><span class="specialist-icon">${icon(data.icon)}</span><div><span class="card-eyebrow">Volledige bestaande custom card</span><h2>${names[key]}</h2><p>De implementatie host hier rechtstreeks de bestaande, geversioneerde kaart uit de bronrepo.</p></div>${statusPill(data.status, data.tone)}</section><section class="full-card-frame"><div class="full-card-title"><div><span class="card-eyebrow">Gesanitiseerde prototypeweergave</span><h3>${data.title}</h3></div><strong>${data.metric}</strong></div><div class="full-card-metrics">${panels[key].map(([label, value]) => `<article><span>${label}</span><strong>${value}</strong></article>`).join("")}</div><div class="full-card-map"><span>${icon(key === "garden" ? "leaf" : key === "robot" ? "rooms" : "car")}</span><div><strong>${key === "kia" ? "Voertuigstatus en laadcontext" : key === "robot" ? "Kaart, zones en schoonmaakhistorie" : "Zones, bodemvocht en irrigatie"}</strong><p>Alle detailfuncties, historie en veilige acties blijven onderdeel van de broncard.</p></div></div><div class="full-card-actions"><button type="button">Overzicht</button><button type="button">Historie</button><button type="button">Instellingen</button></div></section>`;
  }

  function renderPool() {
    const pool = fixture.specialists.pool;
    return `<a class="back-link" href="${withParams("integrations")}">${icon("arrow", "back-arrow")}Specialisten</a><section class="pool-hero"><div><span class="card-eyebrow">Nieuw specialistisch dashboard</span><h2>Zwembad</h2><p>Dezelfde visuele taal als Kia, robot en tuin; waterkwaliteit en werking staan centraal.</p></div><div class="pool-temperature"><strong>${pool.metric}</strong><span>watertemperatuur</span></div></section><section class="pool-metrics"><article><span>pH</span><strong>7,3</strong><small>Doel 7,2–7,6</small></article><article><span>Desinfectie</span><strong>In orde</strong><small>Laatste meting 6 min</small></article><article><span>Filter</span><strong>Actief</strong><small>Nog 2 u 18 min</small></article><article><span>Verwarming</span><strong>Stand-by</strong><small>Doel 27,0°</small></article></section><div class="pool-layout"><section class="dashboard-section pool-chart-card">${sectionHeading("Waterkwaliteit", "Fictieve 24-uurs trend")}<div class="pool-chart"><svg viewBox="0 0 600 170" role="img" aria-label="Fictieve stabiele waterkwaliteit"><path class="grid-line" d="M0 35H600M0 85H600M0 135H600"/><path class="trend-area" d="M0 125 C80 120 100 72 180 82 S290 110 350 78 S470 48 600 65 L600 170H0Z"/><path class="trend-line" d="M0 125 C80 120 100 72 180 82 S290 110 350 78 S470 48 600 65"/></svg></div><div class="chart-axis"><span>24u geleden</span><span>12u</span><span>Nu</span></div></section><aside class="pool-side"><section class="dashboard-section energy-summary">${sectionHeading("Modus")}<div class="mode-pills"><button class="is-active" type="button">Automatisch</button><button type="button">Zwemmen</button><button type="button">Onderhoud</button></div></section><section class="dashboard-section energy-summary">${sectionHeading("Veilige acties")}<button class="safe-action" type="button">Filtercyclus bekijken</button><button class="safe-action requires-confirmation" type="button">Verwarming aanpassen</button><small class="confirmation-note">Kostbare of risicovolle acties vragen bevestiging.</small></section></aside></div>`;
  }

  function renderMore() {
    return `<section class="overview-hero"><div><span class="card-eyebrow">Secundaire functies</span><h2>Meer</h2><p>Aanwezigheidsdetails, afval, weer, diagnose en beheer zonder Home te overladen.</p></div>${icon("more")}</section><div class="domain-grid">${domainCard("users", "Aanwezigheid", "Personen en benoemde zones")}${domainCard("cloud", "Weer", "Verwachting en regen")}${domainCard("archive", "Afval", "Volgende ophaling")}${domainCard("offline", "Diagnostiek", "Alleen relevante bronnen")}</div>`;
  }

  function setPageMeta() {
    const meta = {
      home: ["Goedenavond", "Vrijdag 21 augustus · 19:06"],
      rooms: ["Kamers", "Alle ruimtes · per verdieping"],
      room: [fixture.room.name, "Kamer · Gelijkvloers"],
      energy: ["Energie", "Actueel · vandaag · historie"],
      integrations: ["Domeinen", "Specialistische dashboards"],
      specialist: ["Volledig dashboard", "Gehoste specialistische card"],
      pool: ["Zwembad", "Waterkwaliteit · werking · energie"],
      more: ["Meer", "Secundair en beheer"]
    }[view] || ["Goedenavond", "Vrijdag 21 augustus · 19:06"];
    document.getElementById("page-title").textContent = meta[0];
    document.getElementById("page-eyebrow").textContent = meta[1];
  }

  function setTheme(nextTheme) {
    document.documentElement.dataset.theme = nextTheme;
    document.getElementById("theme-toggle").textContent = nextTheme === "dark" ? "Lichte modus" : "Donkere modus";
  }

  const renderers = { home: renderHome, rooms: renderRooms, room: renderRoom, energy: renderEnergy, integrations: renderIntegrations, specialist: renderSpecialist, pool: renderPool, more: renderMore };

  document.body.classList.toggle("clean-capture", clean);
  setTheme(theme);
  document.getElementById("ha-nav").innerHTML = renderHaNav();
  document.getElementById("view-tabs").innerHTML = renderViewTabs();
  document.getElementById("context-chips").innerHTML = contextChips();
  document.getElementById("fixture-select").value = fixtureName;
  setPageMeta();
  document.getElementById("page").innerHTML = (renderers[view] || renderHome)();

  document.getElementById("fixture-select").addEventListener("change", (event) => {
    const next = new URLSearchParams(params);
    next.set("state", event.target.value);
    window.location.search = next.toString();
  });

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const next = new URLSearchParams(params);
    next.set("theme", document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    window.location.search = next.toString();
  });
})();
