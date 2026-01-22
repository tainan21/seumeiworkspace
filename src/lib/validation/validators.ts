import { z } from "zod";
import type { ZodSchema } from "zod";

/**
 * Valida dados usando schema Zod
 * Retorna resultado tipado ou lança ValidationError
 */
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

/**
 * Valida e retorna dados ou lança erro
 */
export function validateOrThrow<T>(
  schema: ZodSchema<T>,
  data: unknown
): T {
  const result = validate(schema, data);

  if (!result.success) {
    const errorMessages = result.errors.errors.map(
      (err) => `${err.path.join(".")}: ${err.message}`
    );
    throw new Error(`Validation failed: ${errorMessages.join(", ")}`);
  }

  return result.data;
}

/**
 * Formata erros de validação para exibição
 */
export function formatValidationErrors(
  errors: z.ZodError
): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  errors.errors.forEach((error) => {
    const path = error.path.join(".");
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(error.message);
  });

  return formatted;
}
