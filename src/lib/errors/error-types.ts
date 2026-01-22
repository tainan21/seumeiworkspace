/**
 * Tipos de erro customizados
 */

/**
 * Erro de domínio (regra de negócio violada)
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "DomainError";
  }
}

/**
 * Erro de validação
 */
export class ValidationError extends DomainError {
  constructor(
    message: string,
    public fields?: Record<string, string[]>
  ) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

/**
 * Erro de autorização
 */
export class AuthorizationError extends DomainError {
  constructor(message: string = "Acesso não autorizado") {
    super(message, "AUTHORIZATION_ERROR", 403);
    this.name = "AuthorizationError";
  }
}

/**
 * Erro de autenticação
 */
export class AuthenticationError extends DomainError {
  constructor(message: string = "Não autenticado") {
    super(message, "AUTHENTICATION_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

/**
 * Erro de recurso não encontrado
 */
export class NotFoundError extends DomainError {
  constructor(message: string = "Recurso não encontrado") {
    super(message, "NOT_FOUND_ERROR", 404);
    this.name = "NotFoundError";
  }
}

/**
 * Erro de conflito (ex: recurso já existe)
 */
export class ConflictError extends DomainError {
  constructor(message: string = "Conflito de recursos") {
    super(message, "CONFLICT_ERROR", 409);
    this.name = "ConflictError";
  }
}

/**
 * Erro de limite atingido
 */
export class LimitError extends DomainError {
  constructor(
    message: string,
    public limit?: number,
    public current?: number
  ) {
    super(message, "LIMIT_ERROR", 403);
    this.name = "LimitError";
  }
}

/**
 * Erro de rate limit
 */
export class RateLimitError extends DomainError {
  constructor(
    message: string,
    public maxRequests?: number,
    public remaining?: number
  ) {
    super(message, "RATE_LIMIT_ERROR", 429);
    this.name = "RateLimitError";
  }
}
