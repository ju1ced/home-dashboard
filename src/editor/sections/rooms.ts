import { ROOM_CAPABILITIES, type HomeDashboardConfigV1, type RoomConfig } from "../../config/types";
import { escapeHtml, getEditorItemToken, renderSelector } from "../shared";

export type RoomNestedCollection = "light_groups" | "cover_controls" | "smart_plugs";

export function visibleRoomControls(room: RoomConfig): string[] {
  if (room.control_entities !== undefined) return room.control_entities;
  const light = room.control_light_entity ? [room.control_light_entity] : [...room.light_entities, ...room.light_switch_entities];
  const media = room.control_media_entity ? [room.control_media_entity] : room.media_entities;
  const cover = room.control_cover_entity ? [room.control_cover_entity] : room.cover_entities.filter(entity => entity !== room.control_awning_entity);
  return [...new Set([...light, ...media, ...cover, room.control_awning_entity ?? "", room.hvac.entity].filter(Boolean))];
}

export function renderControlOrderRows(controls: readonly string[], roomIndex: number): string {
  return controls.map((entity, controlIndex) => `<div data-control-order-row><span class="order-index">${controlIndex + 1}</span><code>${escapeHtml(entity)}</code><span class="order-actions"><button type="button" data-room-control-move="up" data-room-index="${roomIndex}" data-control-index="${controlIndex}" aria-label="Verplaats quick action ${controlIndex + 1} omhoog" ${controlIndex === 0 ? "disabled" : ""}>↑</button><button type="button" data-room-control-move="down" data-room-index="${roomIndex}" data-control-index="${controlIndex}" aria-label="Verplaats quick action ${controlIndex + 1} omlaag" ${controlIndex === controls.length - 1 ? "disabled" : ""}>↓</button></span></div>`).join("");
}

function renderRoomNestedSelector(roomIndex: number, collection: string, itemIndex: number, field: string, value: unknown, selector: Record<string, unknown>): string {
  return `<ha-selector class="collection-selector" data-room-index="${roomIndex}" data-room-nested-collection="${collection}" data-item-index="${itemIndex}" data-field="${field}" data-selector="${escapeHtml(JSON.stringify(selector))}" data-value="${escapeHtml(JSON.stringify(value))}"></ha-selector>`;
}

function renderPeriodOptions(value: "running" | "completed" | undefined): string {
  return `<option value="" ${value ? "" : "selected"}>Niet gemapt</option><option value="running" ${value === "running" ? "selected" : ""}>Lopend</option><option value="completed" ${value === "completed" ? "selected" : ""}>Afgesloten</option>`;
}

function renderRoomControlDeck(room: RoomConfig, roomIndex: number): string {
  const lightGroups = (room.light_groups ?? []).map((item, itemIndex) => `<article class="nested-item"><div class="item-toolbar"><strong>${escapeHtml(item.name || item.key)}</strong><button type="button" data-room-nested-remove="light_groups" data-room-index="${roomIndex}" data-item-index="${itemIndex}">Verwijder</button></div><label>Sleutel<input data-room-nested-collection="light_groups" data-room-index="${roomIndex}" data-item-index="${itemIndex}" data-field="key" value="${escapeHtml(item.key)}"></label><label>Naam<input data-room-nested-collection="light_groups" data-room-index="${roomIndex}" data-item-index="${itemIndex}" data-field="name" value="${escapeHtml(item.name)}"></label><label>Actiedoel${renderRoomNestedSelector(roomIndex, "light_groups", itemIndex, "control_entity", item.control_entity, { entity: { domain: "light" } })}</label><label>Expliciete leden${renderRoomNestedSelector(roomIndex, "light_groups", itemIndex, "member_entities", item.member_entities, { entity: { domain: "light", multiple: true } })}</label></article>`).join("");
  const covers = (room.cover_controls ?? []).map((item, itemIndex) => `<article class="nested-item"><div class="item-toolbar"><strong>${escapeHtml(item.name || item.key)}</strong><button type="button" data-room-nested-remove="cover_controls" data-room-index="${roomIndex}" data-item-index="${itemIndex}">Verwijder</button></div><label>Sleutel<input data-room-nested-collection="cover_controls" data-room-index="${roomIndex}" data-item-index="${itemIndex}" data-field="key" value="${escapeHtml(item.key)}"></label><label>Naam<input data-room-nested-collection="cover_controls" data-room-index="${roomIndex}" data-item-index="${itemIndex}" data-field="name" value="${escapeHtml(item.name)}"></label><label>Cover${renderRoomNestedSelector(roomIndex, "cover_controls", itemIndex, "entity", item.entity, { entity: { domain: "cover" } })}</label><label>Type<select data-room-nested-collection="cover_controls" data-room-index="${roomIndex}" data-item-index="${itemIndex}" data-field="kind">${["shutter", "screen", "awning"].map((value) => `<option value="${value}" ${item.kind === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label>Bevestiging<select data-room-nested-collection="cover_controls" data-room-index="${roomIndex}" data-item-index="${itemIndex}" data-field="confirmation"><option value="movement" ${item.confirmation === "movement" ? "selected" : ""}>Bij beweging</option><option value="none" ${item.confirmation === "none" ? "selected" : ""}>Geen</option></select></label></article>`).join("");
  const plugs = (room.smart_plugs ?? []).map((item, itemIndex) => `<article class="nested-item"><div class="item-toolbar"><strong>${escapeHtml(item.name || item.key)}</strong><button type="button" data-room-nested-remove="smart_plugs" data-room-index="${roomIndex}" data-item-index="${itemIndex}">Verwijder</button></div><h6>Basis</h6><label>Sleutel<input data-room-nested-collection="smart_plugs" data-room-index="${roomIndex}" data-item-index="${itemIndex}" data-field="key" value="${escapeHtml(item.key)}"></label><label>Naam<input data-room-nested-collection="smart_plugs" data-room-index="${roomIndex}" data-item-index="${itemIndex}" data-field="name" value="${escapeHtml(item.name)}"></label><label>Schakelaar${renderRoomNestedSelector(roomIndex, "smart_plugs", itemIndex, "switch_entity", item.switch_entity, { entity: { domain: "switch" } })}</label><label>Actueel vermogen${renderRoomNestedSelector(roomIndex, "smart_plugs", itemIndex, "power_entity", item.power_entity, { entity: { domain: "sensor" } })}</label><label class="check"><input type="checkbox" data-room-nested-collection="smart_plugs" data-room-index="${roomIndex}" data-item-index="${itemIndex}" data-field="protected" ${item.protected ? "checked" : ""}>Beveiligd, niet schakelbaar</label><label>Uitleg<input data-room-nested-collection="smart_plugs" data-room-index="${roomIndex}" data-item-index="${itemIndex}" data-field="protection_reason" value="${escapeHtml(item.protection_reason ?? "")}"></label><h6>Energieperiodes</h6><label>Energie totaal${renderRoomNestedSelector(roomIndex, "smart_plugs", itemIndex, "energy_entity", item.energy_entity, { entity: { domain: "sensor" } })}</label><label>Spanning${renderRoomNestedSelector(roomIndex, "smart_plugs", itemIndex, "voltage_entity", item.voltage_entity, { entity: { domain: "sensor" } })}</label><label>Dag${renderRoomNestedSelector(roomIndex, "smart_plugs", itemIndex, "energy_day_entity", item.energy_day_entity ?? "", { entity: { domain: "sensor" } })}</label><label>Dagperiode<select data-room-nested-collection="smart_plugs" data-room-index="${roomIndex}" data-item-index="${itemIndex}" data-field="energy_day_period">${renderPeriodOptions(item.energy_day_period)}</select></label><label>Maand${renderRoomNestedSelector(roomIndex, "smart_plugs", itemIndex, "energy_month_entity", item.energy_month_entity ?? "", { entity: { domain: "sensor" } })}</label><label>Maandperiode<select data-room-nested-collection="smart_plugs" data-room-index="${roomIndex}" data-item-index="${itemIndex}" data-field="energy_month_period">${renderPeriodOptions(item.energy_month_period)}</select></label><label>Jaar${renderRoomNestedSelector(roomIndex, "smart_plugs", itemIndex, "energy_year_entity", item.energy_year_entity ?? "", { entity: { domain: "sensor" } })}</label><label>Jaarperiode<select data-room-nested-collection="smart_plugs" data-room-index="${roomIndex}" data-item-index="${itemIndex}" data-field="energy_year_period">${renderPeriodOptions(item.energy_year_period)}</select></label></article>`).join("");
  const roomEnergy = room.room_energy ?? { power_entity: "", day_entity: "", month_entity: "", year_entity: "" };
  return `<h4>Control Deck</h4><label>Privacyveilige kamerafbeelding${renderSelector("rooms", roomIndex, "image_entity", room.image_entity ?? "", { entity: { domain: "image" } })}</label><label>Kamerfoto uploaden<small>Upload een foto rechtstreeks, zonder eerst een Image-hulpmiddel aan te maken via HA Instellingen. Zijn zowel een kamerafbeelding als een upload ingesteld, dan krijgt de upload voorrang.</small>${renderSelector("rooms", roomIndex, "image_upload", room.image_upload ?? null, { media: { accept: ["image/*"], image_upload: true } })}</label><div class="nested-collection"><h5>Lichtgroepen</h5>${lightGroups}<button type="button" data-room-nested-add="light_groups" data-room-index="${roomIndex}">Lichtgroep toevoegen</button></div><div class="nested-collection"><h5>Getypeerde openingen</h5>${covers}<button type="button" data-room-nested-add="cover_controls" data-room-index="${roomIndex}">Opening toevoegen</button></div><div class="nested-collection"><h5>Smart plugs</h5><small>Voor apparaten die je hier volledig wil volgen: vermogen, dag/maand/jaar-verbruik, vergrendeling. Zwaarder dan de simpele lijst hierboven, met een eigen interactieve kaart.</small>${plugs}<button type="button" data-room-nested-add="smart_plugs" data-room-index="${roomIndex}">Smart plug toevoegen</button></div><h5>Kamerenergie</h5><label>Actueel vermogen${renderSelector("rooms", roomIndex, "room_energy.power_entity", roomEnergy.power_entity, { entity: { domain: "sensor" } })}</label><label>Vandaag${renderSelector("rooms", roomIndex, "room_energy.day_entity", roomEnergy.day_entity, { entity: { domain: "sensor" } })}</label><label>Dagperiode<select data-path="rooms.${roomIndex}.room_energy.day_period">${renderPeriodOptions(roomEnergy.day_period)}</select></label><label>Maand${renderSelector("rooms", roomIndex, "room_energy.month_entity", roomEnergy.month_entity, { entity: { domain: "sensor" } })}</label><label>Maandperiode<select data-path="rooms.${roomIndex}.room_energy.month_period">${renderPeriodOptions(roomEnergy.month_period)}</select></label><label>Jaar${renderSelector("rooms", roomIndex, "room_energy.year_entity", roomEnergy.year_entity, { entity: { domain: "sensor" } })}</label><label>Jaarperiode<select data-path="rooms.${roomIndex}.room_energy.year_period">${renderPeriodOptions(roomEnergy.year_period)}</select></label>`;
}

export function renderRooms(config: HomeDashboardConfigV1, expandedItems: Set<string>): string {
  return config.rooms.map((roomConfig, index) => {
    const controls = visibleRoomControls(roomConfig);
    const controlOrder = controls.length ? `<div class="order" data-control-order="${index}" aria-label="Volgorde quick actions">${renderControlOrderRows(controls, index)}</div><div class="order-save"><small>De pijlen reageren direct. Pas de volgorde één keer toe wanneer ze goed staat.</small><button type="button" data-room-control-apply="${index}">Volgorde toepassen</button></div>` : `<small>Geen quick actions gekozen.</small>`;
    return `<details class="item" data-item-token="${escapeHtml(getEditorItemToken("rooms", roomConfig, index))}" ${expandedItems.has(getEditorItemToken("rooms", roomConfig, index)) ? "open" : ""}>
    <summary>${escapeHtml(roomConfig.name || roomConfig.key || `Kamer ${index + 1}`)}</summary><div class="item-body">
    <div class="item-toolbar"><span class="item-actions"><button type="button" aria-label="Verplaats ${escapeHtml(roomConfig.name || roomConfig.key || `kamer ${index + 1}`)} omhoog" data-room-move="up" data-index="${index}" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" aria-label="Verplaats ${escapeHtml(roomConfig.name || roomConfig.key || `kamer ${index + 1}`)} omlaag" data-room-move="down" data-index="${index}" ${index === config.rooms.length - 1 ? "disabled" : ""}>↓</button><button type="button" aria-label="Verwijder kamer ${escapeHtml(roomConfig.name || roomConfig.key || index + 1)}" data-remove="rooms" data-index="${index}">Verwijder</button></span></div>
    <label>Logische sleutel<input data-collection="rooms" data-index="${index}" data-field="key" value="${escapeHtml(roomConfig.key)}"></label>
    <label>Naam<input data-collection="rooms" data-index="${index}" data-field="name" value="${escapeHtml(roomConfig.name)}"></label>
    <label>Icoon${renderSelector("rooms", index, "icon", roomConfig.icon, { icon: {} })}</label>
    <label>Verdieping${renderSelector("rooms", index, "floor_id", roomConfig.floor_id, { floor: {} })}</label>
    <label>Area${renderSelector("rooms", index, "area_id", roomConfig.area_id, { area: {} })}</label>
    <label>Extra devices${renderSelector("rooms", index, "device_ids", roomConfig.device_ids, { device: { multiple: true } })}</label>
    <label>Functies<select multiple data-collection="rooms" data-index="${index}" data-field="capabilities">${ROOM_CAPABILITIES.map((value) => `<option value="${value}" ${roomConfig.capabilities.includes(value) ? "selected" : ""}>${value}</option>`).join("")}</select></label>
    <label><input type="checkbox" data-collection="rooms" data-index="${index}" data-field="home_favorite" ${roomConfig.home_favorite ? "checked" : ""}>Favoriet op Home (maximaal vier, volgorde via pijlen)</label>
    <h4>Quick actions</h4>
    <label>Knoppen op Home${renderSelector("rooms", index, "control_entities", controls, { entity: { domain: ["light", "switch", "cover", "media_player", "climate"], multiple: true } })}</label>
    <small>Kies nul tot zestien; orden zonder telkens het dashboard opnieuw te laden.</small>
    ${controlOrder}
    <label><input type="checkbox" data-collection="rooms" data-index="${index}" data-field="controls_enabled" ${roomConfig.controls_enabled ? "checked" : ""}>Directe bediening toestaan voor gekozen licht-, cover- en mediaknoppen</label>
    <p>Zonder toestemming openen de knoppen alleen Home Assistant-details. Klimaat opent altijd het native detailvenster. Luifelbeveiliging blijft in Home Assistant.</p>
    <label>Scripts (bewaard, max. 2)<select multiple data-collection="rooms" data-index="${index}" data-field="quick_actions">${config.actions.map((action) => `<option value="${escapeHtml(action.key)}" ${roomConfig.quick_actions.includes(action.key) ? "selected" : ""}>${escapeHtml(action.label || action.key)}</option>`).join("")}</select></label>
    <h4>Bronmappings</h4>
    <label>Lampen${renderSelector("rooms", index, "light_entities", roomConfig.light_entities, { entity: { domain: "light", multiple: true } })}</label>
    <label>Verlichtingsschakelaars${renderSelector("rooms", index, "light_switch_entities", roomConfig.light_switch_entities, { entity: { domain: "switch", multiple: true } })}</label>
    <label>Covers en openingen${renderSelector("rooms", index, "cover_entities", roomConfig.cover_entities, { entity: { multiple: true } })}</label>
    <label>Media${renderSelector("rooms", index, "media_entities", roomConfig.media_entities, { entity: { domain: "media_player", multiple: true } })}</label>
    <label>Safety${renderSelector("rooms", index, "safety_entities", roomConfig.safety_entities, { entity: { multiple: true } })}</label>
    <label>Camera's${renderSelector("rooms", index, "camera_entities", roomConfig.camera_entities, { entity: { domain: "camera", multiple: true } })}</label>
    <label>Apparaten en power<small>Telt mee in het huidige vermogen van de kamer. Geen dag/maand/jaartotalen tenzij hetzelfde apparaat ook als Smart plug is ingesteld.</small>${renderSelector("rooms", index, "power_entities", roomConfig.power_entities, { entity: { multiple: true } })}</label>
    <label>Overige historie${renderSelector("rooms", index, "history_entities", roomConfig.history_entities, { entity: { multiple: true } })}</label>
    ${renderRoomControlDeck(roomConfig, index)}
    <h4>Klimaatdetail</h4>
    <label>Klimaatbron${renderSelector("rooms", index, "hvac.entity", roomConfig.hvac.entity, { entity: { domain: "climate" } })}</label>
    <label>Comfort en luchtkwaliteit${renderSelector("rooms", index, "hvac.comfort_entities", roomConfig.hvac.comfort_entities, { entity: { multiple: true } })}</label>
    <label>Klimaathistorie${renderSelector("rooms", index, "hvac.history_entities", roomConfig.hvac.history_entities, { entity: { multiple: true } })}</label>
    <label>Toegestane modes<input data-collection="rooms" data-index="${index}" data-field="hvac.modes" value="${escapeHtml(roomConfig.hvac.modes.join(", "))}"></label>
    <label>Presets<input data-collection="rooms" data-index="${index}" data-field="hvac.presets" value="${escapeHtml(roomConfig.hvac.presets.join(", "))}"></label>
    <label>Fan modes<input data-collection="rooms" data-index="${index}" data-field="hvac.fan_modes" value="${escapeHtml(roomConfig.hvac.fan_modes.join(", "))}"></label>
    <label>Swing modes<input data-collection="rooms" data-index="${index}" data-field="hvac.swing_modes" value="${escapeHtml(roomConfig.hvac.swing_modes.join(", "))}"></label>
  </div></details>`;
  }).join("");
}

export function addRoomNestedItem(config: HomeDashboardConfigV1, roomIndex: number, collection: RoomNestedCollection): void {
  const room = config.rooms[roomIndex];
  if (!room) return;
  if (collection === "light_groups") (room.light_groups ??= []).push({ key: `light_group_${room.light_groups.length + 1}`, name: "", control_entity: "", member_entities: [] });
  if (collection === "cover_controls") (room.cover_controls ??= []).push({ key: `cover_${room.cover_controls.length + 1}`, name: "", entity: "", kind: "shutter", confirmation: "movement" });
  if (collection === "smart_plugs") (room.smart_plugs ??= []).push({ key: `plug_${room.smart_plugs.length + 1}`, name: "", switch_entity: "", power_entity: "", energy_entity: "", voltage_entity: "", protected: false, protection_reason: "", energy_day_entity: "", energy_month_entity: "", energy_year_entity: "" });
}

export function updateRoomNestedItem(config: HomeDashboardConfigV1, roomIndex: number, collection: RoomNestedCollection, itemIndex: number, field: string, value: unknown): void {
  const room = config.rooms[roomIndex];
  const item = room?.[collection]?.[itemIndex] as Record<string, unknown> | undefined;
  if (!item) return;
  if (field.endsWith("_period") && value === "") delete item[field];
  else item[field] = value;
}

export function removeRoomNestedItem(config: HomeDashboardConfigV1, roomIndex: number, collection: RoomNestedCollection, itemIndex: number): void {
  const room = config.rooms[roomIndex];
  room?.[collection]?.splice(itemIndex, 1);
}

/**
 * The quick-action order list patches only its own DOM subtree on every arrow click, instead of a
 * full editor re-render -- re-rendering the whole room item on every reorder step would lose focus
 * and be needlessly expensive for what is otherwise a pure local reorder. Applying the reordered
 * list to the committed config happens separately, via the "Volgorde toepassen" button.
 */
export function moveRoomControlDraft(shadowRoot: ParentNode, config: HomeDashboardConfigV1, roomIndex: number, index: number, direction: "up" | "down"): void {
  const room = config.rooms[roomIndex];
  if (!room) return;
  room.control_entities ??= visibleRoomControls(room);
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= room.control_entities.length) return;
  const current = room.control_entities[index]!;
  room.control_entities[index] = room.control_entities[target]!;
  room.control_entities[target] = current;
  const container = shadowRoot.querySelector<HTMLElement>(`[data-control-order="${roomIndex}"]`);
  if (!container) return;
  container.innerHTML = renderControlOrderRows(room.control_entities, roomIndex);
  bindControlOrderEvents(container, shadowRoot, config);
  const save = shadowRoot.querySelector<HTMLButtonElement>(`[data-room-control-apply="${roomIndex}"]`);
  save?.classList.add("pending");
  if (save) save.textContent = "Volgorde opslaan";
}

export function bindControlOrderEvents(scopeRoot: ParentNode, shadowRoot: ParentNode, config: HomeDashboardConfigV1): void {
  scopeRoot.querySelectorAll<HTMLButtonElement>("[data-room-control-move]").forEach((controlButton) => controlButton.addEventListener("click", () => moveRoomControlDraft(shadowRoot, config, Number(controlButton.dataset.roomIndex), Number(controlButton.dataset.controlIndex), controlButton.dataset.roomControlMove as "up" | "down")));
}

/**
 * Rooms is the only section with its own nested collections (light groups, typed covers, smart
 * plugs) and the control-order drag-list, both on top of the generic `[data-collection]` CRUD that
 * every flat-collection section shares -- so unlike persons/cameras/actions, this section does need
 * its own event binder.
 */
export function bindRoomEvents(shadowRoot: ShadowRoot, config: HomeDashboardConfigV1, handlers: { commit: () => void; moveItem: (items: unknown[], index: number, direction: "up" | "down") => void }): void {
  shadowRoot.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-room-nested-collection]").forEach((element) => {
    if (element.tagName.toLowerCase() === "ha-selector") return;
    element.addEventListener("change", () => {
      let value: unknown = element.value;
      if (element instanceof HTMLInputElement && element.type === "checkbox") value = element.checked;
      updateRoomNestedItem(config, Number(element.dataset.roomIndex), element.dataset.roomNestedCollection as RoomNestedCollection, Number(element.dataset.itemIndex), element.dataset.field ?? "", value);
      handlers.commit();
    });
  });
  shadowRoot.querySelectorAll<HTMLButtonElement>("[data-room-nested-add]").forEach((controlButton) => controlButton.addEventListener("click", () => {
    addRoomNestedItem(config, Number(controlButton.dataset.roomIndex), controlButton.dataset.roomNestedAdd as RoomNestedCollection);
    handlers.commit();
  }));
  shadowRoot.querySelectorAll<HTMLButtonElement>("[data-room-nested-remove]").forEach((controlButton) => controlButton.addEventListener("click", () => {
    removeRoomNestedItem(config, Number(controlButton.dataset.roomIndex), controlButton.dataset.roomNestedRemove as RoomNestedCollection, Number(controlButton.dataset.itemIndex));
    handlers.commit();
  }));
  shadowRoot.querySelectorAll<HTMLButtonElement>("[data-room-move]").forEach((controlButton) => controlButton.addEventListener("click", () => handlers.moveItem(config.rooms, Number(controlButton.dataset.index), controlButton.dataset.roomMove as "up" | "down")));
  bindControlOrderEvents(shadowRoot, shadowRoot, config);
  shadowRoot.querySelectorAll<HTMLButtonElement>("[data-room-control-apply]").forEach((controlButton) => controlButton.addEventListener("click", () => handlers.commit()));
}
