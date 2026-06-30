import { ParsedSchemas } from "@/core/lifecycle/Schema/types";
import { CustomAdapter } from "@/helpers/defineFormSetup/types";
import { get, isArray, isNil, isObject, set } from "lodash";

export type LabelMode = "leaf" | "path" | "parent";

export type DisplayEntry = {
  label: string | string[];
  value: any;
};

export type DisplayValueProvider = {
  getDisplayValue?: () => DisplayEntry | DisplayEntry[] | null | undefined;
};

const KEY_CONVENTIONS: [string, string, string][] = [
  ["value", "label", "children"],
  ["key", "title", "children"],
  ["key", "label", "children"],
  ["id", "name", "children"],
];

export function buildLabelModeConfig(
  schemas: any[],
  config: Record<string, LabelMode> = {}
): Record<string, LabelMode> {
  for (const schema of schemas) {
    const type = schema.type ?? "item";
    if (type === "group" || type === "list") {
      buildLabelModeConfig(schema.children ?? [], config);
    } else if (schema.field && schema.labelMode) {
      config[schema.field] = schema.labelMode;
    }
  }
  return config;
}

export function collectDisplayValues(
  parsedSchemas: ParsedSchemas,
  model: Record<string, any>,
  adapter: CustomAdapter,
  labelModeConfig: Record<string, LabelMode> = {},
  refs: Map<string, any> = new Map()
): Record<string, any> {
  const flat: Record<string, DisplayEntry | DisplayEntry[]> = {};
  walkSchemas(parsedSchemas, model, "", flat, adapter, labelModeConfig, refs);

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
  adapter: CustomAdapter,
  labelModeConfig: Record<string, LabelMode>,
  refs: Map<string, any>
) {
  for (const schema of schemas) {
    const type = schema.type ?? "item";

    if (type === "group") {
      walkSchemas(schema.children ?? [], model, basePath, flat, adapter, labelModeConfig, refs);
      continue;
    }

    if (type === "list") {
      const listPath = basePath ? `${basePath}.${schema.field}` : schema.field;
      const listValue = get(model, listPath);
      if (isArray(listValue)) {
        listValue.forEach((_: any, index: number) => {
          walkSchemas(
            schema.children ?? [],
            model,
            `${listPath}.${index}`,
            flat,
            adapter,
            labelModeConfig,
            refs
          );
        });
      }
      continue;
    }

    if (!schema.field) continue;

    const fieldPath = basePath ? `${basePath}.${schema.field}` : schema.field;
    const currentValue = get(model, fieldPath);
    if (isNil(currentValue)) continue;

    const mode: LabelMode = labelModeConfig[schema.field] ?? "leaf";
    const entry =
      (schema.componentProps
        ? resolveDisplayEntry(schema.componentProps, currentValue, adapter, mode)
        : null) ?? resolveDisplayEntryFromRef(refs.get(fieldPath), currentValue);

    if (entry !== null) {
      flat[fieldPath] = entry;
    }
  }
}

function resolveDisplayEntryFromRef(
  componentRef: { value?: DisplayValueProvider } | undefined,
  currentValue: any
): DisplayEntry | DisplayEntry[] | null {
  const instance = componentRef?.value;
  if (!instance?.getDisplayValue) return null;

  try {
    return normalizeDisplayEntry(instance.getDisplayValue(), currentValue);
  } catch {
    return null;
  }
}

function normalizeDisplayEntry(
  result: DisplayEntry | DisplayEntry[] | null | undefined,
  currentValue: any
): DisplayEntry | DisplayEntry[] | null {
  if (result == null) return null;

  if (isArray(result)) {
    const entries = result
      .map((entry) => normalizeSingleDisplayEntry(entry, currentValue))
      .filter((entry): entry is DisplayEntry => entry !== null);
    return entries.length ? entries : null;
  }

  return normalizeSingleDisplayEntry(result, currentValue);
}

function normalizeSingleDisplayEntry(
  entry: DisplayEntry,
  currentValue: any
): DisplayEntry | null {
  if (!isObject(entry) || isArray(entry) || isNil(entry.label)) return null;

  return {
    label: entry.label,
    value: entry.value === undefined ? currentValue : entry.value,
  };
}

function resolveDisplayEntry(
  componentProps: Record<string, any>,
  currentValue: any,
  adapter: CustomAdapter,
  mode: LabelMode
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
          .map((v) => buildEntry(prop, v, valueKey, labelKey, childrenKey, mode))
          .filter((e): e is DisplayEntry => e !== null);
        if (entries.length) return entries;
      } else {
        const entry = buildEntry(prop, currentValue, valueKey, labelKey, childrenKey, mode);
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
  childrenKey: string,
  mode: LabelMode
): DisplayEntry | null {
  const fullPath = findAncestorPath(options, value, valueKey, labelKey, childrenKey);
  if (!fullPath?.length) return null;

  let label: string | string[];
  if (mode === "leaf") {
    label = fullPath[fullPath.length - 1];
  } else if (mode === "parent") {
    label = fullPath.slice(-2);
  } else {
    label = fullPath;
  }

  return { label, value };
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
