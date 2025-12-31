import path from 'path';
import { fileURLToPath } from 'url';
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

  // Configurar root do workspace para Turbopack
  turbopack: {
    root: __dirname,
    rules: {},
  },

  // Configurações do TypeScript
  typescript: {
    // ignoreBuildErrors: true, // Descomente se precisar ignorar erros durante build
  },
};

export default withSerwist(nextConfig);
