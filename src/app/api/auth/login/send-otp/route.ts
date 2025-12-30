import { generateEmailVerificationCode } from "~/lib/server/auth";
import { prisma } from "~/lib/server/db";
import { sendOTP } from "~/lib/server/mail";

export const POST = async (req: Request) => {
  let body;
  
  try {
    body = await req.json();
  } catch (error) {
    console.error("❌ Erro ao parsear body da requisição:", error);
    return new Response(
      JSON.stringify({ error: "Formato de requisição inválido" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Validar entrada
  if (!body.email) {
    console.error("❌ Email não fornecido na requisição");
    return new Response(
      JSON.stringify({ error: "Email é obrigatório" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!body.email.includes("@") || !body.email.includes(".")) {
    console.error("❌ Email inválido:", body.email);
    return new Response(
      JSON.stringify({ error: "Formato de email inválido" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    console.log("📧 Iniciando processo de envio de OTP:", {
      email: body.email,
      timestamp: new Date().toISOString(),
    });

    // Criar ou buscar usuário
    const user = await prisma.user.upsert({
      where: {
        email: body.email,
      },
      update: {},
      create: {
        email: body.email,
        emailVerified: false,
      },
    });

    console.log("👤 Usuário encontrado/criado:", {
      userId: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
    });

    // Gerar código OTP
    const otp = await generateEmailVerificationCode(user.id, body.email);
    console.log("🔐 Código OTP gerado:", {
      userId: user.id,
      codeLength: otp.length,
    });

    // Enviar email
    await sendOTP({
      toMail: body.email,
      code: otp,
      userName: user.name?.split(" ")[0] || "Usuário",
    });

    console.log("✅ OTP enviado com sucesso:", {
      email: body.email,
      timestamp: new Date().toISOString(),
    });

    return new Response(null, {
      status: 200,
    });
  } catch (error: any) {
    console.error("❌ Erro ao processar envio de OTP:", {
      email: body.email,
      error: error.message,
      errorStack: error.stack,
      errorDetails: error,
      timestamp: new Date().toISOString(),
    });

    // Retornar mensagem de erro específica
    const errorMessage =
      error.message || "Erro interno ao enviar OTP. Tente novamente.";

    return new Response(
      JSON.stringify({
        error: errorMessage,
        code: error.code || "INTERNAL_ERROR",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
