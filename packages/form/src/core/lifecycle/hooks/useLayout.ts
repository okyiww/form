import Runtime from "@/core/runtime";
import { isPlainObject, isString } from "lodash";

const schemaTypeToLayout = {
  item: "Item",
  group: "Group",
  list: "List",
  listItem: "ListItem",
};

export function useLayout(runtime: Runtime, schema: any, fallback?: string) {
  if (schema.type === "list") {
    const layouts = {
      List: runtime._render.meta.layouts.List,
      ListItem: runtime._render.meta.layouts.ListItem,
    };
    if (schema.layout?.List || schema.layout?.ListItem) {
      return {
        ...layouts,
        ...Object.keys(schema.layout).reduce((acc, key) => {
          if (isString(schema.layout[key])) {
            acc[key] =
              runtime._render.meta.layouts[
                schema.layout[key] as keyof typeof runtime._render.meta.layouts
              ];
            return acc;
          }
          if (isPlainObject(schema.layout[key])) {
            acc[key] = schema.layout[key];
            return acc;
          }
          acc[key] =
            runtime._render.meta.layouts[
              key as keyof typeof runtime._render.meta.layouts
            ];
          return acc;
        }, {} as Record<string, any>),
      };
    } else {
      return layouts;
    }
  }

  if (isString(schema.layout)) {
    return runtime._render.meta.layouts[
      schema.layout as keyof typeof runtime._render.meta.layouts
    ];
  }
  if (isPlainObject(schema.layout)) {
    return schema.layout;
  }
  if (fallback) {
    return runtime._render.meta.layouts[
      fallback as keyof typeof runtime._render.meta.layouts
    ];
  }
  return runtime._render.meta.layouts[
    schemaTypeToLayout[
      schema.type as keyof typeof schemaTypeToLayout
    ] as keyof typeof runtime._render.meta.layouts
  ];
}
