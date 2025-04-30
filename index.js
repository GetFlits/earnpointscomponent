
const findCommonElements = (arr1, arr2) => {
    const tags = arr2?.split(",");
    const set1 = new Set(arr1?.map((item) => item.toLowerCase()));
    return tags?.filter((item) => set1.has(item.trim().toLowerCase()));
  }; 
  export function FlitsProductPagePoint(
  customerID,
  customerOrderCount,
  productData,
  availableRules
  ) {
  let tempAmount = 0;
  const customerId = customerID;
  const customerOrder = parseInt(customerOrderCount || 0);
  
  const calculateAmount = (rule, value) =>
    rule.is_fixed ? rule.credits : (value * rule.credits) / 100;
  
  const orderRules = availableRules?.rules?.all_rules_data?.filter(
    (rule) => rule.module_on === "order_number"
  );
  
  const applicableOrderRule =
    customerId === "-1"
      ? orderRules[0]
      : orderRules.find(
          (rule) =>
            (parseInt(rule.column_value) === customerOrder + 1 &&
              rule.relation === "==") ||
            (parseInt(rule.column_value) <= customerOrder + 1 &&
              rule.relation === ">=")
        );
  
  if (applicableOrderRule) {
    tempAmount += calculateAmount(applicableOrderRule, (productData?.price / 100));
  }
  
  const productTagRule = availableRules?.rules?.all_rules_data?.filter(
    (rule) => rule.module_on === "product_tag"
  );
  
  if (productTagRule) {
    productTagRule.forEach((element) => {
      const matchingTags = findCommonElements(
        element?.avails,
        productData?.tags
      );
      if (matchingTags.length > 0) {
        tempAmount += calculateAmount(element, (productData?.price / 100));
      }
    });
  }
  tempAmount = tempAmount / 100;
  return Math.round(tempAmount);
  }
  
  export function FlitsCartPagePoint(
  customerID,
  customerOrderCount,
  cartData,
  availableRules,
  IS_PRODUCT_TAG_CREDIT_PER_QUANTITY
  ) {
  const calculateAmount = (ruleItem) => {
    if (!ruleItem) return 0;
    return ruleItem.is_fixed
      ? ruleItem.credits
      : (cartData.total_price * ruleItem.credits) / 10000;
  };
  if (!cartData?.items?.length || !availableRules) return 0;
  let tempEarnAmount = 0;
  const customerId = customerID;
  const customerOrder = parseInt(customerOrderCount || 0);
  
  const orderNumberRules = availableRules?.rules?.all_rules_data.filter(
    (rule) => rule.module_on === "order_number"
  );
  
  const ruleItem =
    customerId === "-1"
      ? orderNumberRules[0]
      : orderNumberRules.find(
          (rule) =>
            (parseInt(rule.column_value) === customerOrder + 1 &&
              rule.relation === "==") ||
            (parseInt(rule.column_value) <= customerOrder + 1 &&
              rule.relation === ">=")
        );
  
  tempEarnAmount += calculateAmount(ruleItem);
  
  let productTagCountTemp = 0;
  
  const productTagRules = availableRules?.rules?.all_rules_data.filter(
    (rule) => rule.module_on === "product_tag"
  );
  
  for (const item of cartData.items) {
    if (item?.tags && item?.price > 0) {
      productTagRules.forEach((element) => {
        const matchingTags = findCommonElements(
          element?.avails,
          item?.tags
        );
        if (matchingTags?.length > 0) {
          productTagCountTemp += element.is_fixed
            ? element.credits *
              (IS_PRODUCT_TAG_CREDIT_PER_QUANTITY === 1 ? item?.quantity : 1)
            : ((item?.price / 100) *
                (IS_PRODUCT_TAG_CREDIT_PER_QUANTITY === 1
                  ? item?.quantity
                  : 1) *
                element.credits) /
              100;
        }
      });
    }
  }
  
  const totalEarnAmount =(tempEarnAmount + productTagCountTemp) / 100;
  return Math.round(totalEarnAmount);
  }
  