import ThanksTemp from "../../../emails/thanks";
import VerificationTemp from "../../../emails/verification";
import { Resend } from "resend";
import { type SendOTPProps, type SendWelcomeEmailProps } from "~/types";
import { generateId } from "../utils";
import type { ReactNode } from "react";

// Email "from" configurável via variável de ambiente (fallback para domínio de teste)
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "onboarding@seumei.taicode.com.br";

// Validar API Key na inicialização
if (!process.env.RESEND_API_KEY) {
  console.warn(
    "⚠️ RESEND_API_KEY não está definida. Emails não serão enviados."
  );
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async ({
  toMail,
  userName,
}: SendWelcomeEmailProps) => {
  const subject = "Bem-vindo ao seumei!";
  const temp = ThanksTemp({ userName }) as ReactNode;

  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY não está configurada");
    }

    const result = await resend.emails.send({
      from: `seumei <${FROM_EMAIL}>`,
      to: toMail,
      subject: subject,
      headers: {
        "X-Entity-Ref-ID": generateId(),
      },
      react: temp,
      text: "",
    });

    console.log("✅ Email de boas-vindas enviado:", {
      to: toMail,
      emailId: result.data?.id,
      timestamp: new Date().toISOString(),
    });

    return result;
  } catch (error: any) {
    console.error("❌ Erro ao enviar email de boas-vindas:", {
      to: toMail,
      error: error.message,
      details: error,
      timestamp: new Date().toISOString(),
    });

    throw new Error(`Falha ao enviar email: ${error.message}`);
  }
};

export const sendOTP = async ({ toMail, code, userName }: SendOTPProps) => {
  const subject = "Código de Verificação OTP";
  const temp = VerificationTemp({ userName, code }) as ReactNode;

  try {
    // Validar API Key
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY não está configurada");
    }

    // Validar email do destinatário
    if (!toMail || !toMail.includes("@")) {
      throw new Error("Email do destinatário inválido");
    }

    console.log("📧 Tentando enviar OTP:", {
      to: toMail,
      from: FROM_EMAIL,
      timestamp: new Date().toISOString(),
    });

    const result = await resend.emails.send({
      from: `seumei <${FROM_EMAIL}>`,
      to: toMail,
      subject: subject,
      headers: {
        "X-Entity-Ref-ID": generateId(),
      },
      react: temp,
      text: "",
    });

    // Verificar se há erros na resposta primeiro
    if ("error" in result && result.error) {
      console.error("❌ Erro na resposta do Resend:", {
        to: toMail,
        error: result.error,
        timestamp: new Date().toISOString(),
      });
      throw new Error(`Erro do Resend: ${JSON.stringify(result.error)}`);
    }

    // Validar resposta do Resend
    if (!result.data) {
      console.error("❌ Resend retornou resposta vazia:", {
        to: toMail,
        result: result,
        timestamp: new Date().toISOString(),
      });
      throw new Error(
        "Resend retornou resposta inválida. Verifique a API key e o domínio."
      );
    }

    if (!result.data.id) {
      console.warn("⚠️ Resend retornou resposta sem ID:", {
        to: toMail,
        result: result,
        timestamp: new Date().toISOString(),
      });
    }

    console.log("✅ Email OTP enviado com sucesso:", {
      to: toMail,
      emailId: result.data.id,
      timestamp: new Date().toISOString(),
    });

    return result;
  } catch (error: any) {
    console.error("❌ Erro ao enviar email OTP:", {
      to: toMail,
      error: error.message,
      errorCode: error.code,
      errorDetails: error,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    // Re-throw com mensagem específica baseada no tipo de erro
    if (error.message?.includes("API")) {
      throw new Error(
        "Erro de configuração: RESEND_API_KEY inválida ou não configurada"
      );
    }

    if (
      error.message?.includes("domain") ||
      error.message?.includes("Domain")
    ) {
      throw new Error(
        `Domínio de email não verificado. Usando: ${FROM_EMAIL}. Verifique a configuração no Resend.`
      );
    }

    if (
      error.message?.includes("rate limit") ||
      error.message?.includes("limit")
    ) {
      throw new Error("Limite de emails excedido. Tente novamente mais tarde.");
    }

    throw new Error(
      `Falha ao enviar email: ${error.message || "Erro desconhecido"}`
    );
  }
};
