import assert from "node:assert/strict";
import test from "node:test";
import { findPrivacyMatches } from "../scripts/privacy-patterns.mjs";

const join = (...parts) => parts.join("");

test("privacyscan detecteert de ondersteunde gevoelige vormen", () => {
  const positives = [
    JSON.stringify(join("sensor", ".", "private_meter")),
    join("entity_id: ", "camera", ".", "private_driveway"),
    join("AA", ":BB", ":CC", ":DD", ":EE", ":FF"),
    join("http://", "192", ".168.1.20", "/api"),
    JSON.stringify({ [join("internal", "_url")]: join("http://", "home", ".local") }),
    join("https://", "dashboard", ".home", ".arpa", "/view"),
    join("http://", "homeassistant", ":8123", "/api"),
    JSON.stringify({ [join("host", "name")]: join("private", ".lan") }),
    JSON.stringify("a".repeat(32)),
    join(join("device", "_id"), ": ", "abcdef1234567890"),
    join("- ", "b".repeat(32)),
    join(join("lati", "tude"), ": ", "50.12345"),
    join(join("coor", "dinates"), ": [", "50.12345", ", ", "4.54321", "]"),
    join(join("access", "_token"), ": ", "private-value")
  ];

  positives.forEach((source) => assert.ok(findPrivacyMatches(source).length > 0, `Niet gedetecteerd: ${source.slice(0, 16)}`));
});

test("privacyscan laat publieke en fictieve waarden door", () => {
  const negatives = [
    "event.target",
    "weather.days",
    "https://example.com/docs",
    JSON.stringify({ device_id: "SELECT_DEVICE_IN_GUI" }),
    JSON.stringify({ password: "REDACTED" }),
    JSON.stringify({ hostname: "localhost" }),
    JSON.stringify({ action: join("light", ".", "toggle"), target: { entity_id: ["SELECT_LIGHT_IN_GUI"] } }),
    join("action: ", "cover", ".", "close_cover"),
    "custom:home-dashboard"
  ];

  negatives.forEach((source) => assert.deepEqual(findPrivacyMatches(source), [], `Onterechte match: ${source}`));
});
