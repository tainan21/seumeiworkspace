/**
 * Validação de nome de workspace (Domain Layer)
 * Função pura, framework-agnostic, determinística e testável
 */

/**
 * Constantes de validação de nome de workspace
 */
export const WORKSPACE_NAME_VALIDATION = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 50,
  RESERVED_WORDS: ["admin", "api", "system"],
  PATTERN: /^[a-zA-Z0-9\s\-]+$/,
} as const;

/**
 * Resultado da validação de nome de workspace
 */
export type WorkspaceNameValidationResult = {
  valid: boolean;
  error?: string;
};

/**
 * Valida o nome de um workspace segundo as regras de domínio
 * 
 * Regras:
 * - Mínimo 3 caracteres, máximo 50
 * - Apenas letras, números, espaços e hífens
 * - Não pode começar ou terminar com espaço ou hífen
 * - Não pode conter palavras reservadas: "admin", "api", "system"
 * 
 * @param name - Nome do workspace a ser validado
 * @returns Objeto com resultado da validação e mensagem de erro (se houver)
 */
export function validateWorkspaceName(
  name: string
): WorkspaceNameValidationResult {
  // Validação de tipo básico
  if (typeof name !== "string") {
    return {
      valid: false,
      error: "Nome do workspace deve ser uma string",
    };
  }

  // Remove espaços nas extremidades para validação
  const trimmedName = name.trim();

  // Validação de comprimento mínimo
  if (trimmedName.length < WORKSPACE_NAME_VALIDATION.MIN_LENGTH) {
    return {
      valid: false,
      error: `Nome do workspace deve ter no mínimo ${WORKSPACE_NAME_VALIDATION.MIN_LENGTH} caracteres`,
    };
  }

  // Validação de comprimento máximo
  if (trimmedName.length > WORKSPACE_NAME_VALIDATION.MAX_LENGTH) {
    return {
      valid: false,
      error: `Nome do workspace deve ter no máximo ${WORKSPACE_NAME_VALIDATION.MAX_LENGTH} caracteres`,
    };
  }

  // Validação de caracteres permitidos
  if (!WORKSPACE_NAME_VALIDATION.PATTERN.test(trimmedName)) {
    return {
      valid: false,
      error: "Nome do workspace deve conter apenas letras, números, espaços e hífens",
    };
  }

  // Validação de início/fim com espaço ou hífen
  if (trimmedName.startsWith(" ") || trimmedName.endsWith(" ")) {
    return {
      valid: false,
      error: "Nome do workspace não pode começar ou terminar com espaço",
    };
  }

  if (trimmedName.startsWith("-") || trimmedName.endsWith("-")) {
    return {
      valid: false,
      error: "Nome do workspace não pode começar ou terminar com hífen",
    };
  }

  // Validação de palavras reservadas (case-insensitive)
  const lowerName = trimmedName.toLowerCase();
  for (const reserved of WORKSPACE_NAME_VALIDATION.RESERVED_WORDS) {
    if (lowerName.includes(reserved)) {
      return {
        valid: false,
        error: `Nome do workspace não pode conter a palavra reservada "${reserved}"`,
      };
    }
  }

  // Validação bem-sucedida
  return {
    valid: true,
  };
}

