// ============================================
// API: POST /api/workspace/create
// Cria workspace via onboarding com autenticação real
// ============================================

import { type NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "~/lib/server/auth/session";
import { createWorkspace as createWorkspaceDomain } from "~/domains/workspace/workspace-create";
import { getUserPlan } from "~/domains/workspace/rules/enforce-single-free-workspace";
import { getWorkspacesByUserId } from "~/domains/workspace/services/workspace.service";
import { prisma } from "~/lib/server/db";
import type {
  CreateWorkspaceInput,
  CreateWorkspaceContext,
  Workspace,
} from "~/types/workspace-onboarding";
// Enums serão gerados pelo Prisma após migration
// Por enquanto, usar tipos do workspace-onboarding
import type {
  ThemeStyle,
  TopBarVariant,
  BillingPlan,
  IdentifierType,
  CompanyType,
} from "~/types/workspace-onboarding";

export async function POST(request: NextRequest) {
  try {
    // 1. Autenticação
    const { user } = await getCurrentSession();
    if (!user?.id) {
      return NextResponse.json(
        { success: false, errors: [{ code: "UNAUTHORIZED", message: "Usuário não autenticado" }] },
        { status: 401 }
      );
    }

    // 2. Parse body
    const body = await request.json();

    // 3. Validar input básico
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { success: false, errors: [{ code: "VALIDATION_ERROR", message: "Nome é obrigatório" }] },
        { status: 400 }
      );
    }

    // 4. Montar input para domain (userId vem do session, não do body)
    const input: CreateWorkspaceInput = {
      userId: user.id, // Usar userId da sessão
      name: body.name,
      slug: body.slug,
      brand: body.brand || { colors: { primary: "#18181B", accent: "#3B82F6" } },
      company: body.company || { name: body.name },
      theme: body.theme || "minimal",
      companyType: body.companyType || "Simples",
      employeeCount: body.employeeCount,
      revenueRange: body.revenueRange,
      template: body.template,
      selectedFeatures: body.selectedFeatures || [],
      menuComponents: body.menuComponents || [],
      topBarVariant: body.topBarVariant || "barTop-A",
    };

    // 5. Buscar workspaces existentes do usuário
    const existingWorkspacesDb = await getWorkspacesByUserId(user.id);
    
    // Transformar para formato do domain
    const existingWorkspaces: Workspace[] = existingWorkspacesDb.map((w) => {
      // Buscar dados relacionados se existirem
      const settings = (w.settings as any) || {};
      return {
        workspaceId: w.id,
        slug: w.slug,
        name: w.name,
        brand: {
          colors: {
            primary: "#18181B",
            accent: "#3B82F6",
          },
        },
        company: {
          name: w.name,
        },
        apps: [],
        menuItems: [],
        topBarVariant: (settings.topBarVariant as TopBarVariant) || "barTop-A",
        theme: (settings.theme as ThemeStyle) || "minimal",
        ownerId: w.createdById,
        createdBy: w.createdById,
        settings: {
          billingPlan: (settings.billingPlan as BillingPlan) || "free",
          locale: settings.locale || "pt-BR",
          timezone: settings.timezone || "America/Sao_Paulo",
        },
        rbac: {
          roles: [],
          defaultRole: "member",
        },
        createdAt: w.createdAt.toISOString(),
        updatedAt: w.updatedAt.toISOString(),
      };
    });

    // 6. Obter plano do usuário
    const userPlan = await getUserPlan(user.id);

    // 7. Montar contexto
    const context: CreateWorkspaceContext = {
      existingWorkspaces,
      userPlan: userPlan as "free" | "pro" | "enterprise",
    };

    // 8. Executar domain function (valida e monta workspace)
    const result = await createWorkspaceDomain(input, context);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    // 9. Persistir no banco via Prisma
    const workspaceData = result.workspace;

    // Criar workspace com todos os dados relacionados
    const dbWorkspace = await prisma.$transaction(async (tx) => {
      // Criar workspace principal
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceData.name,
          slug: workspaceData.slug,
          createdById: user.id,
          theme: (workspaceData.theme?.replace("-", "_") || "minimal") as any,
          topBarVariant: (workspaceData.topBarVariant?.replace("-", "_") || "barTop_A") as any,
          billingPlan: (workspaceData.settings.billingPlan || "free") as any,
          locale: workspaceData.settings.locale || "pt-BR",
          timezone: workspaceData.settings.timezone || "America/Sao_Paulo",
        },
      });

      // Criar brand
      if (workspaceData.brand) {
        await tx.workspaceBrand.create({
          data: {
            workspaceId: workspace.id,
            logoUrl: workspaceData.brand.logo || null,
            primaryColor: workspaceData.brand.colors.primary || "#18181B",
            accentColor: workspaceData.brand.colors.accent || "#3B82F6",
          },
        });
      }

      // Criar company
      await tx.workspaceCompany.create({
        data: {
          workspaceId: workspace.id,
          name: workspaceData.company.name,
          identifierType: workspaceData.company.identifier?.type || null,
          identifierValue: workspaceData.company.identifier?.value || null,
          companyType: input.companyType || null,
          employeeCount: input.employeeCount || null,
          revenueRange: input.revenueRange || null,
        },
      });

      // Criar apps
      for (const appId of workspaceData.apps) {
        await (tx as any).workspaceApp.create({
          data: {
            workspaceId: workspace.id,
            appId,
            isEnabled: true,
          },
        });
      }

      // Criar menu items
      for (const item of workspaceData.menuItems) {
        await (tx as any).menuItem.create({
          data: {
            workspaceId: workspace.id,
            itemId: item.id,
            label: item.label,
            icon: item.icon,
            route: item.route,
            parentId: null,
            orderIndex: item.order,
            isVisible: true,
          },
        });
      }

      // Criar member (owner)
      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: "OWNER",
          permissions: [],
          isActive: true,
          joinedAt: new Date(),
        },
      });

      return workspace;
    });

    // 10. Buscar dados completos para montar WorkspaceLayoutContract
    const brand = await prisma.workspaceBrand.findUnique({
      where: { workspaceId: dbWorkspace.id },
    });

    const menuItemsDb = await prisma.menuItem.findMany({
      where: { workspaceId: dbWorkspace.id },
      orderBy: { orderIndex: "asc" },
    });

    const appsDb = await prisma.workspaceApp.findMany({
      where: { workspaceId: dbWorkspace.id },
      select: { appId: true },
    });

    // Montar WorkspaceLayoutContract
    const workspaceLayoutContract = {
      workspaceId: dbWorkspace.id,
      slug: dbWorkspace.slug,
      name: dbWorkspace.name,
      theme: (dbWorkspace.theme?.replace("_", "-") || "minimal") as ThemeStyle,
      brand: {
        colors: {
          primary: brand?.primaryColor || "#18181B",
          accent: brand?.accentColor || "#3B82F6",
        },
        logo: brand?.logoUrl || undefined,
      },
      menuItems: menuItemsDb.map((item) => ({
        id: item.itemId,
        label: item.label,
        icon: item.icon || "FolderKanban",
        order: item.orderIndex,
        route: item.route,
      })),
      topBarVariant: (dbWorkspace.topBarVariant?.replace("_", "-") || "barTop-A") as TopBarVariant,
      apps: appsDb.map((app) => app.appId),
    };

    // 11. Retornar WorkspaceLayoutContract
    return NextResponse.json({
      success: true,
      workspace: workspaceLayoutContract,
      workspaceSlug: dbWorkspace.slug,
      workspaceId: dbWorkspace.id,
    });
  } catch (error) {
    console.error("[API] Erro ao criar workspace:", error);
    return NextResponse.json(
      {
        success: false,
        errors: [
          {
            code: "INTERNAL_ERROR",
            message: error instanceof Error ? error.message : "Erro interno do servidor",
          },
        ],
      },
      { status: 500 }
    );
  }
}
