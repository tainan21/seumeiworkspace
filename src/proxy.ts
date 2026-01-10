import { createI18nMiddleware } from "next-international/middleware";
import { type NextRequest } from "next/server";

const I18nMiddleware = createI18nMiddleware({
  locales: ["pt", "en", "fr"],
  defaultLocale: "pt",
});

export function proxy(request: NextRequest) {
  return I18nMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|static|.*\\..*|_next|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

