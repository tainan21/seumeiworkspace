import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import withSerwistInit from "@serwist/next";

const require = createRequire(import.meta.url);
const webpack = require("webpack");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDevelopment = process.env.NODE_ENV === "development";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: isDevelopment,
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

  productionBrowserSourceMaps: false,
  
  logging: isDevelopment
    ? {
        fetches: {
          fullUrl: true,
        },
      }
    : undefined,

  webpack: (config, { dev, isServer }) => {
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    // Ignorar arquivos .md em node_modules
    config.module.rules.push({
      test: /\.md$/,
      include: /node_modules/,
      type: "asset/source",
    });
    
    // CORRIGIDO: Ignorar arquivos .d.ts completamente
    config.module.rules.push({
      test: /\.d\.ts$/,
      use: 'ignore-loader',
    });
    
    // Adicionar fallback para módulos node em caso de problemas
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Otimizar source maps em dev
    if (dev && !isServer) {
      config.devtool = 'eval-cheap-module-source-map';
    }
    
    return config;
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    // ignoreBuildErrors: true, // Mantenha desligado por enquanto
  },
};

export default withSerwist(nextConfig);
