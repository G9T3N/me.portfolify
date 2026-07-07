export const NAVIGATION_TARGETS = ["_self", "_blank"] as const;
export type NavigationTarget = (typeof NAVIGATION_TARGETS)[number];
