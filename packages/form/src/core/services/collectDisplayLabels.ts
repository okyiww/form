import { ParsedSchemas } from "@/core/lifecycle/Schema/types";
import { CustomAdapter } from "@/helpers/defineFormSetup/types";
import { get, isArray, isNil, isObject } from "lodash";

export type LabelMode = "leaf" | "path" | "parent";
export type DisplayLabels = Record<string, string | string[]>;

const KEY_CONVENTIONS: [string, string, string][] = [
  ["value", "label", "children"],
  ["key", "title", "children"],
  ["key", "label", "children"],
  ["id", "name", "children"],
];

export function buildDisplayLabelConfig(
  schemas: any[],
  config: Record<string, LabelMode> = {}
): Record<string, LabelMode> {
  for (const schema of schemas) {
    const type = schema.type ?? "item";
    if (type === "group" || type === "list") {
      buildDisplayLabelConfig(schema.children ?? [], config);
    } else if (schema.field && schema.labelMode) {
      config[schema.field] = schema.labelMode;
    }
  }
  return config;
}

export function collectDisplayLabels(
  parsedSchemas: ParsedSchemas,
  model: Record<string, any>,
  adapter: CustomAdapter,
  displayLabelConfig: Record<string, LabelMode> = {}
): DisplayLabels {
  const displayLabels: DisplayLabels = {};
  walkSchemas(parsedSchemas, model, "", displayLabels, adapter, displayLabelConfig);
  return displayLabels;
}

function walkSchemas(
  schemas: any[],
  model: Record<string, any>,
  basePath: string,
  displayLabels: DisplayLabels,
  adapter: CustomAdapter,
  displayLabelConfig: Record<string, LabelMode>
) {
  for (const schema of schemas) {
    const type = schema.type ?? "item";

    if (type === "group") {
      walkSchemas(schema.children ?? [], model, basePath, displayLabels, adapter, displayLabelConfig);
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
            displayLabels,
            adapter,
            displayLabelConfig
          );
        });
      }
      continue;
    }

    if (!schema.field || !schema.componentProps) continue;

    const fieldPath = basePath ? `${basePath}.${schema.field}` : schema.field;
    const currentValue = get(model, fieldPath);
    if (isNil(currentValue)) continue;

    const mode: LabelMode = displayLabelConfig[schema.field] ?? "leaf";
    const label = resolveLabel(schema.componentProps, currentValue, adapter, mode);
    if (!isNil(label)) {
      displayLabels[fieldPath] = label;
    }
  }
}

function resolveLabel(
  componentProps: Record<string, any>,
  currentValue: any,
  adapter: CustomAdapter,
  mode: LabelMode
): string | string[] | null {
  const adapterKeys = adapter.resolveKeys?.(componentProps);
  const conventions: [string, string, string][] = adapterKeys
    ? [[adapterKeys.valueKey, adapterKeys.labelKey, adapterKeys.childrenKey], ...KEY_CONVENTIONS]
    : KEY_CONVENTIONS;

  for (const prop of Object.values(componentProps)) {
    if (!isArray(prop) || !prop.length || !isObject(prop[0]) || isArray(prop[0])) continue;

    for (const [valueKey, labelKey, childrenKey] of conventions) {
      const result = resolveByMode(prop, currentValue, valueKey, labelKey, childrenKey, mode);
      if (!isNil(result)) return result;
    }
  }

  return null;
}

function resolveByMode(
  options: any[],
  value: any,
  valueKey: string,
  labelKey: string,
  childrenKey: string,
  mode: LabelMode
): string | string[] | null {
  const resolve = (v: any): string | null => {
    const path = findAncestorPath(options, v, valueKey, labelKey, childrenKey);
    if (!path) return null;
    if (mode === "leaf") return path[path.length - 1] ?? null;
    if (mode === "path") return path.join(", ");
    return path.slice(-2).join(", ");
  };

  if (isArray(value)) {
    const results = value.map(resolve).filter((s): s is string => !isNil(s));
    return results.length ? results : null;
  }

  return resolve(value);
}

// Returns full ancestor path from root to matched node, skipping label-less intermediate nodes
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
