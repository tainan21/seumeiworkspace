import { z } from "zod";

/**
 * Schema de validação para variáveis de ambiente
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  RESEND_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

/**
 * Valida e retorna configurações da aplicação
 */
function getAppConfig() {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  };

  try {
    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors.map((e) => e.path.join(".")).join(", ");
      throw new Error(`Missing or invalid environment variables: ${missing}`);
    }
    throw error;
  }
}

/**
 * Configurações da aplicação
 */
export const appConfig = getAppConfig();

/**
 * Helpers de configuração
 */
export const isDevelopment = appConfig.NODE_ENV === "development";
export const isProduction = appConfig.NODE_ENV === "production";
export const isTest = appConfig.NODE_ENV === "test";
