/** Pure helpers shared by server code and the admin template preview (no database imports). */
export const fill = (text: string, vars: Record<string, string>) => text.replace(/\{\{(\w+)\}\}/g, (m, k) => vars[k] ?? m);

/** Example values for previews and test sends. */
export const SAMPLE_VARS = { name: "Ada", reference: "A1B2C3D4", state: "Lagos" };
