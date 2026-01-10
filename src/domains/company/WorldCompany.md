// ============================================
// DOMAIN: Company
// Regras de validação de identificadores (CNPJ/CPF)
// ============================================

import type { IdentifierType, ValidationResult } from "./company.types"

/**
 * Valida identificador de empresa (CNPJ ou CPF)
 * - Retorna 'optional' como válido se valor vazio (não bloqueia fluxo)
 * - Aplica checksum real para validação
 */
export function validateCompanyIdentifier(value: string | null | undefined, type: IdentifierType): ValidationResult {
  // Campo opcional - aceita vazio como válido
  if (!value || value.trim() === "") {
    return {
      status: "optional",
      message: "Identificador não informado (opcional)",
    }
  }

  const cleaned = value.replace(/\D/g, "")

  if (type === "CNPJ") {
    return validateCNPJ(cleaned)
  }

  return validateCPF(cleaned)
}

function validateCNPJ(cnpj: string): ValidationResult {
  const errors: string[] = []

  // Tamanho
  if (cnpj.length !== 14) {
    errors.push("CNPJ deve ter 14 dígitos")
  }

  // Sequência repetida
  if (/^(\d)\1+$/.test(cnpj)) {
    errors.push("CNPJ inválido: sequência repetida")
  }

  // Checksum (dígitos verificadores)
  if (cnpj.length === 14 && !verifyCNPJChecksum(cnpj)) {
    errors.push("Dígitos verificadores inválidos")
  }

  if (errors.length > 0) {
    return { status: "invalid", errors }
  }

  // Formatar: XX.XXX.XXX/XXXX-XX
  const formatted = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")

  return { status: "valid", formatted }
}

function validateCPF(cpf: string): ValidationResult {
  const errors: string[] = []

  if (cpf.length !== 11) {
    errors.push("CPF deve ter 11 dígitos")
  }

  if (/^(\d)\1+$/.test(cpf)) {
    errors.push("CPF inválido: sequência repetida")
  }

  if (cpf.length === 11 && !verifyCPFChecksum(cpf)) {
    errors.push("Dígitos verificadores inválidos")
  }

  if (errors.length > 0) {
    return { status: "invalid", errors }
  }

  const formatted = cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")

  return { status: "valid", formatted }
}

function verifyCNPJChecksum(cnpj: string): boolean {
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  const digits = cnpj.split("").map(Number)

  const sum1 = weights1.reduce((acc, w, i) => acc + w * digits[i], 0)
  const check1 = sum1 % 11 < 2 ? 0 : 11 - (sum1 % 11)

  if (check1 !== digits[12]) return false

  const sum2 = weights2.reduce((acc, w, i) => acc + w * digits[i], 0)
  const check2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11)

  return check2 === digits[13]
}

function verifyCPFChecksum(cpf: string): boolean {
  const digits = cpf.split("").map(Number)

  // Primeiro dígito verificador
  let sum1 = 0
  for (let i = 0; i < 9; i++) {
    sum1 += digits[i] * (10 - i)
  }
  const check1 = sum1 % 11 < 2 ? 0 : 11 - (sum1 % 11)

  if (check1 !== digits[9]) return false

  // Segundo dígito verificador
  let sum2 = 0
  for (let i = 0; i < 10; i++) {
    sum2 += digits[i] * (11 - i)
  }
  const check2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11)

  return check2 === digits[10]
}

// ============================================
// TESTES (executáveis mentalmente)
// ============================================
/*
TEST: validateCompanyIdentifier - CNPJ válido
INPUT: ('11.222.333/0001-81', 'CNPJ')
EXPECTED: { status: 'valid', formatted: '11.222.333/0001-81' }

TEST: validateCompanyIdentifier - CNPJ inválido (checksum)
INPUT: ('11.222.333/0001-99', 'CNPJ')
EXPECTED: { status: 'invalid', errors: ['Dígitos verificadores inválidos'] }

TEST: validateCompanyIdentifier - Vazio (opcional válido)
INPUT: ('', 'CNPJ')
EXPECTED: { status: 'optional', message: 'Identificador não informado (opcional)' }

TEST: validateCompanyIdentifier - CPF válido
INPUT: ('529.982.247-25', 'CPF')
EXPECTED: { status: 'valid', formatted: '529.982.247-25' }

TEST: validateCompanyIdentifier - CPF sequência repetida
INPUT: ('111.111.111-11', 'CPF')
EXPECTED: { status: 'invalid', errors: ['CPF inválido: sequência repetida'] }
*/

import type { IdentifierType, ValidationResult } from "@/types/workspace"

export type { IdentifierType, ValidationResult }

export interface ValidateIdentifierInput {
  value: string | null | undefined
  type: IdentifierType
}
