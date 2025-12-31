/**
 * Classes de erro customizadas para o domínio de workspace
 * Este arquivo não usa "use server" pois classes podem ser usadas
 * tanto no servidor quanto no cliente
 */

/**
 * Erro customizado para limite de workspace
 */
export class WorkspaceLimitError extends Error {
  constructor(
    message = "Limite de workspace atingido. Máximo 1 workspace por usuário."
  ) {
    super(message);
    this.name = "WorkspaceLimitError";
  }
}

/**
 * Erro customizado para limite de projetos
 */
export class ProjectLimitError extends Error {
  constructor(
    message = "Limite de projetos atingido. Máximo 3 projetos por usuário."
  ) {
    super(message);
    this.name = "ProjectLimitError";
  }
}
