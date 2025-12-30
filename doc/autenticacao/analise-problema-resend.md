# Análise: OTP não chega no email - Problemas no Código

## 🔍 Análise do Código Atual

### 1. Arquivo: `src/lib/server/mail.ts`

#### Problema 1: Falta de Tratamento de Erros

**Código Atual**:
```typescript
export const sendOTP = async ({ toMail, code, userName }: SendOTPProps) => {
  const subject = "OTP for ChadNext";
  const temp = VerificationTemp({ userName, code }) as ReactNode;

  await resend.emails.send({
    from: `ChadNext App <chadnext@moinulmoin.com>`,
    to: toMail,
    subject: subject,
    headers: {
      "X-Entity-Ref-ID": generateId(),
    },
    react: temp,
    text: "",
  });
};
```

**Problemas Identificados**:
- ❌ **Sem try/catch**: Erros do Resend não são capturados
- ❌ **Sem logs**: Não há como saber se o email foi enviado ou falhou
- ❌ **Erro silencioso**: Se falhar, o endpoint retorna 200 mas o email não foi enviado
- ❌ **Sem validação**: Não verifica se `RESEND_API_KEY` está definida

#### Problema 2: Email "From" Hardcoded

**Código Atual**:
```typescript
from: `ChadNext App <chadnext@moinulmoin.com>`,
```

**Problemas Identificados**:
- ❌ **Domínio não verificado**: O domínio `moinulmoin.com` pode não estar verificado no Resend
- ❌ **Sem fallback**: Não há alternativa se o domínio não estiver disponível
- ❌ **Hardcoded**: Deveria ser configurável via variável de ambiente

#### Problema 3: Inicialização do Resend

**Código Atual**:
```typescript
export const resend = new Resend(process.env.RESEND_API_KEY);
```

**Problemas Identificados**:
- ❌ **Sem validação**: Se `RESEND_API_KEY` for `undefined`, o Resend não falha imediatamente
- ❌ **Erro tardio**: O erro só aparece quando tenta enviar o email

---

### 2. Arquivo: `src/app/api/auth/login/send-otp/route.ts`

#### Problema 4: Tratamento de Erro Genérico

**Código Atual**:
```typescript
try {
  // ... código ...
  await sendOTP({...});
  return new Response(null, { status: 200 });
} catch (error) {
  console.log(error); // ❌ Apenas log, sem detalhes
  return new Response(null, { status: 500 }); // ❌ Sem mensagem de erro
}
```

**Problemas Identificados**:
- ❌ **Log insuficiente**: `console.log` não mostra stack trace
- ❌ **Sem mensagem de erro**: Frontend não sabe o que aconteceu
- ❌ **Sem diferenciação**: Não diferencia erro de banco vs erro de email

---

## 🐛 Cenários de Falha

### Cenário 1: API Key Inválida ou Ausente

**O que acontece**:
1. `RESEND_API_KEY` não está definida ou é inválida
2. Resend tenta enviar email
3. Resend retorna erro (401 Unauthorized)
4. Erro não é capturado em `sendOTP`
5. Erro propaga para `send-otp/route.ts`
6. Endpoint retorna 500 genérico
7. **Usuário não recebe email e não sabe o motivo**

### Cenário 2: Domínio Não Verificado

**O que acontece**:
1. Email "from" usa domínio não verificado
2. Resend rejeita o envio
3. Erro não é capturado
4. **Usuário não recebe email**

### Cenário 3: Limite de Emails Excedido

**O que acontece**:
1. Conta Resend atingiu limite (100/dia na conta gratuita)
2. Resend retorna erro de rate limit
3. Erro não é capturado
4. **Usuário não recebe email**

### Cenário 4: Email Inválido

**O que acontece**:
1. Email do destinatário é inválido
2. Resend retorna erro
3. Erro não é capturado
4. **Usuário não recebe email**

---

## ✅ Soluções Propostas

### Solução 1: Adicionar Tratamento de Erros no `sendOTP`

```typescript
export const sendOTP = async ({ toMail, code, userName }: SendOTPProps) => {
  // Validar API Key
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY não está configurada");
  }

  const subject = "OTP for ChadNext";
  const temp = VerificationTemp({ userName, code }) as ReactNode;

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: toMail,
      subject: subject,
      headers: {
        "X-Entity-Ref-ID": generateId(),
      },
      react: temp,
      text: "",
    });

    console.log("✅ Email OTP enviado:", {
      to: toMail,
      emailId: result.data?.id,
      timestamp: new Date().toISOString(),
    });

    return result;
  } catch (error: any) {
    console.error("❌ Erro ao enviar email OTP:", {
      to: toMail,
      error: error.message,
      details: error,
      timestamp: new Date().toISOString(),
    });

    // Re-throw com mensagem específica
    throw new Error(`Falha ao enviar email: ${error.message}`);
  }
};
```

### Solução 2: Melhorar Tratamento de Erros no Endpoint

```typescript
export const POST = async (req: Request) => {
  const body = await req.json();

  try {
    // Validar entrada
    if (!body.email || !body.email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = await prisma.user.upsert({
      where: { email: body.email },
      update: {},
      create: {
        email: body.email,
        emailVerified: false,
      },
    });

    const otp = await generateEmailVerificationCode(user.id, body.email);
    
    await sendOTP({
      toMail: body.email,
      code: otp,
      userName: user.name?.split(" ")[0] || "",
    });

    return new Response(null, { status: 200 });
  } catch (error: any) {
    console.error("❌ Erro ao enviar OTP:", {
      email: body.email,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    // Retornar mensagem de erro específica
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro ao enviar OTP",
        code: error.code 
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
```

### Solução 3: Adicionar Variável de Ambiente para Email "From"

**`.env`**:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev  # Para desenvolvimento
# RESEND_FROM_EMAIL=chadnext@moinulmoin.com  # Para produção (após verificar domínio)
```

**`src/lib/server/mail.ts`**:
```typescript
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
```

---

## 🔧 Checklist de Verificação

### No Resend Dashboard

- [ ] API Key está ativa e válida
- [ ] Domínio está verificado (ou usar domínio de teste)
- [ ] Não excedeu limite de emails (100/dia na conta gratuita)
- [ ] Verificar logs de emails enviados

### No Código

- [ ] `RESEND_API_KEY` está definida no `.env`
- [ ] Email "from" está verificado no Resend
- [ ] Tratamento de erros implementado
- [ ] Logs adicionados para debug

### Testes

- [ ] Testar envio de email manualmente
- [ ] Verificar console do servidor para erros
- [ ] Verificar logs do Resend Dashboard
- [ ] Testar com domínio de teste (`onboarding@resend.dev`)

---

## 📝 Próximos Passos

1. ✅ Adicionar tratamento de erros no `sendOTP`
2. ✅ Adicionar logs estruturados
3. ✅ Adicionar variável de ambiente para email "from"
4. ✅ Melhorar tratamento de erros no endpoint
5. ✅ Testar com domínio de teste do Resend
6. ✅ Verificar logs do Resend Dashboard

---

**Última atualização**: 2025-01-XX

