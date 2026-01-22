"use server";

import { WhitelistService } from "../services/whitelist.service";
import type {
  SubscribeToWaitlistOutput,
  GetWaitlistStatsOutput,
} from "../types";
import { sendWaitlistConfirmation } from "~/lib/server/mail";

const whitelistService = new WhitelistService();

// Rate limiting: 5 minutos em milissegundos
const RATE_LIMIT_MS = 5 * 60 * 1000;

/**
 * Inscreve email na waitlist
 * 
 * Validações:
 * - Email válido (formato)
 * - Previne duplicatas
 * - Rate limiting (5 minutos por email)
 * 
 * Envia email de confirmação mas mantém status PENDING
 */
export async function subscribeToWaitlist(
  email: string
): Promise<SubscribeToWaitlistOutput> {
  try {
    // Validação básica de entrada
    if (!email || typeof email !== "string") {
      console.log("📧 [waitlist.validation_failed]", {
        event: "waitlist.validation_failed",
        email: email,
        reason: "email_invalid",
        timestamp: new Date().toISOString(),
      });
      return {
        success: false,
        message: "Email inválido",
      };
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0) {
      console.log("📧 [waitlist.validation_failed]", {
        event: "waitlist.validation_failed",
        email: email,
        reason: "email_empty",
        timestamp: new Date().toISOString(),
      });
      return {
        success: false,
        message: "Email inválido",
      };
    }

    // Validação de formato
    if (!whitelistService.validateEmail(trimmedEmail)) {
      console.log("📧 [waitlist.validation_failed]", {
        event: "waitlist.validation_failed",
        email: trimmedEmail,
        reason: "email_format_invalid",
        timestamp: new Date().toISOString(),
      });
      return {
        success: false,
        message: "Formato de email inválido",
      };
    }

    // Rate limiting: verifica última tentativa
    const lastEntry = await whitelistService.getLastEntryByEmail(trimmedEmail);
    if (lastEntry) {
      const timeSinceLastAttempt =
        Date.now() - lastEntry.createdAt.getTime();
      
      if (timeSinceLastAttempt < RATE_LIMIT_MS) {
        const minutesLeft = Math.ceil(
          (RATE_LIMIT_MS - timeSinceLastAttempt) / (60 * 1000)
        );
        
        console.log("📧 [waitlist.rate_limited]", {
          event: "waitlist.rate_limited",
          email: trimmedEmail,
          minutesLeft,
          timestamp: new Date().toISOString(),
        });
        
        return {
          success: false,
          message: `Aguarde ${minutesLeft} minuto(s) antes de tentar novamente`,
        };
      }

      // Verifica se é duplicata (já existe na lista)
      const isDuplicate = await whitelistService.checkDuplicate(trimmedEmail);
      if (isDuplicate) {
        console.log("📧 [waitlist.duplicate_attempt]", {
          event: "waitlist.duplicate_attempt",
          email: trimmedEmail,
          timestamp: new Date().toISOString(),
        });
        return {
          success: false,
          message: "Este email já está na lista",
        };
      }
    }

    // Cria entrada na waitlist
    const entry = await whitelistService.createEntry(trimmedEmail);

    // Envia email de confirmação
    try {
      // Extrai nome do email se disponível (parte antes do @)
      const userName = trimmedEmail.split("@")[0];
      
      await sendWaitlistConfirmation({
        toMail: trimmedEmail,
        userName,
      });

      console.log("📧 [waitlist.subscribed]", {
        event: "waitlist.subscribed",
        email: trimmedEmail,
        entryId: entry.id,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: "Inscrição realizada com sucesso! Verifique seu email.",
        entryId: entry.id,
      };
    } catch (emailError: any) {
      // Se falhar o email, ainda registra a inscrição
      console.error("❌ [waitlist.email_failed]", {
        event: "waitlist.email_failed",
        email: trimmedEmail,
        entryId: entry.id,
        error: emailError.message,
        timestamp: new Date().toISOString(),
      });

      // Retorna sucesso mesmo se email falhar (inscrição foi criada)
      return {
        success: true,
        message: "Inscrição realizada, mas houve um problema ao enviar o email de confirmação.",
        entryId: entry.id,
      };
    }
  } catch (error: any) {
    console.error("❌ [waitlist.subscribe_error]", {
      event: "waitlist.subscribe_error",
      email: email,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      message: "Erro ao processar inscrição. Tente novamente.",
    };
  }
}

/**
 * Retorna total de inscritos na waitlist
 */
export async function getWaitlistCount(): Promise<number> {
  try {
    return await whitelistService.getTotalCount();
  } catch (error: any) {
    console.error("❌ Erro ao buscar contagem de waitlist:", {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return 0;
  }
}

/**
 * Retorna estatísticas da waitlist
 */
export async function getWaitlistStats(): Promise<GetWaitlistStatsOutput> {
  try {
    return await whitelistService.getStats();
  } catch (error: any) {
    console.error("❌ Erro ao buscar estatísticas de waitlist:", {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return {
      total: 0,
      pending: 0,
      notified: 0,
      converted: 0,
    };
  }
}

