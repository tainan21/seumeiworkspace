/**
 * ⚠️ ARQUIVO DE EXEMPLO - NÃO SERÁ EXECUTADO
 * 
 * Exemplo de testes para validateWorkspaceName
 * 
 * Para usar:
 * 1. Instale Jest ou Vitest: npm install --save-dev jest @types/jest
 * 2. Renomeie este arquivo para validation.test.ts
 * 3. Configure o framework de testes
 * 4. Execute os testes: npm test
 * 
 * Demonstra que a função é pura, determinística e testável isoladamente
 */

// @ts-nocheck - Remova esta linha quando configurar testes
import { describe, it, expect } from "@jest/globals"; // ou vitest
import { validateWorkspaceName, WORKSPACE_NAME_VALIDATION } from "./validation";

describe("validateWorkspaceName", () => {
  describe("casos válidos", () => {
    it("deve aceitar nomes válidos simples", () => {
      const result = validateWorkspaceName("Meu Workspace");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("deve aceitar nomes com hífens no meio", () => {
      const result = validateWorkspaceName("Meu-Workspace");
      expect(result.valid).toBe(true);
    });

    it("deve aceitar nomes com números", () => {
      const result = validateWorkspaceName("Workspace 123");
      expect(result.valid).toBe(true);
    });

    it("deve aceitar nomes no limite mínimo (3 caracteres)", () => {
      const result = validateWorkspaceName("ABC");
      expect(result.valid).toBe(true);
    });

    it("deve aceitar nomes no limite máximo (50 caracteres)", () => {
      const name = "A".repeat(50);
      const result = validateWorkspaceName(name);
      expect(result.valid).toBe(true);
    });
  });

  describe("casos inválidos - comprimento", () => {
    it("deve rejeitar nomes muito curtos (< 3 caracteres)", () => {
      const result = validateWorkspaceName("AB");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("no mínimo 3 caracteres");
    });

    it("deve rejeitar nomes muito longos (> 50 caracteres)", () => {
      const name = "A".repeat(51);
      const result = validateWorkspaceName(name);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("no máximo 50 caracteres");
    });

    it("deve rejeitar strings vazias", () => {
      const result = validateWorkspaceName("");
      expect(result.valid).toBe(false);
    });
  });

  describe("casos inválidos - caracteres", () => {
    it("deve rejeitar nomes com caracteres especiais", () => {
      const result = validateWorkspaceName("Workspace@2024");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("apenas letras, números, espaços e hífens");
    });

    it("deve rejeitar nomes com underscores", () => {
      const result = validateWorkspaceName("Meu_Workspace");
      expect(result.valid).toBe(false);
    });

    it("deve rejeitar nomes com emojis", () => {
      const result = validateWorkspaceName("Workspace 🚀");
      expect(result.valid).toBe(false);
    });
  });

  describe("casos inválidos - início/fim", () => {
    it("deve rejeitar nomes que começam com hífen", () => {
      const result = validateWorkspaceName("-Workspace");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("não pode começar ou terminar com hífen");
    });

    it("deve rejeitar nomes que terminam com hífen", () => {
      const result = validateWorkspaceName("Workspace-");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("não pode começar ou terminar com hífen");
    });

    it("deve rejeitar nomes que começam com espaço", () => {
      const result = validateWorkspaceName(" Workspace");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("não pode começar ou terminar com espaço");
    });

    it("deve rejeitar nomes que terminam com espaço", () => {
      const result = validateWorkspaceName("Workspace ");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("não pode começar ou terminar com espaço");
    });
  });

  describe("casos inválidos - palavras reservadas", () => {
    it("deve rejeitar nome contendo 'admin'", () => {
      const result = validateWorkspaceName("Admin Workspace");
      expect(result.valid).toBe(false);
      expect(result.error).toContain('palavra reservada "admin"');
    });

    it("deve rejeitar nome contendo 'api'", () => {
      const result = validateWorkspaceName("My API");
      expect(result.valid).toBe(false);
      expect(result.error).toContain('palavra reservada "api"');
    });

    it("deve rejeitar nome contendo 'system'", () => {
      const result = validateWorkspaceName("System Core");
      expect(result.valid).toBe(false);
      expect(result.error).toContain('palavra reservada "system"');
    });

    it("deve rejeitar palavras reservadas case-insensitive", () => {
      const results = [
        validateWorkspaceName("ADMIN"),
        validateWorkspaceName("Api"),
        validateWorkspaceName("SyStEm"),
      ];

      results.forEach((result) => {
        expect(result.valid).toBe(false);
      });
    });
  });

  describe("casos inválidos - tipo", () => {
    it("deve rejeitar valores não-string", () => {
      const result = validateWorkspaceName(123 as any);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("deve ser uma string");
    });
  });

  describe("determinismo", () => {
    it("deve retornar o mesmo resultado para o mesmo input", () => {
      const name = "Test Workspace";
      const result1 = validateWorkspaceName(name);
      const result2 = validateWorkspaceName(name);
      
      expect(result1).toEqual(result2);
    });
  });

  describe("constantes de validação", () => {
    it("deve ter constantes corretas", () => {
      expect(WORKSPACE_NAME_VALIDATION.MIN_LENGTH).toBe(3);
      expect(WORKSPACE_NAME_VALIDATION.MAX_LENGTH).toBe(50);
      expect(WORKSPACE_NAME_VALIDATION.RESERVED_WORDS).toEqual([
        "admin",
        "api",
        "system",
      ]);
    });
  });
});

