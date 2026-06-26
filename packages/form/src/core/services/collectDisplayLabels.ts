import { ParsedSchemas } from "@/core/lifecycle/Schema/types";
import { CustomAdapter } from "@/helpers/defineFormSetup/types";
import { get, isArray, isNil, isObject, set } from "lodash";

export type DisplayEntry = {
  label: string;
  value: any;
  path?: string[];
};

const KEY_CONVENTIONS: [string, string, string][] = [
  ["value", "label", "children"],
  ["key", "title", "children"],
  ["key", "label", "children"],
  ["id", "name", "children"],
];

export function collectDisplayValues(
  parsedSchemas: ParsedSchemas,
  model: Record<string, any>,
  adapter: CustomAdapter
): Record<string, any> {
  const flat: Record<string, DisplayEntry | DisplayEntry[]> = {};
  walkSchemas(parsedSchemas, model, "", flat, adapter);

  const nested: Record<string, any> = {};
  for (const [fieldPath, entry] of Object.entries(flat)) {
    set(nested, fieldPath, entry);
  }
  return nested;
}

function walkSchemas(
  schemas: any[],
  model: Record<string, any>,
  basePath: string,
  flat: Record<string, DisplayEntry | DisplayEntry[]>,
  adapter: CustomAdapter
) {
  for (const schema of schemas) {
    const type = schema.type ?? "item";

    if (type === "group") {
      walkSchemas(schema.children ?? [], model, basePath, flat, adapter);
      continue;
    }

    if (type === "list") {
      const listPath = basePath ? `${basePath}.${schema.field}` : schema.field;
      const listValue = get(model, listPath);
      if (isArray(listValue)) {
        listValue.forEach((_: any, index: number) => {
          walkSchemas(schema.children ?? [], model, `${listPath}.${index}`, flat, adapter);
        });
      }
      continue;
    }

    if (!schema.field || !schema.componentProps) continue;

    const fieldPath = basePath ? `${basePath}.${schema.field}` : schema.field;
    const currentValue = get(model, fieldPath);
    if (isNil(currentValue)) continue;

    const entry = resolveDisplayEntry(schema.componentProps, currentValue, adapter);
    if (entry !== null) {
      flat[fieldPath] = entry;
    }
  }
}

function resolveDisplayEntry(
  componentProps: Record<string, any>,
  currentValue: any,
  adapter: CustomAdapter
): DisplayEntry | DisplayEntry[] | null {
  const adapterKeys = adapter.resolveKeys?.(componentProps);
  const conventions: [string, string, string][] = adapterKeys
    ? [[adapterKeys.valueKey, adapterKeys.labelKey, adapterKeys.childrenKey], ...KEY_CONVENTIONS]
    : KEY_CONVENTIONS;

  for (const prop of Object.values(componentProps)) {
    if (!isArray(prop) || !prop.length || !isObject(prop[0]) || isArray(prop[0])) continue;

    for (const [valueKey, labelKey, childrenKey] of conventions) {
      if (isArray(currentValue)) {
        const entries = currentValue
          .map((v) => buildEntry(prop, v, valueKey, labelKey, childrenKey))
          .filter((e): e is DisplayEntry => e !== null);
        if (entries.length) return entries;
      } else {
        const entry = buildEntry(prop, currentValue, valueKey, labelKey, childrenKey);
        if (entry !== null) return entry;
      }
    }
  }

  return null;
}

function buildEntry(
  options: any[],
  value: any,
  valueKey: string,
  labelKey: string,
  childrenKey: string
): DisplayEntry | null {
  const path = findAncestorPath(options, value, valueKey, labelKey, childrenKey);
  if (!path?.length) return null;
  const entry: DisplayEntry = { label: path[path.length - 1], value };
  if (path.length > 1) entry.path = path;
  return entry;
}

function findAncestorPath(
  options: any[],
  value: any,
  valueKey: string,
  labelKey: string,
  childrenKey: string,
  ancestors: string[] = []
): string[] | null {
  for (const item of options) {
    if (!isObject(item) || isArray(item)) continue;
    const label = get(item, labelKey);
    const currentLabel = !isNil(label) ? String(label) : null;
    if (get(item, valueKey) === value) {
      return currentLabel ? [...ancestors, currentLabel] : ancestors.length ? ancestors : null;
    }
    const children = get(item, childrenKey);
    if (isArray(children) && children.length) {
      const nextAncestors = currentLabel ? [...ancestors, currentLabel] : ancestors;
      const found = findAncestorPath(children, value, valueKey, labelKey, childrenKey, nextAncestors);
      if (found !== null) return found;
    }
  }
  return null;
}
