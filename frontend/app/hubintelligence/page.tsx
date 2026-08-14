import type { Metadata } from "next";
import { HubIntelligenceWorkspace } from "@/components/insights/HubIntelligenceWorkspace";

export const metadata: Metadata = { title: "Hub Intelligence" };
export default function HubIntelligencePage() {
  return <HubIntelligenceWorkspace />;
}
