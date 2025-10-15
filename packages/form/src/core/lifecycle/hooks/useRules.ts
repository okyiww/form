import { isBoolean, isString } from "lodash";

export function useRules(schema: AnyObject) {
  let { rules, required } = schema;
  rules = rules ? [...rules] : [];
  const requiredRuleIndex = rules.findIndex(
    (rule: AnyObject) => required in rule
  );
  if (isString(required)) {
    const requiredRule = { required: true, message: required };
    if (requiredRuleIndex >= 0) {
      rules[requiredRuleIndex] = requiredRule;
    } else {
      rules.unshift(requiredRule);
    }
  } else if (isBoolean(required) && required) {
    const rule = { required: true, message: `${schema.label}不能为空` };
    if (requiredRuleIndex >= 0) {
      rules[requiredRuleIndex] = rule;
    } else {
      rules.unshift(rule);
    }
  }

  return rules;
}
