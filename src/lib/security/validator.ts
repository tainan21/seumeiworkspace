import { z } from "zod";
import { sanitizeString, sanitizeUrl, normalizeString } from "./sanitizer";

/**
 * Validação de tipos com sanitização
 */

/**
 * Schema Zod que sanitiza strings automaticamente
 */
export const sanitizedStringSchema = z
  .string()
  .transform((val) => sanitizeString(val));

/**
 * Schema Zod que valida e sanitiza URLs
 */
export const sanitizedUrlSchema = z
  .string()
  .transform((val) => {
    const sanitized = sanitizeUrl(val);
    if (!sanitized) {
      throw new z.ZodError([
        {
          code: "custom",
          path: [],
          message: "URL inválida",
        },
      ]);
    }
    return sanitized;
  });

/**
 * Schema Zod que normaliza strings
 */
export const normalizedStringSchema = z
  .string()
  .transform((val) => normalizeString(val));

/**
 * Valida e sanitiza dados de entrada
 */
export function validateAndSanitize<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data);
}
