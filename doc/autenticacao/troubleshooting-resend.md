# Troubleshooting: OTP não chega no email

## 🔍 Checklist de Diagnóstico

### 1. Verificar Variável de Ambiente

```bash
# Verificar se RESEND_API_KEY está definida
echo $RESEND_API_KEY
```

**Solução**: Adicionar no arquivo `.env`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

---

### 2. Verificar Domínio de Email no Resend

**Problema**: O email "from" (`chadnext@moinulmoin.com`) pode não estar verificado.

**Verificação**:
1. Acessar [Resend Dashboard > Domains](https://resend.com/domains)
2. Verificar se o domínio `moinulmoin.com` está adicionado e verificado

**Solução para Desenvolvimento**:
Alterar o email "from" para o domínio de teste do Resend:

```typescript
// src/lib/server/mail.ts
from: `ChadNext App <onboarding@resend.dev>`, // Domínio de teste
```

**Solução para Produção**:
1. Adicionar domínio no Resend
2. Configurar registros DNS (SPF, DKIM, DMARC)
3. Aguardar verificação

---

### 3. Verificar Logs do Resend

Acessar [Resend Dashboard > Emails](https://resend.com/emails) para ver:
- ✅ Status do envio (sent, delivered, bounced)
- ❌ Erros específicos
- 📊 Estatísticas de entrega

**Erros Comuns**:
- `Invalid API Key`: API Key incorreta ou expirada
- `Domain not verified`: Domínio não verificado
- `Rate limit exceeded`: Limite de emails excedido
- `Invalid recipient`: Email do destinatário inválido

---

### 4. Verificar Código do Resend

**Problema Atual**: O código não trata erros do Resend.

**Código Atual** (`src/lib/server/mail.ts`):
```typescript
export const sendOTP = async ({ toMail, code, userName }: SendOTPProps) => {
  // ... código ...
  await resend.emails.send({...}); // Sem tratamento de erro
};
```

**Problema**: Se o Resend falhar, o erro não é capturado/logado.

**Solução**: Adicionar tratamento de erros:

```typescript
export const sendOTP = async ({ toMail, code, userName }: SendOTPProps) => {
  try {
    const result = await resend.emails.send({
      from: `ChadNext App <chadnext@moinulmoin.com>`,
      to: toMail,
      subject: "OTP for ChadNext",
      headers: {
        "X-Entity-Ref-ID": generateId(),
      },
      react: VerificationTemp({ userName, code }),
      text: "",
    });

    console.log('✅ Email OTP enviado:', {
      to: toMail,
      emailId: result.data?.id,
      timestamp: new Date().toISOString(),
    });

    return result;
  } catch (error: any) {
    console.error('❌ Erro ao enviar email OTP:', {
      to: toMail,
      error: error.message,
      details: error,
      timestamp: new Date().toISOString(),
    });
    
    // Re-throw para que o endpoint possa tratar
    throw new Error(`Falha ao enviar email: ${error.message}`);
  }
};
```

---

### 5. Verificar Limites do Resend

**Limites da Conta Gratuita**:
- 100 emails/dia
- 3.000 emails/mês

**Verificação**:
1. Acessar [Resend Dashboard > Usage](https://resend.com/usage)
2. Verificar se não excedeu o limite

**Solução**: 
- Aguardar reset diário/mensal
- Ou fazer upgrade do plano

---

### 6. Verificar Console do Servidor

Adicionar logs temporários para debug:

```typescript
// src/app/api/auth/login/send-otp/route.ts
export const POST = async (req: Request) => {
  const body = await req.json();
  console.log('📧 Enviando OTP para:', body.email);

  try {
    // ... código existente ...
    
    const otp = await generateEmailVerificationCode(user.id, body.email);
    console.log('🔐 Código OTP gerado:', otp);
    
    await sendOTP({
      toMail: body.email,
      code: otp,
      userName: user.name?.split(" ")[0] || "",
    });
    
    console.log('✅ OTP enviado com sucesso');
    
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('❌ Erro ao enviar OTP:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

---

### 7. Verificar Spam/Lixo Eletrônico

- Verificar pasta de spam
- Verificar filtros de email
- Verificar bloqueios de remetente

---

### 8. Testar API do Resend Diretamente

Criar script de teste:

```typescript
// test-resend.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    const result = await resend.emails.send({
      from: "onboarding@resend.dev", // Domínio de teste
      to: "seu-email@exemplo.com",
      subject: "Teste OTP",
      html: "<p>Código: 123456</p>",
    });
    
    console.log("✅ Email enviado:", result);
  } catch (error) {
    console.error("❌ Erro:", error);
  }
}

testEmail();
```

Executar:
```bash
npx tsx test-resend.ts
```

---

## 🛠️ Soluções Rápidas

### Solução 1: Usar Domínio de Teste (Desenvolvimento)

Alterar `src/lib/server/mail.ts`:

```typescript
from: `ChadNext App <onboarding@resend.dev>`, // Domínio de teste do Resend
```

### Solução 2: Adicionar Tratamento de Erros

Ver seção 4 acima.

### Solução 3: Verificar API Key

```bash
# Testar API Key
curl https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "seu-email@exemplo.com",
    "subject": "Teste",
    "html": "<p>Teste</p>"
  }'
```

---

## 📝 Próximos Passos

1. ✅ Adicionar tratamento de erros no `sendOTP`
2. ✅ Adicionar logs estruturados
3. ✅ Verificar domínio no Resend
4. ✅ Testar com domínio de teste
5. ✅ Verificar logs do Resend Dashboard

---

**Última atualização**: 2025-01-XX

