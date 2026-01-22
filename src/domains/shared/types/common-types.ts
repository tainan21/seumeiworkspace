/**
 * Tipos comuns compartilhados entre domínios
 */

/**
 * Status genérico para entidades
 */
export type EntityStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "DELETED";

/**
 * Tipo de ordenação
 */
export type SortOrder = "asc" | "desc";

/**
 * Parâmetros de paginação
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Resultado paginado
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Filtros genéricos
 */
export interface BaseFilters {
  search?: string;
  status?: EntityStatus;
}

/**
 * Resultado de operação
 */
export type OperationResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * Endereço completo
 */
export interface Address {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

/**
 * Contato
 */
export interface Contact {
  email?: string;
  phone?: string;
}
