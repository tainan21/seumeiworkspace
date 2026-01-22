import { z } from "zod";
import {
  emailSchema,
  phoneSchema,
  zipCodeSchema,
  slugSchema,
  nameSchema,
  descriptionSchema,
  stateSchema,
} from "~/domains/shared/validation/common-validators";

/**
 * Schemas Zod reutilizáveis para validação
 */

/**
 * Schema para criação de workspace
 */
export const createWorkspaceSchema = z.object({
  name: nameSchema,
  slug: slugSchema.optional(),
  description: descriptionSchema,
});

/**
 * Schema para atualização de workspace
 */
export const updateWorkspaceSchema = z.object({
  name: nameSchema.optional(),
  description: descriptionSchema,
});

/**
 * Schema para endereço completo
 */
export const addressSchema = z.object({
  zipCode: zipCodeSchema,
  street: z.string().min(3, "Rua obrigatória").trim(),
  number: z.string().min(1, "Número obrigatório").trim(),
  complement: z.string().optional().transform((val) => val?.trim()),
  neighborhood: z.string().min(2, "Bairro obrigatório").trim(),
  city: z.string().min(2, "Cidade obrigatória").trim(),
  state: stateSchema,
});

/**
 * Schema para contato
 */
export const contactSchema = z.object({
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
});

/**
 * Schema para criação de projeto
 */
export const createProjectSchema = z.object({
  name: nameSchema,
  domain: slugSchema.optional(),
});

/**
 * Schema para atualização de projeto
 */
export const updateProjectSchema = z.object({
  name: nameSchema.optional(),
  domain: slugSchema.optional(),
});

/**
 * Schema para paginação
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
});

/**
 * Schema para busca/filtros
 */
export const searchSchema = z.object({
  search: z.string().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
