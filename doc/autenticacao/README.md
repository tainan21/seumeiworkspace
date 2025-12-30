# Documentação do Sistema de Autenticação

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Fluxo de Autenticação](#fluxo-de-autenticação)
3. [Arquitetura](#arquitetura)
4. [Componentes Principais](#componentes-principais)
5. [Problemas Identificados](#problemas-identificados)
6. [Configuração](#configuração)
7. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O sistema de autenticação utiliza **OTP (One-Time Password)** via email para autenticação de usuários. O fluxo é baseado em:

- **Email/OTP**: Autenticação via código de 6 dígitos enviado por email
- **GitHub OAuth**: Autenticação alternativa via GitHub
- **Sessões**: Gerenciamento de sessões com tokens seguros

---

## Fluxo de Autenticação

### 1. Envio de OTP

```
Usuário → Frontend (email) → POST /api/auth/login/send-otp
  ↓
Backend:
  1. Cria/busca usuário (upsert)
  2. Gera código OTP de 6 dígitos
  3. Salva código no banco (expira em 3 minutos)
  4. Envia email via Resend
  5. Retorna 200 (sucesso)
```

**Arquivo**: `src/app/api/auth/login/send-otp/route.ts`

### 2. Verificação de OTP

```
Usuário → Frontend (código) → POST /api/auth/login/verify-otp
  ↓
Backend:
  1. Busca usuário por email
  2. Valida código OTP
  3. Verifica expiração (3 minutos)
  4. Marca email como verificado
  5. Invalida sessões anteriores
  6. Cria nova sessão (30 dias)
  7. Define cookie de sessão
  8. Redireciona para /dashboard
```

**Arquivo**: `src/app/api/auth/login/verify-otp/route.ts`

---

## Arquitetura

### Estrutura de Arquivos

```
src/
├── app/
│   └── api/
│       └── auth/
│           └── login/
│               ├── send-otp/route.ts      # Endpoint de envio de OTP
│               └── verify-otp/route.ts     # Endpoint de verificação
├── lib/
│   └── server/
│       ├── auth/
│       │   ├── index.ts                    # Geração/validação de OTP
│       │   ├── session.ts                 # Gerenciamento de sessões
│       │   └── cookies.ts                  # Gerenciamento de cookies
│       └── mail.ts                         # Envio de emails (Resend)
└── components/
    └── layout/
        └── auth-form.tsx                   # Formulário de autenticação
```

### Modelo de Dados

#### User
```prisma
model User {
  id            String   @id @unique @default(cuid())
  email         String?  @unique
  emailVerified Boolean? @default(false)
  name          String?
  picture       String?
  // ... outros campos
}
```

#### EmailVerificationCode
```prisma
model EmailVerificationCode {
  id        String   @id @default(cuid())
  code      String
  userId    String
  email     String
  expiresAt DateTime
  user      User     @relation(...)
}
```

#### Session
```prisma
model Session {
  id        String   @id @default(cuid())
  userId    String
  expiresAt DateTime
  user      User     @relation(...)
}
```

---

## Componentes Principais

### 1. Geração de OTP

**Arquivo**: `src/lib/server/auth/index.ts`

```typescript
generateEmailVerificationCode(userId, email)
```

- Gera código de 6 dígitos numéricos
- Remove códigos anteriores do usuário
- Expira em **3 minutos**
- Salva no banco de dados

### 2. Verificação de OTP

**Arquivo**: `src/lib/server/auth/index.ts`

```typescript
verifyVerificationCode(user, code)
```

- Valida código em transação
- Verifica expiração
- Verifica correspondência de email
- Remove código após uso (single-use)

### 3. Gerenciamento de Sessão

**Arquivo**: `src/lib/server/auth/session.ts`

- **Token**: Hash SHA-256 do token aleatório
- **Expiração**: 30 dias
- **Renovação**: Automática se faltarem < 15 dias
- **Cookies**: HttpOnly, Secure (produção), SameSite=Lax

### 4. Envio de Email

**Arquivo**: `src/lib/server/mail.ts`

- Usa **Resend** para envio de emails
- Template React Email
- Headers customizados (X-Entity-Ref-ID)

---

## Problemas Identificados

### 🔴 Críticos

1. **Ordem de Verificação Incorreta**
   - O código é deletado antes de verificar expiração
   - **Local**: `src/lib/server/auth/index.ts` (linha 49 vs 55)

2. **Falta de Tratamento de Erros no Resend**
   - Erros do Resend não são capturados/logados
   - **Local**: `src/lib/server/mail.ts`

3. **Email "From" Hardcoded**
   - Email `chadnext@moinulmoin.com` pode não estar verificado
   - **Local**: `src/lib/server/mail.ts` (linha 34)

### 🟡 Importantes

4. **Falta de Validação de Entrada**
   - Endpoints não validam formato de email/código
   - **Local**: `send-otp/route.ts`, `verify-otp/route.ts`

5. **Falta de Rate Limiting**
   - Permite spam de requisições
   - Permite brute force no código OTP

6. **Falta de Limite de Tentativas**
   - Sem limite de tentativas de verificação

7. **Tratamento de Erros Genérico**
   - Mensagens de erro não informativas
   - Falta de logs estruturados

---

## Configuração

### Variáveis de Ambiente

```env
# Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Database
DB_PRISMA_URL=postgresql://...
DB_URL_NON_POOLING=postgresql://...

# Site URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Configuração do Resend

1. Criar conta em [resend.com](https://resend.com/)
2. Obter API Key
3. **IMPORTANTE**: Verificar domínio de email
   - O email "from" deve estar verificado no Resend
   - Para desenvolvimento, usar domínio de teste do Resend

### Domínio de Email no Resend

**Problema Comum**: Email não chega porque o domínio não está verificado.

**Solução**:
1. Acessar [Resend Dashboard](https://resend.com/domains)
2. Adicionar e verificar domínio
3. Ou usar domínio de teste: `onboarding@resend.dev` (apenas para desenvolvimento)

---

## Troubleshooting

### OTP não chega no email

#### 1. Verificar API Key do Resend

```bash
# Verificar se a variável está definida
echo $RESEND_API_KEY
```

**Solução**: Adicionar `RESEND_API_KEY` no arquivo `.env`

#### 2. Verificar Domínio de Email

O email "from" (`chadnext@moinulmoin.com`) deve estar verificado no Resend.

**Solução**:
- Verificar domínio no [Resend Dashboard](https://resend.com/domains)
- Ou alterar para domínio de teste: `onboarding@resend.dev`

#### 3. Verificar Logs do Resend

Acessar [Resend Dashboard > Logs](https://resend.com/emails) para ver:
- Status do envio
- Erros específicos
- Bounces/Rejeições

#### 4. Verificar Console do Servidor

Adicionar logs no código:

```typescript
// src/lib/server/mail.ts
try {
  const result = await resend.emails.send({...});
  console.log('Email enviado:', result);
} catch (error) {
  console.error('Erro ao enviar email:', error);
  throw error;
}
```

#### 5. Verificar Spam/Lixo Eletrônico

- Verificar pasta de spam
- Verificar filtros de email

#### 6. Verificar Limites do Resend

- Conta gratuita: 100 emails/dia
- Verificar se não excedeu o limite

### Erro: "Invalid OTP"

#### Possíveis Causas:
1. Código expirado (> 3 minutos)
2. Código já usado
3. Email não corresponde
4. Múltiplos códigos gerados (último código válido)

**Solução**: Solicitar novo código OTP

### Erro: "User not found"

#### Causa:
Usuário não foi criado no passo de envio de OTP.

**Solução**: Verificar se `send-otp` foi executado com sucesso antes de `verify-otp`

---

## Melhorias Recomendadas

### Prioridade Alta

1. ✅ Corrigir ordem de verificação no `verifyVerificationCode`
2. ✅ Adicionar tratamento de erros no Resend
3. ✅ Adicionar logs estruturados
4. ✅ Validar entrada nos endpoints

### Prioridade Média

5. Implementar rate limiting
6. Adicionar limite de tentativas
7. Melhorar mensagens de erro
8. Adicionar testes automatizados

### Prioridade Baixa

9. Adicionar métricas/monitoramento
10. Implementar cooldown entre requisições
11. Adicionar suporte a múltiplos idiomas nos emails

---

## Próximos Passos

1. Implementar correções críticas
2. Adicionar tratamento de erros
3. Configurar domínio de email no Resend
4. Testar fluxo completo
5. Implementar melhorias de segurança

---

**Última atualização**: 2025-01-XX
**Versão**: 1.0

