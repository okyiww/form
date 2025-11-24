import { isArray } from "lodash";

export function processTransform(data: any, transform: AnyObject) {
  switch (transform.method) {
    case "map":
      if (isArray(data)) {
        return data.map((item: any) => {
          return {
            ...item,
            ...Object.keys(transform.relation).reduce((acc, current) => {
              return {
                ...acc,
                [transform.relation[current]]: item[current],
              };
            }, {}),
          };
        });
      }
      return data;
    default:
      return data;
  }
}
