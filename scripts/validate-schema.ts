#!/usr/bin/env tsx

/**
 * Script para validar schema Prisma
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Validando schema do Prisma...");

  try {
    // Tentar conectar ao banco
    await prisma.$connect();
    console.log("✅ Conexão com banco estabelecida");

    // Validar schema executando uma query simples
    await prisma.user.findFirst();
    console.log("✅ Schema válido");

    console.log("🎉 Validação concluída!");
  } catch (error) {
    console.error("❌ Erro na validação:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
