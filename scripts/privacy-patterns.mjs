export const PRIVACY_PATTERNS = [
  [/['"`](?:sensor|binary_sensor|light|switch|input_boolean|input_text|input_select|climate|humidifier|fan|water_heater|cover|valve|media_player|remote|vacuum|lawn_mower|person|device_tracker|zone|camera|alarm_control_panel|lock|automation|script|scene|input_button|input_number|number|select|button|update|weather|calendar|todo|event|sun)\.[a-z0-9_]{3,}['"`]/g, "mogelijk echte Home Assistant entity-ID"],
  [/(?:^|\n)\s*(?:-\s*|(?!(?:action|service)\s*:)[A-Za-z0-9_-]+:\s*)(?:sensor|binary_sensor|light|switch|input_boolean|input_text|input_select|climate|humidifier|fan|water_heater|cover|valve|media_player|remote|vacuum|lawn_mower|person|device_tracker|zone|camera|alarm_control_panel|lock|automation|script|scene|input_button|input_number|number|select|button|update|weather|calendar|todo|event|sun)\.[a-z0-9_]{3,}(?=\s*(?:$|\n|#))/g, "mogelijk echte Home Assistant entity-ID in YAML"],
  [/(?:[0-9A-F]{2}:){5}[0-9A-F]{2}/gi, "MAC-adres"],
  [/https?:\/\/(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)[^\s)"']*/gi, "interne URL"],
  [/https?:\/\/[a-z0-9.-]+\.(?:local|lan|home\.arpa)(?::\d+)?[^\s)"']*/gi, "interne hostname/URL"],
  [/https?:\/\/(?!localhost(?=:\d+|[/?#\s)"']|$)|example(?:\.com|\.org|\.net)?(?=:\d+|[/?#\s)"']|$))[a-z0-9-]+(?=:\d+|[/?#\s)"']|$)(?::\d+)?(?:[/?#][^\s)"']*)?/gi, "interne single-label URL"],
  [/["']?(?:internal_url|internal_hostname|hostname|host)["']?\s*:\s*["'](?!localhost(?:["']|:)|127\.0\.0\.1(?:["']|:)|example\.(?:com|org|net)["'])[a-z0-9][a-z0-9.-]*(?::\d+)?["']/gi, "mogelijk interne hostname"],
  [/["'](?:[a-f0-9]{32}|[a-f0-9]{40})["']/gi, "mogelijk Home Assistant registry-ID"],
  [/["']?(?:serial|serial_number|device_id|deviceId)["']?\s*:\s*["']?(?!SELECT_|EXAMPLE_|FIXTURE_|REDACTED)[A-Za-z0-9_-]{6,}["']?/g, "mogelijk serienummer of device-ID"],
  [/(?:^|\n)\s*-\s*[a-f0-9]{16,40}(?=\s*(?:$|\n|#))/gi, "mogelijk registry-ID in YAML-lijst"],
  [/["']?(?:latitude|longitude)["']?\s*[:=]\s*[-+]?\d{1,3}\.\d{3,}/gi, "mogelijk precieze coördinaat"],
  [/["']?coordinates?["']?\s*[:=]\s*\[\s*[-+]?\d{1,3}\.\d{3,}\s*,\s*[-+]?\d{1,3}\.\d{3,}/gi, "mogelijk precieze coördinaten"],
  [/["']?(?:access[_-]?token|api[_-]?key|client[_-]?secret|password)["']?\s*[:=]\s*["']?(?!REDACTED|EXAMPLE|FIXTURE|SELECT)[^\s,"'}]+["']?/gi, "mogelijk secret"]
];

export function findPrivacyMatches(source) {
  const matches = [];
  for (const [pattern, label] of PRIVACY_PATTERNS) {
    pattern.lastIndex = 0;
    const hit = pattern.exec(source);
    if (!hit) continue;
    const prefix = source.slice(Math.max(0, hit.index - 40), hit.index);
    const isJsonServiceAction = label === "mogelijk echte Home Assistant entity-ID" && /(?:["'](?:action|service)["']|\b(?:action|service))\s*:\s*$/.test(prefix);
    if (!isJsonServiceAction) matches.push({ label, value: hit[0] });
  }
  return matches;
}
