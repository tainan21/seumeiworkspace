#!/usr/bin/env tsx

/**
 * Script para gerar tipos TypeScript a partir do schema Prisma
 */

import { execSync } from "child_process";
import { logger } from "../src/lib/logger/logger";

async function main() {
  console.log("🔧 Gerando tipos do Prisma...");

  try {
    execSync("npx prisma generate", {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    console.log("✅ Tipos gerados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao gerar tipos:", error);
    process.exit(1);
  }
}

main();
