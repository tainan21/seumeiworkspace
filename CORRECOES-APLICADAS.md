# Correções Aplicadas - Next.js Dev Errors

## ✅ Correções Implementadas

### 1. Configuração do Next.js (`next.config.mjs`)
- ✅ Serwist desabilitado em desenvolvimento (`disable: isDevelopment`)
- ✅ Source maps otimizados (`productionBrowserSourceMaps: false`)
- ✅ Logging detalhado habilitado em desenvolvimento

### 2. Variáveis de Ambiente (`.env.local`)
- ✅ Criado arquivo `.env.local` com `SERWIST_SUPPRESS_TURBOPACK_WARNING=1`

### 3. Scripts (`package.json`)
- ✅ Adicionado script `dev:debug` para debug com Webpack (sem Turbopack)

## ⚠️ Ação Necessária do Usuário

### Remover a pasta `[sistema]` manualmente

A pasta `src/app/[sistema]` está causando conflito de rotas dinâmicas. Ela precisa ser removida manualmente porque os arquivos podem estar bloqueados pelo servidor Next.js.

**Passos:**
1. Pare o servidor Next.js (Ctrl+C no terminal onde `pnpm dev` está rodando)
2. Delete a pasta `src/app/[sistema]` completamente
3. Execute `pnpm dev` novamente

**Alternativa via terminal (após parar o Next.js):**
```powershell
Remove-Item -LiteralPath "src\app\[sistema]" -Recurse -Force
```

## 📋 Resumo das Mudanças

| Arquivo | Mudança |
|---------|---------|
| `next.config.mjs` | Serwist desabilitado em dev, source maps otimizados |
| `.env.local` | Criado com variável para suprimir warning do Serwist |
| `package.json` | Adicionado script `dev:debug` |
| `src/app/[sistema]/` | ⚠️ **Remover manualmente** |

## 🧪 Testando as Correções

Após remover a pasta `[sistema]`, execute:

```bash
pnpm dev
```

O servidor deve iniciar sem:
- ❌ Erro de conflito de slugs dinâmicos
- ❌ Warnings do Serwist com Turbopack
- ❌ Avisos de source maps inválidos

## 🔍 Script de Debug

Se ainda houver problemas, use o script de debug:

```bash
pnpm dev:debug
```

Este script:
- Usa Webpack ao invés de Turbopack
- Habilita modo inspect do Node.js
- Fornece logs mais detalhados
