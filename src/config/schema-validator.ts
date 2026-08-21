import configSchema from "../../schemas/config.schema.json";
import type { ValidationIssue } from "./types";

type SchemaNode = Record<string, unknown>;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function resolveReference(root: SchemaNode, reference: string): SchemaNode {
  if (!reference.startsWith("#/")) throw new Error(`Niet-ondersteunde schema-reference: ${reference}`);
  let value: unknown = root;
  for (const segment of reference.slice(2).split("/")) {
    if (!isObject(value)) throw new Error(`Ongeldige schema-reference: ${reference}`);
    value = value[segment.replaceAll("~1", "/").replaceAll("~0", "~")];
  }
  if (!isObject(value)) throw new Error(`Ongeldige schema-reference: ${reference}`);
  return value;
}

function schemaIssue(path: string, code: string, message: string): ValidationIssue {
  return { path: path || "$", code, message, severity: "error" };
}

function validateNode(value: unknown, node: SchemaNode, path: string, root: SchemaNode, issues: ValidationIssue[]): void {
  if (typeof node.$ref === "string") validateNode(value, resolveReference(root, node.$ref), path, root, issues);

  if (Object.hasOwn(node, "const") && !sameValue(value, node.const)) {
    issues.push(schemaIssue(path, "schema_const", `Verwachte vaste waarde ${JSON.stringify(node.const)}.`));
  }
  if (Array.isArray(node.enum) && !node.enum.some((candidate) => sameValue(candidate, value))) {
    issues.push(schemaIssue(path, "schema_enum", `Waarde ${JSON.stringify(value)} staat niet in de toegestane lijst.`));
  }
  if (Array.isArray(node.anyOf)) {
    const validBranch = node.anyOf.some((branch) => {
      if (!isObject(branch)) return false;
      const branchIssues: ValidationIssue[] = [];
      validateNode(value, branch, path, root, branchIssues);
      return branchIssues.length === 0;
    });
    if (!validBranch) issues.push(schemaIssue(path, "schema_any_of", "Geen toegestane configuratievariant komt overeen."));
  }

  const expectedType = node.type;
  if (expectedType === "object") {
    if (!isObject(value)) {
      issues.push(schemaIssue(path, "schema_type", "Verwacht een object."));
      return;
    }
    const properties = isObject(node.properties) ? node.properties : {};
    const required = Array.isArray(node.required) ? node.required.filter((key): key is string => typeof key === "string") : [];
    for (const key of required) {
      if (!Object.hasOwn(value, key)) issues.push(schemaIssue(path ? `${path}.${key}` : key, "schema_required", "Verplicht veld ontbreekt."));
    }
    if (node.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.hasOwn(properties, key)) issues.push(schemaIssue(path ? `${path}.${key}` : key, "schema_additional", "Onbekend veld is niet toegestaan."));
      }
    }
    for (const [key, child] of Object.entries(properties)) {
      if (Object.hasOwn(value, key) && isObject(child)) validateNode(value[key], child, path ? `${path}.${key}` : key, root, issues);
    }
    return;
  }

  if (expectedType === "array") {
    if (!Array.isArray(value)) {
      issues.push(schemaIssue(path, "schema_type", "Verwacht een lijst."));
      return;
    }
    if (typeof node.minItems === "number" && value.length < node.minItems) issues.push(schemaIssue(path, "schema_min_items", `Minstens ${node.minItems} items vereist.`));
    if (typeof node.maxItems === "number" && value.length > node.maxItems) issues.push(schemaIssue(path, "schema_max_items", `Maximaal ${node.maxItems} items toegestaan.`));
    if (node.uniqueItems === true && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) issues.push(schemaIssue(path, "schema_unique", "Dubbele lijstitems zijn niet toegestaan."));
    if (isObject(node.items)) value.forEach((item, index) => validateNode(item, node.items as SchemaNode, `${path}[${index}]`, root, issues));
    return;
  }

  if (expectedType === "string") {
    if (typeof value !== "string") {
      issues.push(schemaIssue(path, "schema_type", "Verwacht tekst."));
      return;
    }
    if (typeof node.minLength === "number" && value.length < node.minLength) issues.push(schemaIssue(path, "schema_min_length", "Tekstwaarde is te kort."));
    if (typeof node.pattern === "string" && !new RegExp(node.pattern).test(value)) issues.push(schemaIssue(path, "schema_pattern", "Tekstwaarde heeft niet het vereiste formaat."));
    return;
  }

  if (expectedType === "boolean" && typeof value !== "boolean") issues.push(schemaIssue(path, "schema_type", "Verwacht true of false."));
  if ((expectedType === "number" || expectedType === "integer") && (typeof value !== "number" || !Number.isFinite(value) || (expectedType === "integer" && !Number.isInteger(value)))) {
    issues.push(schemaIssue(path, "schema_type", expectedType === "integer" ? "Verwacht een geheel getal." : "Verwacht een getal."));
    return;
  }
  if (typeof value === "number") {
    if (typeof node.minimum === "number" && value < node.minimum) issues.push(schemaIssue(path, "schema_minimum", `Waarde moet minstens ${node.minimum} zijn.`));
    if (typeof node.maximum === "number" && value > node.maximum) issues.push(schemaIssue(path, "schema_maximum", `Waarde mag maximaal ${node.maximum} zijn.`));
  }
}

export function validateConfigSchema(value: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  validateNode(value, configSchema as SchemaNode, "", configSchema as SchemaNode, issues);
  return issues;
}
