/**
 * Testes unitários para Activity Log (Domain Layer)
 * 
 * Testa validação, formatação e edge cases
/**
 * Testes unitários para Activity Log (Domain Layer)
 * 
 * Testa validação, formatação e edge cases
 */

import { describe, it, expect } from "@jest/globals";
import { validateActivityLogData } from "./activity.validation";
import { formatActivityMessage, formatActivityLogForDisplay } from "./activity.formatter";
import type { CreateActivityLogData } from "./activity.types";

describe("Activity Log Validation", () => {
  describe("validateActivityLogData", () => {
    it("deve validar dados corretos", () => {
      const validData: CreateActivityLogData = {
        workspaceId: "ws_123",
        userId: "user_456",
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
        entityId: "proj_789",
        metadata: { name: "Test Project" },
      };

      const result = validateActivityLogData(validData);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("deve rejeitar workspaceId vazio", () => {
      const invalidData = {
        workspaceId: "",
        userId: "user_456",
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
      };

      const result = validateActivityLogData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("workspaceId");
    });

    it("deve rejeitar userId vazio", () => {
      const invalidData = {
        workspaceId: "ws_123",
        userId: "",
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
      };

      const result = validateActivityLogData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("userId");
    });

    it("deve rejeitar action inválida", () => {
      const invalidData = {
        workspaceId: "ws_123",
        userId: "user_456",
        action: "INVALID_ACTION",
        entityType: "PROJECT",
      };

      const result = validateActivityLogData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("action");
    });

    it("deve rejeitar entityType inválido", () => {
      const invalidData = {
        workspaceId: "ws_123",
        userId: "user_456",
        action: "PROJECT_CREATED",
        entityType: "INVALID_TYPE",
      };

      const result = validateActivityLogData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("entityType");
    });

    it("deve aceitar entityId opcional", () => {
      const validData = {
        workspaceId: "ws_123",
        userId: "user_456",
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
      };

      const result = validateActivityLogData(validData);
      expect(result.valid).toBe(true);
    });

    it("deve aceitar metadata opcional", () => {
      const validData = {
        workspaceId: "ws_123",
        userId: "user_456",
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
        metadata: { key: "value", nested: { data: true } },
      };

      const result = validateActivityLogData(validData);
      expect(result.valid).toBe(true);
    });

    it("deve rejeitar metadata que não é objeto", () => {
      const invalidData = {
        workspaceId: "ws_123",
        userId: "user_456",
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
        metadata: "not an object" as any,
      };

      const result = validateActivityLogData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("metadata");
    });

    it("deve rejeitar metadata que é array", () => {
      const invalidData = {
        workspaceId: "ws_123",
        userId: "user_456",
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
        metadata: [] as any,
      };

      const result = validateActivityLogData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("metadata");
    });
  });
});

describe("Activity Log Formatting", () => {
  describe("formatActivityMessage", () => {
    it("deve formatar mensagem com nome de usuário", () => {
      const message = formatActivityMessage(
        "PROJECT_CREATED",
        "PROJECT",
        "proj_123",
        "João Silva"
      );

      expect(message).toContain("João Silva");
      expect(message).toContain("criou o projeto");
      expect(message).toContain("Projeto");
    });

    it("deve formatar mensagem sem nome de usuário", () => {
      const message = formatActivityMessage(
        "PROJECT_CREATED",
        "PROJECT",
        "proj_123"
      );

      expect(message).toContain("Usuário");
      expect(message).toContain("criou o projeto");
    });

    it("deve formatar mensagem sem entityId", () => {
      const message = formatActivityMessage(
        "SETTINGS_UPDATED",
        "SETTINGS",
        undefined,
        "Maria Santos"
      );

      expect(message).toContain("Maria Santos");
      expect(message).toContain("atualizou as configurações");
      expect(message).not.toContain("(");
    });

    it("deve formatar todas as ações corretamente", () => {
      const actions = [
        "PROJECT_CREATED",
        "PROJECT_UPDATED",
        "PROJECT_DELETED",
        "MEMBER_INVITED",
        "MEMBER_REMOVED",
        "MEMBER_ROLE_CHANGED",
        "SETTINGS_UPDATED",
      ];

      actions.forEach((action) => {
        const message = formatActivityMessage(
          action as any,
          "PROJECT",
          undefined,
          "Test User"
        );
        expect(message).toBeTruthy();
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });

  describe("formatActivityLogForDisplay", () => {
    it("deve formatar log completo", () => {
      const log = {
        id: "log_123",
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
        entityId: "proj_456",
        userId: "user_789",
        userEmail: "test@example.com",
        workspaceId: "ws_abc",
        createdAt: new Date("2024-01-01T12:00:00Z"),
        metadata: { projectName: "Test Project" },
      };

      const formatted = formatActivityLogForDisplay(log, "Test User");

      expect(formatted.id).toBe("log_123");
      expect(formatted.action).toBe("PROJECT_CREATED");
      expect(formatted.entityType).toBe("PROJECT");
      expect(formatted.entityId).toBe("proj_456");
      expect(formatted.userId).toBe("user_789");
      expect(formatted.userEmail).toBe("test@example.com");
      expect(formatted.workspaceId).toBe("ws_abc");
      expect(formatted.timestamp).toBeInstanceOf(Date);
      expect(formatted.formattedMessage).toContain("Test User");
      expect(formatted.metadata).toEqual({ projectName: "Test Project" });
    });

    it("deve lidar com metadata null", () => {
      const log = {
        id: "log_123",
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
        userId: "user_789",
        workspaceId: "ws_abc",
        createdAt: new Date(),
        metadata: null,
      };

      const formatted = formatActivityLogForDisplay(log);
      expect(formatted.metadata).toBeUndefined();
    });

    it("deve lidar com metadata array (inválido)", () => {
      const log = {
        id: "log_123",
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
        userId: "user_789",
        workspaceId: "ws_abc",
        createdAt: new Date(),
        metadata: [] as any,
      };

      const formatted = formatActivityLogForDisplay(log);
      expect(formatted.metadata).toBeUndefined();
    });

    it("deve lidar com action desconhecida", () => {
      const log = {
        id: "log_123",
        action: "UNKNOWN_ACTION",
        entityType: "PROJECT",
        userId: "user_789",
        workspaceId: "ws_abc",
        createdAt: new Date(),
      };

      // Deve usar fallback para action desconhecida
      const formatted = formatActivityLogForDisplay(log);
      expect(formatted.action).toBe("SETTINGS_UPDATED"); // Fallback
    });

    it("deve lidar com entityType desconhecido", () => {
      const log = {
        id: "log_123",
        action: "PROJECT_CREATED",
        entityType: "UNKNOWN_TYPE",
        userId: "user_789",
        workspaceId: "ws_abc",
        createdAt: new Date(),
      };

      // Deve usar fallback para entityType desconhecido
      const formatted = formatActivityLogForDisplay(log);
      expect(formatted.entityType).toBe("WORKSPACE"); // Fallback
    });
  });
});

describe("Activity Log Edge Cases", () => {
  it("deve lidar com metadata muito grande", () => {
    const largeMetadata: Record<string, any> = {};
    for (let i = 0; i < 1000; i++) {
      largeMetadata[`key_${i}`] = `value_${i}`;
    }

    const data = {
      workspaceId: "ws_123",
      userId: "user_456",
      action: "PROJECT_CREATED",
      entityType: "PROJECT",
      metadata: largeMetadata,
    };

    const result = validateActivityLogData(data);
    expect(result.valid).toBe(true);
    // Nota: Validação de tamanho de metadata deve ser feita na Application layer
  });

  it("deve lidar com strings com caracteres especiais", () => {
    const data = {
      workspaceId: "ws_<script>alert('xss')</script>",
      userId: "user_'; DROP TABLE users; --",
      action: "PROJECT_CREATED",
      entityType: "PROJECT",
    };

    const result = validateActivityLogData(data);
    expect(result.valid).toBe(true);
    // Nota: Sanitização deve ser feita na Application/Infra layer
  });

  it("deve lidar com valores null em campos opcionais", () => {
    const log = {
      id: "log_123",
      action: "PROJECT_CREATED",
      entityType: "PROJECT",
      entityId: null,
      userId: "user_789",
      userEmail: null,
      workspaceId: "ws_abc",
      createdAt: new Date(),
      metadata: null,
    };

    const formatted = formatActivityLogForDisplay(log);
    expect(formatted.entityId).toBeUndefined();
    expect(formatted.userEmail).toBeUndefined();
    expect(formatted.metadata).toBeUndefined();
  });
});

