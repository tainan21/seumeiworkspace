#!/usr/bin/env tsx

/**
 * Script para popular banco de dados com dados de teste
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Criar usuário de teste
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Usuário Teste",
      emailVerifiedAt: new Date(),
    },
  });

  console.log("✅ Usuário criado:", user.email);

  // Criar features de exemplo
  const features = [
    {
      code: "dashboard",
      name: "Dashboard",
      category: "CORE" as const,
      description: "Painel principal com visão geral",
      isActive: true,
      isPublic: true,
    },
    {
      code: "projects",
      name: "Projetos",
      category: "CORE" as const,
      description: "Gestão de projetos e tarefas",
      isActive: true,
      isPublic: true,
    },
    {
      code: "analytics",
      name: "Analytics",
      category: "AI" as const,
      description: "Análises e métricas avançadas",
      isActive: true,
      isPublic: true,
    },
  ];

  for (const featureData of features) {
    const feature = await prisma.feature.upsert({
      where: { code: featureData.code },
      update: featureData,
      create: featureData,
    });
    console.log(`✅ Feature criada: ${feature.code}`);
  }

  console.log("🎉 Seed concluído!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
