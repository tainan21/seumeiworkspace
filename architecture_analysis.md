# Análise da Arquitetura do Projeto

## 1. Estrutura de Diretórios `src/app`

A arquitetura de rotas utiliza o App Router do Next.js com suporte a internacionalização (`[locale]`) e tenants (`[workspace]`).

### `src/app/[locale]`
Raiz da aplicação localizada.
- **`[workspace]`**: Rotas contextuais de um workspace específico.
  - **`onboarding`**: Fluxo de onboarding de um workspace existente (pós-criação).
  - **`dashboard`** (dentro de workspace?): Se existir, seria o painel do workspace.
- **`dashboard`**: Aparentemente um painel global ou de usuário (fora do contexto de um workspace único, ou para selecionar workspaces).
  - **`workspaces`**: Gerenciamento de criação de novos workspaces.
- **`api`**: Rotas de API (backend), seguindo a estrutura de domínios.

### Padrão de Design
- **Server Components**: A maioria das páginas (`page.tsx`) são Server Components.
- **Client Components**: Usados para interatividade (`"use client"`), principalmente em `components/`.
- **Actions**: Server Actions (`actions.ts`) co-localizadas com as páginas ou em domínios para mutações.

## 2. Estrutura de Domínios `src/domains`

O projeto segue princípios de DDD (Domain-Driven Design) simplificado.

- **`workspace`**: Domínio Core. Contém lógica de criação, membros, slugs e configurações gerais.
- **`onboarding`**: Gerencia o estado e progresso do onboarding (Passos completados).
- **`product`**: Gerenciamento de produtos (Catalogo).
- **`theme`**: Sistema de temas (Cores, assets, config).
- **`enterprise`**: Dados da empresa (CNPJ, endereço).
- **`wallet`**: Sistema financeiro/bônus do workspace.
- **`shared`**: Validadores e utilitários compartilhados.

Cada domínio geralmente expõe:
- **`services`**: Lógica de negócio e acesso ao DB (Prisma).
- **`types`**: Definições de tipos TypeScript.
- **`actions`** (opcional): Server actions específicas do domínio.

## 3. Integração do Onboarding

Existem dois fluxos distintos que se conectam:

### A. Criação de Workspace (Novo)
- **Localização**: `src/components/onboarding/new-workspace-onboarding.tsx`
- **Gerenciamento**: `Zustand` (Client-side state).
- **Objetivo**: Coletar dados iniciais para *instanciar* o registro `Workspace` no banco.
- **Desfecho**: Chama `createWorkspace` (Server Action) -> Redireciona para `/[workspace]/onboarding`.

### B. Configuração de Workspace (Existente)
- **Localização**: `src/app/[locale]/[workspace]/onboarding/page.tsx` e `OnboardingWizard`.
- **Gerenciamento**: Dados persistidos no banco (`OnboardingCompletion`) e Server Actions passo-a-passo.
- **Objetivo**: Configurar o workspace criado (Empresa, Tema, Features, Primeiro Produto).
- **Desfecho**: Marca onboarding como concluído -> Redireciona para Dashboard do Workspace.

### Recomendações de Integração
1. **Unificação Visual**: Manter a consistência visual entre os dois fluxos (já garantido pelo `shadcn/ui` e sistema de passos).
2. **Persistência**: O fluxo A é efêmero (se der refresh, perde estado, a menos que o Zustand persista). O fluxo B é persistente (salvo no banco). Considerar persistir rascunho de criação se o fluxo A crescer.
3. **Router**: O `OnboardingRouter` (`src/components/onboarding/onboarding-router.tsx`) já atua como orquestrador inteligente, decidindo qual componente renderizar baseado no estado. Isso é um excelente padrão e deve ser mantido.

## 4. Próximos Passos Sugeridos
- Limpar código legado em `editable-details.tsx` e `common-validators.ts`.
- Reforçar testes automatizados (Vitest) para os Services críticos (`WorkspaceService`, `OnboardingService`).
- Padronizar tratamento de erros nas Server Actions (usar `ActionResult` consistentemente).
