export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-10-21";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "xuhfhjna";
export const studioUrl = "/studio";
export const canonicalStudioUrl =
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || "https://austin-leads-platform.sanity.studio";
export const frontendUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://texassolarandroofingpros.com";
export const localFrontendUrl = process.env.NEXT_PUBLIC_LOCAL_SITE_URL || "http://localhost:3000";
export const frontendOriginAllowlist = Array.from(
  new Set([frontendUrl, "https://texassolarandroofingpros.com", "https://www.texassolarandroofingpros.com"]),
);
export const useCdn = process.env.NODE_ENV === "production";

export function isSanityConfigured() {
  return Boolean(projectId && dataset);
}
