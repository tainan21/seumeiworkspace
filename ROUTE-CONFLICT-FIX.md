# Correção de Conflito de Rotas Dinâmicas

## Problema Identificado

O Next.js 16 não permite dois slugs dinâmicos diferentes no mesmo nível de roteamento:
- `[locale]` em `src/app/[locale]/`
- `[sistema]` em `src/app/[sistema]/`

Isso causa o erro: "You cannot use different slug names for the same dynamic path ('locale' !== 'sistema')"

## Análise

A rota `[sistema]` foi identificada como:
- Não referenciada em nenhum lugar do código
- Duplicando funcionalidades já existentes em `[locale]/[workspace]` e `[locale]/dashboard`
- Provavelmente uma rota experimental ou legada

## Solução Aplicada

1. **Remoção da rota `[sistema]`**: ⚠️ **AÇÃO NECESSÁRIA**: A pasta `src/app/[sistema]` precisa ser removida manualmente. Pare o servidor Next.js (`pnpm dev`) e remova a pasta `src/app/[sistema]` antes de executar `pnpm dev` novamente.
2. **Configuração do Next.js**: Serwist desabilitado em desenvolvimento
3. **Source Maps**: Configurados para desenvolvimento
4. **Script de Debug**: Adicionado `dev:debug` ao package.json

## Arquivos Afetados

- ❌ Removido: `src/app/[sistema]/` (toda a pasta)
- ✅ Atualizado: `next.config.mjs`
- ✅ Criado: `.env.local`
- ✅ Atualizado: `package.json`

## Rotas Mantidas

A estrutura de rotas principal permanece intacta:
- `[locale]/` - Rotas localizadas (pt, en, es, fr)
- `[locale]/[workspace]/` - Rotas contextuais de workspace
- `[locale]/dashboard/` - Dashboard global
- `api/` - Rotas de API
