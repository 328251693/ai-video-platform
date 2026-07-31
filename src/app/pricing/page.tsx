import type { Metadata } from "next";
import PricingClient from "@/components/PricingClient";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose a monthly, annual, or one-time Credits plan.",
};

export default function PricingPage() {
  return <PricingClient />;
}
