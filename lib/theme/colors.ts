export const BRAND_COLORS = {
  lightLimeGreen: "#588157",
  mutedOliveGreen: "#819171",
  charcoalGreen: "#344e41",
  deepTealBlue: "#073b4c",
  steelTeal: "#28666e",
} as const;

export const BRAND_COLOR_USAGE = {
  primaryButton: BRAND_COLORS.lightLimeGreen,
  primaryButtonHover: BRAND_COLORS.charcoalGreen,
  sidebarBackground: BRAND_COLORS.deepTealBlue,
  secondaryElements: BRAND_COLORS.steelTeal,
  subtleBorders: BRAND_COLORS.mutedOliveGreen,
  headingText: BRAND_COLORS.charcoalGreen,
} as const;
