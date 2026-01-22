import { describe, it, expect, vi, beforeEach } from "vitest";
import * as WorkspaceService from "~/domains/workspace/services/workspace.service";

// Mock do Prisma
vi.mock("~/lib/server/db", () => ({
  prisma: {
    workspace: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    workspaceMember: {
      findUnique: vi.fn(),
    },
  },
}));

describe("WorkspaceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getWorkspaceBySlug", () => {
    it("deve retornar null se slug for vazio", async () => {
      const result = await WorkspaceService.getWorkspaceBySlug("");
      expect(result).toBeNull();
    });

    it("deve retornar null se slug for apenas espaços", async () => {
      const result = await WorkspaceService.getWorkspaceBySlug("   ");
      expect(result).toBeNull();
    });
  });

  describe("isSlugUnique", () => {
    it("deve retornar true se slug não existir", async () => {
      const { prisma } = await import("~/lib/server/db");
      vi.mocked(prisma.workspace.findUnique).mockResolvedValue(null);

      const result = await WorkspaceService.isSlugUnique("novo-slug");
      expect(result).toBe(true);
    });

    it("deve retornar false se slug já existir", async () => {
      const { prisma } = await import("~/lib/server/db");
      vi.mocked(prisma.workspace.findUnique).mockResolvedValue({
        id: "123",
      } as any);

      const result = await WorkspaceService.isSlugUnique("slug-existente");
      expect(result).toBe(false);
    });
  });
});
