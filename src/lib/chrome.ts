/** Focused pages that render without the site navbar and footer. */
const BARE_PATHS = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];

/** The admin has its own header, so the storefront navbar and footer never show there. */
export const hidesSiteChrome = (pathname: string) => BARE_PATHS.includes(pathname) || pathname === "/admin" || pathname.startsWith("/admin/");
