export const DASHBOARD_PALETTES = ["ocean_blue", "warm_stone", "quiet_sage", "soft_slate", "muted_petrol"] as const;
export type DashboardPalette = (typeof DASHBOARD_PALETTES)[number];
export type ThemeMode = "system" | "light" | "dark";

type PaletteColors = {
  bg: string; surface: string; raised: string; mutedSurface: string; text: string; muted: string; border: string;
  brand: string; soft: string; hero: string; light: string; media: string; cover: string; climate: string;
};

type PaletteDefinition = { light: PaletteColors; dark: PaletteColors };

const active = { light: "#A96800", media: "#6D6084", cover: "#467783", climate: "#AF5540" };
const definitions: Record<DashboardPalette, PaletteDefinition> = {
  ocean_blue: {
    light: { bg: "#EDF3F7", surface: "#FFFFFF", raised: "#F7FAFC", mutedSurface: "#E5EDF3", text: "#17212B", muted: "#596978", border: "#D3DEE7", brand: "#087FB9", soft: "#DCEFF8", hero: "#087FB9", ...active },
    dark: { bg: "#101820", surface: "#17232D", raised: "#1D2C37", mutedSurface: "#243743", text: "#EEF6FB", muted: "#A8BAC7", border: "#344B5A", brand: "#63C7EF", soft: "#123D50", hero: "#086F9F", ...active }
  },
  warm_stone: {
    light: { bg: "#F3F0EA", surface: "#FFFEFC", raised: "#F8F5F0", mutedSurface: "#ECE7DE", text: "#292722", muted: "#6D6860", border: "#DDD6CC", brand: "#765F52", soft: "#EDE4DC", hero: "#765F52", light: "#A96500", media: "#765C86", cover: "#527985", climate: "#B6533A" },
    dark: { bg: "#181614", surface: "#211E1B", raised: "#2A2622", mutedSurface: "#302B26", text: "#F5F0EA", muted: "#C1B6AA", border: "#453D36", brand: "#C7A58E", soft: "#45352D", hero: "#765F52", light: "#D8942A", media: "#A88CBA", cover: "#75A6B2", climate: "#E08063" }
  },
  quiet_sage: {
    light: { bg: "#EEF2ED", surface: "#FCFDFB", raised: "#F5F8F4", mutedSurface: "#E3E9E2", text: "#202923", muted: "#617067", border: "#D3DDD4", brand: "#456F5C", soft: "#DDEBE3", hero: "#456F5C", light: "#A66A00", media: "#6F5C86", cover: "#3F7580", climate: "#B4513D" },
    dark: { bg: "#121814", surface: "#1A231D", raised: "#222D25", mutedSurface: "#29362D", text: "#EEF5EF", muted: "#AFC0B4", border: "#3A4B40", brand: "#83B49C", soft: "#233F31", hero: "#456F5C", light: "#D99A32", media: "#A590BA", cover: "#68A3AC", climate: "#DE806B" }
  },
  soft_slate: {
    light: { bg: "#EFF2F4", surface: "#FFFFFF", raised: "#F7F9FA", mutedSurface: "#E5EAED", text: "#20282D", muted: "#66737B", border: "#D5DDE2", brand: "#526975", soft: "#E1E9ED", hero: "#526975", ...active },
    dark: { bg: "#14191C", surface: "#1C2429", raised: "#242E34", mutedSurface: "#2B373E", text: "#F0F4F6", muted: "#ADBAC1", border: "#3C4B53", brand: "#98AFBB", soft: "#293F49", hero: "#526975", light: "#D99A32", media: "#A497B8", cover: "#71A5B1", climate: "#DF816A" }
  },
  muted_petrol: {
    light: { bg: "#ECF2F2", surface: "#FBFDFD", raised: "#F3F8F8", mutedSurface: "#DFE9E9", text: "#193033", muted: "#5C7072", border: "#CFDDDE", brand: "#316B6D", soft: "#D8E9E9", hero: "#316B6D", light: "#A76A00", media: "#6D5D86", cover: "#30757C", climate: "#B2503D" },
    dark: { bg: "#10191A", surface: "#172425", raised: "#1E2E30", mutedSurface: "#26383A", text: "#EEF6F6", muted: "#A9BDBE", border: "#385052", brand: "#75B4B5", soft: "#204244", hero: "#316B6D", light: "#D99A32", media: "#A391BA", cover: "#62A5AA", climate: "#DE806A" }
  }
};

export function applyDashboardPalette(element: HTMLElement, palette: DashboardPalette = "ocean_blue", mode: ThemeMode = "system"): void {
  const resolvedPalette = (DASHBOARD_PALETTES as readonly string[]).includes(palette) ? palette : "ocean_blue";
  const definition = definitions[resolvedPalette];
  const colors = definition[mode === "dark" ? "dark" : "light"];
  const system = mode === "system";
  const variables: Record<string, string> = {
    "--primary-color": colors.brand,
    "--hd-brand": colors.brand,
    "--hd-brand-soft": system ? `color-mix(in srgb, ${colors.brand} 14%, var(--card-background-color,#fff))` : colors.soft,
    "--hd-energy-brand": colors.brand,
    "--hd-energy-soft": system ? `color-mix(in srgb, ${colors.brand} 14%, var(--card-background-color,#fff))` : colors.soft,
    "--hd-hero": colors.hero,
    "--hd-hero-text": "#FFFFFF",
    "--state-light-active-color": colors.light,
    "--state-media-player-active-color": colors.media,
    "--state-cover-active-color": colors.cover,
    "--state-climate-heat-color": colors.climate
  };
  if (!system) Object.assign(variables, {
    "--primary-background-color": colors.bg,
    "--hd-bg": colors.bg,
    "--secondary-background-color": colors.mutedSurface,
    "--card-background-color": colors.surface,
    "--ha-card-background": colors.surface,
    "--primary-text-color": colors.text,
    "--secondary-text-color": colors.muted,
    "--divider-color": colors.border,
    "--hd-surface": colors.surface,
    "--hd-surface-raised": colors.raised,
    "--hd-surface-muted": colors.mutedSurface,
    "--hd-text": colors.text,
    "--hd-muted": colors.muted,
    "--hd-border": colors.border
  });
  for (const [property, value] of Object.entries(variables)) element.style.setProperty(property, value);
  element.dataset.palette = resolvedPalette;
}
