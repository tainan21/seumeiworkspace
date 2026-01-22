import { z } from "zod";

/**
 * Validação de email
 */
export const emailSchema = z
  .string()
  .email("Email inválido")
  .toLowerCase()
  .trim();

/**
 * Validação de telefone brasileiro
 * Aceita formatos: (11) 99999-9999, 11999999999, etc
 */
export const phoneSchema = z
  .string()
  .regex(
    /^[\d\s\(\)\-]+$/,
    "Telefone inválido"
  )
  .transform((val) => val.replace(/\D/g, ""))
  .refine((val) => val.length >= 10 && val.length <= 11, {
    message: "Telefone deve ter 10 ou 11 dígitos",
  });

/**
 * Validação de CEP brasileiro
 */
export const zipCodeSchema = z
  .string()
  .regex(/^\d{5}-?\d{3}$/, "CEP inválido")
  .transform((val) => val.replace(/\D/g, ""))
  .refine((val) => val.length === 8, {
    message: "CEP deve ter 8 dígitos",
  });

/**
 * Validação de URL
 */
export const urlSchema = z
  .string()
  .url("URL inválida")
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    {
      message: "URL deve usar HTTP ou HTTPS",
    }
  );

/**
 * Validação de slug
 */
export const slugSchema = z
  .string()
  .min(3, "Slug deve ter pelo menos 3 caracteres")
  .max(50, "Slug deve ter no máximo 50 caracteres")
  .regex(/^[a-z0-9-]+$/, "Slug pode conter apenas letras minúsculas, números e hífens")
  .refine((val) => !val.startsWith("-") && !val.endsWith("-"), {
    message: "Slug não pode começar ou terminar com hífen",
  });

/**
 * Validação de nome (pessoa ou empresa)
 */
export const nameSchema = z
  .string()
  .min(2, "Nome deve ter pelo menos 2 caracteres")
  .max(100, "Nome deve ter no máximo 100 caracteres")
  .trim();

/**
 * Validação de descrição
 */
export const descriptionSchema = z
  .string()
  .max(500, "Descrição deve ter no máximo 500 caracteres")
  .trim()
  .optional();

/**
 * Validação de UF (estado brasileiro)
 */
export const stateSchema = z
  .string()
  .length(2, "UF deve ter 2 letras")
  .toUpperCase()
  .refine(
    (val) => {
      const validStates = [
        "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
        "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
        "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
      ];
      return validStates.includes(val);
    },
    {
      message: "UF inválida",
    }
  );
