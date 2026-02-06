/**
 * v3Schema 应该致力于实现 And Or Not 的复合 CONDITION
 */

export function v10Schema() {
  return [
    {
      type: "group",
      label: "查询条件",
      children: [
        {
          component: "Select",
          field: "country",
          label: "国家",
          required: true,
          componentProps: {
            options: [
              { label: "中国", value: "CN" },
              { label: "美国", value: "US" },
              { label: "日本", value: "JP" },
              { label: "英国", value: "GB" },
              { label: "德国", value: "DE" },
              { label: "法国", value: "FR" },
              { label: "澳大利亚", value: "AU" },
              { label: "加拿大", value: "CA" },
            ],
            onChange: {
              $dispatch: "SET_SHARED",
              field: "cityOptions",
              as: {
                $dispatch: "GET",
                target:
                  "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records",
                params: {
                  select: "name,country_code",
                  where: "country_code = '$model.country'",
                  limit: 20,
                  order_by: "population desc",
                },
                path: "results",
                then: "$res.data",
              },
            },
          },
        },
        {
          component: "Select",
          field: "city",
          label: "城市",
          required: true,
          componentProps: {
            options: "$shared.cityOptions",
            fieldNames: {
              label: "name",
              value: "name",
            },
          },
        },
      ],
    },
  ];
}
