/** Focused pages that render without the site navbar and footer. */
const BARE_PATHS = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];

export const hidesSiteChrome = (pathname: string) => BARE_PATHS.includes(pathname);
