/** The 36 states plus the FCT, as shown in the checkout/address dropdowns and stored on orders. */
export const STATES = [
  "Abia", "Abuja (FCT)", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna",
  "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
] as const;

export type NigerianState = (typeof STATES)[number];

const squash = (s: string) => s.toLowerCase().replace(/\bstate\b/g, "").replace(/[^a-z]/g, "");
const ALIASES: Record<string, NigerianState> = {
  abuja: "Abuja (FCT)",
  fct: "Abuja (FCT)",
  abujafct: "Abuja (FCT)",
  federalcapitalterritory: "Abuja (FCT)",
  akwaibom: "Akwa Ibom",
  crossriver: "Cross River",
};
const BY_KEY = new Map<string, NigerianState>([...STATES.map((s) => [squash(s), s] as const), ...Object.entries(ALIASES)]);

/** Maps free text ("lagos", "Lagos State", "FCT") to a canonical state name, or null if unknown. */
export function normalizeState(raw: string): NigerianState | null {
  return BY_KEY.get(squash(raw)) ?? null;
}
