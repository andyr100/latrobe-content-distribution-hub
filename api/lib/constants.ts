export const classifications = ["Community News", "Event", "Career Opportunity", "Learning Resource", "Industry Update", "Tooling Update"] as const;
export type Classification = (typeof classifications)[number];
export function isClassification(value: unknown): value is Classification { return typeof value === "string" && classifications.includes(value as Classification); }
