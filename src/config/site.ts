export const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://seumei.taicode.com.br";

export const siteConfig = (locale: string = "en") => ({
  name: "Seumei",
  url: siteUrl + "/" + locale,
  ogImage: `${siteUrl}/${locale}/opengraph-image`,
  description: "Quick Starter Template for your Next project.",
  links: {
    twitter: "#",
    github: "#",
  },
});

export type SiteConfig = typeof siteConfig;
