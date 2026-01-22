// ============================================
// TESTS: Company Domain - CNPJ/CPF Validation
// ============================================

import { describe, it, expect } from "vitest"
import { validateCompanyIdentifier } from "@/domains/company/company"

describe("validateCompanyIdentifier", () => {
  describe("CNPJ", () => {
    it("deve validar CNPJ correto", () => {
      // CNPJ válido de teste
      const result = validateCompanyIdentifier("11222333000181", "CNPJ")
      expect(result.status).toBe("valid")
      expect(result.formatted).toBe("11.222.333/0001-81")
    })

    it("deve rejeitar CNPJ com checksum errado", () => {
      const result = validateCompanyIdentifier("11222333000199", "CNPJ")
      expect(result.status).toBe("invalid")
      expect(result.errors).toContain("Dígitos verificadores inválidos")
    })

    it("deve rejeitar CNPJ com tamanho errado", () => {
      const result = validateCompanyIdentifier("1122233300018", "CNPJ")
      expect(result.status).toBe("invalid")
      expect(result.errors).toContain("CNPJ deve ter 14 dígitos")
    })

    it("deve rejeitar CNPJ com sequência repetida", () => {
      const result = validateCompanyIdentifier("11111111111111", "CNPJ")
      expect(result.status).toBe("invalid")
      expect(result.errors).toContain("CNPJ inválido: sequência repetida")
    })

    it("deve aceitar CNPJ formatado", () => {
      const result = validateCompanyIdentifier("11.222.333/0001-81", "CNPJ")
      expect(result.status).toBe("valid")
    })
  })

  describe("CPF", () => {
    it("deve validar CPF correto", () => {
      const result = validateCompanyIdentifier("52998224725", "CPF")
      expect(result.status).toBe("valid")
      expect(result.formatted).toBe("529.982.247-25")
    })

    it("deve rejeitar CPF com checksum errado", () => {
      const result = validateCompanyIdentifier("52998224799", "CPF")
      expect(result.status).toBe("invalid")
    })

    it("deve rejeitar CPF com sequência repetida", () => {
      const result = validateCompanyIdentifier("11111111111", "CPF")
      expect(result.status).toBe("invalid")
      expect(result.errors).toContain("CPF inválido: sequência repetida")
    })
  })

  describe("Optional", () => {
    it("deve retornar optional para valor vazio", () => {
      const result = validateCompanyIdentifier("", "CNPJ")
      expect(result.status).toBe("optional")
    })

    it("deve retornar optional para null", () => {
      const result = validateCompanyIdentifier(null, "CPF")
      expect(result.status).toBe("optional")
    })

    it("deve retornar optional para undefined", () => {
      const result = validateCompanyIdentifier(undefined, "CNPJ")
      expect(result.status).toBe("optional")
    })

    it("deve retornar optional para string com apenas espaços", () => {
      const result = validateCompanyIdentifier("   ", "CNPJ")
      expect(result.status).toBe("optional")
    })
  })
})
