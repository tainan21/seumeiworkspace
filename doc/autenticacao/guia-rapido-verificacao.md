# Guia Rápido: Verificar Por Que OTP Não Chega

## ⚡ Verificação Rápida (5 minutos)

### 1. Verificar Variável de Ambiente

```bash
# No terminal, verificar se a variável está definida
echo $RESEND_API_KEY

# Ou verificar no arquivo .env
cat .env | grep RESEND_API_KEY
```

**✅ Deve mostrar**: `RESEND_API_KEY=re_xxxxxxxxxxxxx`

**❌ Se estiver vazio**: Adicionar no `.env`:
```env
RESEND_API_KEY=re_sua_chave_aqui
```

---

### 2. Verificar Domínio no Resend

1. Acessar: https://resend.com/domains
2. Verificar se o domínio `moinulmoin.com` está listado e verificado

**❌ Se não estiver verificado**:
- **Opção 1 (Desenvolvimento)**: Usar domínio de teste
  - Alterar `src/lib/server/mail.ts` linha 34:
  ```typescript
  from: `ChadNext App <onboarding@resend.dev>`,
  ```
- **Opção 2 (Produção)**: Verificar domínio no Resend Dashboard

---

### 3. Verificar Logs do Resend

1. Acessar: https://resend.com/emails
2. Verificar últimos emails enviados
3. Verificar status (sent, delivered, bounced, failed)

**Status Possíveis**:
- ✅ **Sent**: Email enviado com sucesso
- ✅ **Delivered**: Email entregue
- ❌ **Bounced**: Email rejeitado (domínio/email inválido)
- ❌ **Failed**: Falha no envio (verificar erro)

---

### 4. Verificar Console do Servidor

Ao solicitar OTP, verificar o console do servidor:

**✅ Deve mostrar**:
```
📧 Enviando OTP para: usuario@exemplo.com
🔐 Código OTP gerado: 123456
✅ Email OTP enviado: { to: 'usuario@exemplo.com', emailId: '...' }
```

**❌ Se mostrar erro**:
- Verificar mensagem de erro
- Verificar se API Key está correta
- Verificar se domínio está verificado

---

### 5. Testar API do Resend Diretamente

Criar arquivo `test-resend.ts`:

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function test() {
  try {
    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "seu-email@exemplo.com",
      subject: "Teste",
      html: "<p>Teste de envio</p>",
    });
    console.log("✅ Sucesso:", result);
  } catch (error) {
    console.error("❌ Erro:", error);
  }
}

test();
```

Executar:
```bash
npx tsx test-resend.ts
```

**✅ Se funcionar**: API Key está correta
**❌ Se falhar**: Verificar API Key ou limites do Resend

---

## 🔴 Problemas Comuns e Soluções

### Problema 1: "Invalid API Key"

**Causa**: API Key incorreta ou não definida

**Solução**:
1. Verificar `.env` tem `RESEND_API_KEY`
2. Verificar se a chave está correta no Resend Dashboard
3. Reiniciar servidor após alterar `.env`

---

### Problema 2: "Domain not verified"

**Causa**: Domínio do email "from" não está verificado

**Solução**:
- **Desenvolvimento**: Usar `onboarding@resend.dev`
- **Produção**: Verificar domínio no Resend Dashboard

---

### Problema 3: "Rate limit exceeded"

**Causa**: Limite de emails excedido (100/dia na conta gratuita)

**Solução**:
1. Verificar uso em https://resend.com/usage
2. Aguardar reset diário
3. Ou fazer upgrade do plano

---

### Problema 4: Email não aparece nos logs do Resend

**Causa**: Erro antes de chegar ao Resend (código não executa)

**Solução**:
1. Verificar console do servidor para erros
2. Verificar se `sendOTP` está sendo chamado
3. Adicionar logs no código

---

### Problema 5: Email vai para spam

**Causa**: Domínio não verificado ou configurações de email

**Solução**:
1. Verificar pasta de spam
2. Verificar domínio no Resend
3. Configurar SPF/DKIM/DMARC (produção)

---

## 📋 Checklist Completo

### Configuração
- [ ] `RESEND_API_KEY` definida no `.env`
- [ ] Servidor reiniciado após alterar `.env`
- [ ] Domínio verificado no Resend (ou usando domínio de teste)

### Código
- [ ] Tratamento de erros implementado
- [ ] Logs adicionados
- [ ] Email "from" configurável

### Testes
- [ ] Teste direto do Resend funciona
- [ ] Console do servidor mostra logs
- [ ] Logs do Resend Dashboard mostram tentativas
- [ ] Email chega na caixa de entrada (ou spam)

---

## 🚀 Próxima Ação

Se após todas as verificações o problema persistir:

1. **Adicionar tratamento de erros** (ver `analise-problema-resend.md`)
2. **Adicionar logs detalhados** no código
3. **Verificar logs do Resend Dashboard** para erros específicos
4. **Testar com domínio de teste** (`onboarding@resend.dev`)

---

**Última atualização**: 2025-01-XX

