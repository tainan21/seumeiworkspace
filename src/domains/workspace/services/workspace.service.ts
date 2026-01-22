import { prisma } from "~/lib/server/db";
import type { Workspace, WorkspaceMember, Wallet } from "@prisma/client";
import { WorkspaceType, WorkspaceCategory, WorkspaceStatus, WorkspaceRole } from "@prisma/client";

/**
 * Payload para criação de workspace
 * 
 * @public
 */
export interface CreateWorkspacePayload {
  /** Nome do workspace */
  name: string;
  /** Slug único do workspace */
  slug: string;
  /** Descrição opcional */
  description?: string;
  /** Tipo do workspace */
  type?: WorkspaceType;
  /** Categoria do workspace */
  category?: WorkspaceCategory;
  /** ID do usuário criador */
  createdById: string;
}

/**
 * Resultado da criação de workspace
 */
export interface CreateWorkspaceResult {
  workspace: Workspace;
  member: WorkspaceMember;
  wallet: Wallet;
}

/**
 * Gera um slug único baseado no nome
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9]+/g, "-") // Substitui caracteres especiais por hífen
    .replace(/^-+|-+$/g, ""); // Remove hífens no início e fim
}

/**
 * Valida se um slug é único
 */
export async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.workspace.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!existing) return true;
  if (excludeId && existing.id === excludeId) return true;
  
  return false;
}

/**
 * Gera um slug único adicionando sufixo numérico se necessário
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (!(await isSlugUnique(slug))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Cria um novo workspace com member e wallet
 * 
 * Esta função realiza uma transação que:
 * 1. Cria o workspace
 * 2. Adiciona o criador como OWNER
 * 3. Cria a wallet com saldo inicial de onboarding (1000 coins)
 * 4. Cria transação de onboarding bonus
 * 5. Inicializa OnboardingCompletion
 * 
 * @param payload - Dados do workspace
 * @returns Workspace, Member e Wallet criados
 * @throws Error se houver falha na criação
 * 
 * @example
 * ```ts
 * const result = await createWorkspace({
 *   name: "Meu Workspace",
 *   slug: "meu-workspace",
 *   createdById: userId,
 * });
 * ```
 */
export async function createWorkspace(
  payload: CreateWorkspacePayload
): Promise<CreateWorkspaceResult> {
  // Validações
  if (!payload.name?.trim()) {
    throw new Error("Nome do workspace é obrigatório");
  }

  if (!payload.createdById?.trim()) {
    throw new Error("Criador do workspace é obrigatório");
  }

  // Gerar slug único se não fornecido
  const slug = payload.slug?.trim() 
    ? payload.slug.trim() 
    : await generateUniqueSlug(payload.name);

  // Validar slug único
  if (!(await isSlugUnique(slug))) {
    throw new Error("Slug já está em uso. Por favor, escolha outro.");
  }

  // Criar workspace, member e wallet em uma transação
  const result = await prisma.$transaction(async (tx) => {
    // 1. Criar workspace
    const workspace = await tx.workspace.create({
      data: {
        name: payload.name.trim(),
        slug,
        description: payload.description?.trim(),
        type: payload.type ?? WorkspaceType.SINGLE_BUSINESS,
        category: payload.category ?? WorkspaceCategory.LIVRE,
        status: WorkspaceStatus.ACTIVE,
        createdById: payload.createdById,
        settings: {},
      },
    });

    // 2. Criar workspace member (owner)
    const member = await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: payload.createdById,
        role: WorkspaceRole.OWNER,
        permissions: [],
        isActive: true,
        joinedAt: new Date(),
      },
    });

    // 3. Criar wallet com saldo inicial de onboarding (1000 coins)
    const wallet = await tx.wallet.create({
      data: {
        workspaceId: workspace.id,
        balance: 1000, // Bônus de onboarding
        reservedBalance: 0,
        currency: "COIN",
      },
    });

    // 4. Criar transação de onboarding no wallet
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "ONBOARDING_BONUS",
        amount: 1000,
        description: "Bônus de boas-vindas ao criar workspace",
        referenceType: "WORKSPACE",
        referenceId: workspace.id,
      },
    });

    // 5. Inicializar OnboardingCompletion
    await tx.onboardingCompletion.create({
      data: {
        workspaceId: workspace.id,
        flowId: "default", // TODO: Buscar flow padrão baseado na categoria
        currentStep: 0,
        completedSteps: [],
        isCompleted: false,
      },
    });

    return { workspace, member, wallet };
  });

  return result;
}

/**
 * Busca workspace por slug
 */
export async function getWorkspaceBySlug(slug: string): Promise<Workspace | null> {
  if (!slug?.trim()) {
    return null;
  }

  return prisma.workspace.findUnique({
    where: { slug },
  });
}

/**
 * Busca workspace por ID
 */
export async function getWorkspaceById(id: string): Promise<Workspace | null> {
  if (!id?.trim()) {
    return null;
  }

  return prisma.workspace.findUnique({
    where: { id },
  });
}

/**
 * Busca todos os workspaces onde o usuário é membro
 */
export async function getWorkspacesByUserId(userId: string): Promise<Workspace[]> {
  if (!userId?.trim()) {
    return [];
  }

  const memberships = await prisma.workspaceMember.findMany({
    where: {
      userId,
      isActive: true,
    },
    include: {
      workspace: true,
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  return memberships.map((m) => m.workspace);
}

/**
 * Verifica se um usuário é membro de um workspace
 */
export async function isUserMemberOfWorkspace(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  if (!userId?.trim() || !workspaceId?.trim()) {
    return false;
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    select: { isActive: true },
  });

  return member?.isActive ?? false;
}

/**
 * Busca o role de um usuário em um workspace
 */
export async function getUserRoleInWorkspace(
  userId: string,
  workspaceId: string
): Promise<WorkspaceRole | null> {
  if (!userId?.trim() || !workspaceId?.trim()) {
    return null;
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    select: { role: true, isActive: true },
  });

  return member?.isActive ? member.role : null;
}

/**
 * Atualiza informações básicas do workspace
 */
export async function updateWorkspace(
  id: string,
  data: {
    name?: string;
    description?: string;
    category?: WorkspaceCategory;
  }
): Promise<Workspace> {
  if (!id?.trim()) {
    throw new Error("ID do workspace é obrigatório");
  }

  return prisma.workspace.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description?.trim() }),
      ...(data.category && { category: data.category }),
    },
  });
}
