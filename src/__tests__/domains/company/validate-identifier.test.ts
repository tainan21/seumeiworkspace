import { describe, it, expect } from "vitest";
import { validateCompanyIdentifier } from "~/domains/company";

describe("validateCompanyIdentifier", () => {
  describe("CNPJ", () => {
    it("deve validar CNPJ válido", () => {
      // CNPJ válido: 11.222.333/0001-81
      const result = validateCompanyIdentifier("11222333000181", "CNPJ");
      expect(result.status).toBe("valid");
      if (result.status === "valid") {
        expect(result.formatted).toBe("11.222.333/0001-81");
      }
    });

    it("deve rejeitar CNPJ inválido", () => {
      const result = validateCompanyIdentifier("12345678901234", "CNPJ");
      expect(result.status).toBe("invalid");
    });

    it("deve aceitar CNPJ vazio como opcional", () => {
      const result = validateCompanyIdentifier("", "CNPJ");
      expect(result.status).toBe("optional");
    });
  });

  describe("CPF", () => {
    it("deve validar CPF válido", () => {
      // CPF válido: 111.444.777-35
      const result = validateCompanyIdentifier("11144477735", "CPF");
      expect(result.status).toBe("valid");
      if (result.status === "valid") {
        expect(result.formatted).toBe("111.444.777-35");
      }
    });

    it("deve rejeitar CPF com dígitos repetidos", () => {
      const result = validateCompanyIdentifier("11111111111", "CPF");
      expect(result.status).toBe("invalid");
    });
  });
});
