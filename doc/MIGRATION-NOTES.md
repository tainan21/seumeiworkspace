# Migration Notes - Schema Prisma Update

## ⚠️ IMPORTANTE: Migrations Necessárias

### 1. Migration de Stripe (User → Subscription)

Os campos Stripe foram movidos do modelo `User` para `Subscription`. 

**Campos afetados:**
- `stripeCustomerId`
- `stripeSubscriptionId`
- `stripePriceId`
- `stripeCurrentPeriodEnd`

**Status:** Campos ainda existem no `User` (marcados como DEPRECATED) para compatibilidade temporária.

**Script de Migration Necessário:**

```sql
-- Criar Subscription para cada User que tem stripeCustomerId
INSERT INTO subscriptions (id, workspace_id, plan_id, status, current_period_start, current_period_end, stripe_customer_id, stripe_subscription_id, stripe_price_id, created_at, updated_at)
SELECT 
  gen_random_uuid()::text as id,
  -- workspace_id precisa ser criado antes (criar workspace para cada user se não existir)
  (SELECT id FROM plans WHERE code = 'FREE' LIMIT 1) as plan_id,
  'ACTIVE' as status,
  COALESCE(user.stripe_current_period_end - INTERVAL '30 days', NOW()) as current_period_start,
  COALESCE(user.stripe_current_period_end, NOW() + INTERVAL '30 days') as current_period_end,
  user.stripe_customer_id,
  user.stripe_subscription_id,
  user.stripe_price_id,
  NOW() as created_at,
  NOW() as updated_at
FROM users user
WHERE user.stripe_customer_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s WHERE s.stripe_customer_id = user.stripe_customer_id
  );
```

**Após migration executada:**
1. Remover campos Stripe do modelo `User` no schema
2. Atualizar código que ainda referencia esses campos
3. Executar `npx prisma migrate dev`

### 2. Migration de Session Token

O modelo `Session` agora requer o campo `token`. O código já foi atualizado para incluir o token na criação.

**Status:** ✅ Código atualizado - migration será criada automaticamente

### 3. Migration de emailVerified → emailVerifiedAt

Campo `emailVerified` (boolean) foi substituído por `emailVerifiedAt` (DateTime?).

**Status:** ✅ Código atualizado - migration será criada automaticamente

## Próximos Passos

1. Executar migration inicial: `npx prisma migrate dev --name init_workspace_schema`
2. Criar script de migration para dados Stripe (quando tiver Workspaces criados)
3. Remover campos DEPRECATED após migration completa

