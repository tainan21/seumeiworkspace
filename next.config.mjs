import path from "path";
import { fileURLToPath } from "url";
import withSerwistInit from "@serwist/next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,

  redirects: async () => [
    {
      source: "/dashboard",
      destination: "/dashboard/workspaces",
      permanent: false,
    },
  ],

  turbopack: {
    root: __dirname,
    rules: {},
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    // ignoreBuildErrors: true, // NÃO ligue agora
  },
};

export default withSerwist(nextConfig);
