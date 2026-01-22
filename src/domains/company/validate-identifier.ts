/**
 * Tipo de identificador
 */
export type IdentifierType = "CNPJ" | "CPF";

/**
 * Resultado da validação
 */
export type ValidationResult =
  | { status: "valid"; formatted: string }
  | { status: "invalid"; errors: string[] }
  | { status: "optional"; message: string };

/**
 * Valida um identificador (CNPJ ou CPF)
 * 
 * @param value - Valor do identificador (pode conter formatação)
 * @param type - Tipo do identificador (CNPJ ou CPF)
 * @returns ValidationResult com status e dados formatados ou erros
 */
export function validateCompanyIdentifier(
  value: string | null | undefined,
  type: IdentifierType
): ValidationResult {
  // Campo opcional - aceita vazio
  if (!value || value.trim() === "") {
    return {
      status: "optional",
      message: "Identificador não informado",
    };
  }

  // Remove formatação
  const cleaned = value.replace(/\D/g, "");

  if (type === "CNPJ") {
    return validateCNPJ(cleaned);
  }

  return validateCPF(cleaned);
}

/**
 * Valida CNPJ com checksum
 */
function validateCNPJ(cnpj: string): ValidationResult {
  const errors: string[] = [];

  // Se estiver vazio ou muito curto, considerar como "em digitação"
  if (cnpj.length === 0) {
    return { status: "optional", message: "CNPJ não informado" };
  }

  // Se ainda está sendo digitado (menos de 14 dígitos), não validar ainda
  if (cnpj.length < 14) {
    return { status: "optional", message: "Digite o CNPJ completo" };
  }

  // Tamanho
  if (cnpj.length !== 14) {
    errors.push("CNPJ deve ter exatamente 14 dígitos");
    return { status: "invalid", errors };
  }

  // Sequência repetida (ex: 11111111111111)
  if (/^(\d)\1+$/.test(cnpj)) {
    errors.push("CNPJ inválido: sequência repetida");
  }

  // Checksum (dígitos verificadores) - só validar se tiver 14 dígitos
  if (!verifyCNPJChecksum(cnpj)) {
    errors.push("CNPJ inválido: dígitos verificadores incorretos");
  }

  if (errors.length > 0) {
    return { status: "invalid", errors };
  }

  // Formatar: XX.XXX.XXX/XXXX-XX
  const formatted = cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );

  return { status: "valid", formatted };
}

/**
 * Valida CPF com checksum
 */
function validateCPF(cpf: string): ValidationResult {
  const errors: string[] = [];

  // Se estiver vazio ou muito curto, considerar como "em digitação"
  if (cpf.length === 0) {
    return { status: "optional", message: "CPF não informado" };
  }

  // Se ainda está sendo digitado (menos de 11 dígitos), não validar ainda
  if (cpf.length < 11) {
    return { status: "optional", message: "Digite o CPF completo" };
  }

  // Tamanho
  if (cpf.length !== 11) {
    errors.push("CPF deve ter exatamente 11 dígitos");
    return { status: "invalid", errors };
  }

  // Sequência repetida (ex: 11111111111)
  if (/^(\d)\1+$/.test(cpf)) {
    errors.push("CPF inválido: sequência repetida");
  }

  // Checksum (dígitos verificadores) - só validar se tiver 11 dígitos
  if (!verifyCPFChecksum(cpf)) {
    errors.push("CPF inválido: dígitos verificadores incorretos");
  }

  if (errors.length > 0) {
    return { status: "invalid", errors };
  }

  // Formatar: XXX.XXX.XXX-XX
  const formatted = cpf.replace(
    /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
    "$1.$2.$3-$4"
  );

  return { status: "valid", formatted };
}

/**
 * Verifica checksum do CNPJ
 * Algoritmo: https://www.macoratti.net/alg_cnpj.htm
 */
function verifyCNPJChecksum(cnpj: string): boolean {
  if (cnpj.length !== 14) {
    return false;
  }

  const digits = cnpj.split("").map(Number);

  // Primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const sum1 = weights1.reduce((acc, w, i) => acc + w * digits[i], 0);
  const check1 = sum1 % 11 < 2 ? 0 : 11 - (sum1 % 11);

  if (check1 !== digits[12]) {
    return false;
  }

  // Segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const sum2 = weights2.reduce((acc, w, i) => acc + w * digits[i], 0);
  const check2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11);

  return check2 === digits[13];
}

/**
 * Verifica checksum do CPF
 * Algoritmo: https://www.macoratti.net/alg_cpf.htm
 */
function verifyCPFChecksum(cpf: string): boolean {
  if (cpf.length !== 11) {
    return false;
  }

  const digits = cpf.split("").map(Number);

  // Primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  let check1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

  if (check1 !== digits[9]) {
    return false;
  }

  // Segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  const check2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

  return check2 === digits[10];
}
