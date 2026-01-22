import { type NextRequest } from "next/server";

/**
 * Supported locales in the application
 */
export const SUPPORTED_LOCALES = ["pt", "en", "fr", "es"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Mapping of country codes to preferred locales
 * Based on ISO 3166-1 alpha-2 country codes
 */
const COUNTRY_TO_LOCALE: Record<string, SupportedLocale> = {
    // Portuguese-speaking countries
    BR: "pt", // Brazil
    PT: "pt", // Portugal
    AO: "pt", // Angola
    MZ: "pt", // Mozambique

    // Spanish-speaking countries
    ES: "es", // Spain
    MX: "es", // Mexico
    AR: "es", // Argentina
    CO: "es", // Colombia
    CL: "es", // Chile
    PE: "es", // Peru
    VE: "es", // Venezuela
    EC: "es", // Ecuador
    GT: "es", // Guatemala
    CU: "es", // Cuba
    BO: "es", // Bolivia
    DO: "es", // Dominican Republic
    HN: "es", // Honduras
    PY: "es", // Paraguay
    SV: "es", // El Salvador
    NI: "es", // Nicaragua
    CR: "es", // Costa Rica
    PA: "es", // Panama
    UY: "es", // Uruguay

    // French-speaking countries
    FR: "fr", // France
    BE: "fr", // Belgium
    CH: "fr", // Switzerland
    CA: "fr", // Canada (Quebec)
    LU: "fr", // Luxembourg
    MC: "fr", // Monaco

    // English-speaking countries (default fallback)
    US: "en", // United States
    GB: "en", // United Kingdom
    AU: "en", // Australia
    NZ: "en", // New Zealand
    IE: "en", // Ireland
    ZA: "en", // South Africa
    IN: "en", // India
    SG: "en", // Singapore
};

/**
 * Extract country code from request headers
 * Supports Vercel and Cloudflare geolocation headers
 */
export function getCountryFromHeaders(request: NextRequest): string | null {
    // Vercel provides x-vercel-ip-country header
    const vercelCountry = request.headers.get("x-vercel-ip-country");
    if (vercelCountry) {
        return vercelCountry.toUpperCase();
    }

    // Cloudflare provides cf-ipcountry header
    const cloudflareCountry = request.headers.get("cf-ipcountry");
    if (cloudflareCountry && cloudflareCountry !== "XX") {
        return cloudflareCountry.toUpperCase();
    }

    return null;
}

/**
 * Map country code to supported locale
 */
export function mapCountryToLocale(countryCode: string): SupportedLocale | null {
    return COUNTRY_TO_LOCALE[countryCode.toUpperCase()] || null;
}

/**
 * Parse Accept-Language header and return best matching locale
 * Format: "en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7"
 */
export function parseAcceptLanguage(
    acceptLanguage: string | null
): SupportedLocale | null {
    if (!acceptLanguage) return null;

    // Parse language preferences with quality values
    const languages = acceptLanguage
        .split(",")
        .map((lang) => {
            const [locale, qValue] = lang.trim().split(";");
            const quality = qValue ? parseFloat(qValue.split("=")[1] || "1") : 1;
            return { locale: locale.toLowerCase(), quality };
        })
        .sort((a, b) => b.quality - a.quality);

    // Find first matching supported locale
    for (const { locale } of languages) {
        // Check exact match (e.g., "pt-br" -> "pt")
        const primaryLang = locale.split("-")[0];

        if (SUPPORTED_LOCALES.includes(primaryLang as SupportedLocale)) {
            return primaryLang as SupportedLocale;
        }
    }

    return null;
}

/**
 * Detect user's preferred locale based on multiple signals
 * Priority: geolocation > Accept-Language > default
 */
export function detectUserLocale(
    request: NextRequest,
    defaultLocale: SupportedLocale = "pt"
): SupportedLocale {
    // 1. Try geolocation-based detection
    const country = getCountryFromHeaders(request);
    if (country) {
        const localeFromCountry = mapCountryToLocale(country);
        if (localeFromCountry) {
            return localeFromCountry;
        }
    }

    // 2. Try Accept-Language header
    const acceptLanguage = request.headers.get("accept-language");
    const localeFromLanguage = parseAcceptLanguage(acceptLanguage);
    if (localeFromLanguage) {
        return localeFromLanguage;
    }

    // 3. Fallback to default
    return defaultLocale;
}
