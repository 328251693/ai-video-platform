export type BillingCycle = "monthly" | "annual" | "one_time";
export type BillingPlanKey = "basic" | "pro" | "plus" | "ultra";

export type BillingPlan = {
  key: BillingPlanKey;
  name: string;
  description: string;
  cycle: BillingCycle;
  credits: number;
  price: string;
  pricePeriod: string;
  badge?: string;
  popular?: boolean;
};

export const BILLING_PLANS: readonly BillingPlan[] = [
  {
    key: "basic",
    name: "Basic",
    description: "For trying more models and creating regularly",
    cycle: "monthly",
    credits: 1800,
    price: "$29",
    pricePeriod: "/month",
  },
  {
    key: "pro",
    name: "Pro",
    description: "For independent creators and small teams",
    cycle: "monthly",
    credits: 3600,
    price: "$39",
    pricePeriod: "/month",
    popular: true,
  },
  {
    key: "plus",
    name: "Plus",
    description: "For high-volume creative workflows",
    cycle: "monthly",
    credits: 5400,
    price: "$49",
    pricePeriod: "/month",
  },
  {
    key: "ultra",
    name: "Ultra",
    description: "For production teams with heavy usage",
    cycle: "monthly",
    credits: 11000,
    price: "$99",
    pricePeriod: "/month",
  },
  {
    key: "basic",
    name: "Basic",
    description: "Annual access at the lowest monthly equivalent",
    cycle: "annual",
    credits: 19000,
    price: "$16",
    pricePeriod: "/month billed annually",
    badge: "50% OFF",
  },
  {
    key: "pro",
    name: "Pro",
    description: "Annual access for professional creators",
    cycle: "annual",
    credits: 36000,
    price: "$23",
    pricePeriod: "/month billed annually",
    badge: "50% OFF",
    popular: true,
  },
  {
    key: "plus",
    name: "Plus",
    description: "Annual access for high-volume work",
    cycle: "annual",
    credits: 64800,
    price: "$32",
    pricePeriod: "/month billed annually",
    badge: "50% OFF",
  },
  {
    key: "ultra",
    name: "Ultra",
    description: "Annual access for production teams",
    cycle: "annual",
    credits: 144000,
    price: "$69",
    pricePeriod: "/month billed annually",
    badge: "50% OFF",
  },
  {
    key: "basic",
    name: "Basic",
    description: "A one-time credit balance with no subscription",
    cycle: "one_time",
    credits: 1800,
    price: "$38",
    pricePeriod: "one-time",
  },
  {
    key: "pro",
    name: "Pro",
    description: "A larger one-time credit balance",
    cycle: "one_time",
    credits: 3600,
    price: "$60",
    pricePeriod: "one-time",
    popular: true,
  },
  {
    key: "plus",
    name: "Plus",
    description: "For occasional high-volume projects",
    cycle: "one_time",
    credits: 6500,
    price: "$99",
    pricePeriod: "one-time",
  },
];

export const BILLING_CYCLES: readonly {
  value: BillingCycle;
  label: string;
  detail: string;
}[] = [
  { value: "monthly", label: "Monthly", detail: "Flexible recurring access" },
  { value: "annual", label: "Annual", detail: "50% OFF" },
  { value: "one_time", label: "One-time", detail: "No subscription" },
];

export function getBillingPlan(key: string, cycle: BillingCycle) {
  return BILLING_PLANS.find((plan) => plan.key === key && plan.cycle === cycle);
}

export function getBillingPlans(cycle: BillingCycle) {
  return BILLING_PLANS.filter((plan) => plan.cycle === cycle);
}
