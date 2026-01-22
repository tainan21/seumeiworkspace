"use server";

import { z } from "zod";
import type { ZodSchema } from "zod";
import { validateOrThrow, formatValidationErrors } from "./validators";
import { ValidationError } from "../errors/error-types";

/**
 * Middleware de validação para Server Actions
 * Valida dados de entrada antes de executar a ação
 */
export function withValidation<T extends ZodSchema>(
  schema: T
) {
  return function <Args extends any[], Return>(
    action: (...args: Args) => Promise<Return>
  ) {
    return async (...args: Args): Promise<Return> => {
      // Validar primeiro argumento (geralmente é o payload)
      if (args.length > 0) {
        try {
          const validated = validateOrThrow(schema, args[0]);
          // Substituir primeiro argumento pelos dados validados
          const newArgs = [validated, ...args.slice(1)] as Args;
          return await action(...newArgs);
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new ValidationError(
              "Dados de entrada inválidos",
              formatValidationErrors(error)
            );
          }
          throw error;
        }
      }

      return await action(...args);
    };
  };
}

/**
 * Helper para validar múltiplos schemas
 */
export function validateMultiple<T extends Record<string, ZodSchema>>(
  schemas: T,
  data: Record<keyof T, unknown>
): { [K in keyof T]: z.infer<T[K]> } {
  const result: any = {};

  for (const [key, schema] of Object.entries(schemas)) {
    result[key] = validateOrThrow(schema, data[key]);
  }

  return result;
}
