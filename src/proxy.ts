import { createI18nMiddleware } from "next-international/middleware";
import { type NextRequest } from "next/server";
import { detectUserLocale, type SupportedLocale } from "./lib/locale-detector";

const I18nMiddleware = createI18nMiddleware({
  locales: ["pt", "en", "fr", "es"],
  defaultLocale: "pt",
  urlMappingStrategy: "rewriteDefault",
});

export function proxy(request: NextRequest) {
  // Check if user has already selected a locale (stored in cookie or URL)
  const url = new URL(request.url);
  const pathLocale = url.pathname.split("/")[1];
  const supportedLocales = ["pt", "en", "fr", "es"];

  // If URL already has a valid locale, respect it (user preference)
  if (supportedLocales.includes(pathLocale)) {
    return I18nMiddleware(request);
  }

  // Check if there's a locale cookie (user has previously selected a language)
  const localeCookie = request.cookies.get("NEXT_LOCALE");
  if (localeCookie && supportedLocales.includes(localeCookie.value)) {
    return I18nMiddleware(request);
  }

  // Auto-detect locale based on geolocation and Accept-Language
  const detectedLocale = detectUserLocale(request, "pt");

  // Log detection for debugging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log(`[i18n] Auto-detected locale: ${detectedLocale} for ${url.pathname}`);
  }

  // Clone the request and add detected locale to headers for the middleware
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-detected-locale", detectedLocale);

  return I18nMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|static|.*\\..*|_next|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

