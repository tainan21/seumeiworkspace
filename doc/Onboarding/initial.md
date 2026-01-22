Papel: V0 = Arquiteto de Produto (front-end-first). Entregue: fluxo visual mockado (telas + animações + mock data + regras de domínio escritas como funções/pseudocódigo), pronto para handoff para frontend devs. Seja direto, prático e orientado a execução.

Você é um Arquiteto de Produto (front-end-first). Entregue: fluxo visual mockado (telas + animações + mock data + regras de domínio escritas como funções/pseudocódigo), pronto para handoff para frontend e backend devs. Seja direto, prático e orientado a execução.

Objetivo

Construir um onboarding de criação de Workspace 100% front-end mockado para o Seumei. Tudo deve ser visual (telas + animações) usando dados mockados, mas com regras reais de domínio implementadas dentro da pasta domains/ (DDD). As validações passam pela API (mocked endpoints), mas TODAS as regras de estrutura/arquitetura/criação residem nos domains (funções reais/pseudocódigo). No final o fluxo gera um JSON final (mock) que representa o workspace a ser salvo.

Restrições e pressupostos

1. **Wireframes / Screen list**: imagens/descrições para as 8 partes/etapas (cada tela com título, objetivo, componentes, states). Preferível exportar como JSON que represente cada tela.
2. **Component list**: nome, props, estados, eventos (ex.: `Uploader`, `ThemePicker`, `FeatureSelector`, `TemplateCard`, `AssemblyAnimation`).
3. **Mock API contracts**: endpoints, request body, response body, error cases.
4. **Domains pseudocódigo**: funções para regras principais (create workspace, apply template, validate CNPJ/CPF optional, enforce 1 free workspace per user, RBAC defaults). TS-like, testable.
5. **Mock data**: exemplos concretos (users, templates, components, colors, menu items). Final JSON de workspace (ex.: `workspacePayload.json`).
6. **Acceptance criteria**: checklist por etapa (o que valida que a etapa está OK).
7. **Animações**: especificação sucinta das animações (start/loop/end), duração e triggers (não é necessário entregar CSS final, mas descrever como implementar com Framer Motion/Tailwind).
8. **Preview screen**: representação JSON + descrição do menu lateral e topbar resultante.

Fluxo (8 passos — ser literal e numerado)
1. **Intro (3 mensagens / 3 steps)**

   * Mostrar 3 cards/steps em sequência explicando: o que é configuração, ‘montar o sistema’ e o que será pedido. Após os 3 cards, pedir: *foto da empresa, nome da empresa, CNPJ/CPF (opcional)*. Campo de upload aceita imagem mock.
   * Acceptance: user pode avançar apenas após preencher `name` e (opcionalmente) upload.

2. **Tema & Features**

   * Tela com `ThemePicker` (paleta de cores + estilo: minimal / corporate / playful) e `FeatureSelector` (checkboxes para features principais). Mostrar contagem de features ativas.
   * Acceptance: pelo menos 1 feature selecionada.

3. **Tipo de empresa & tamanho**

   * Select do tipo de empresa (MEI, Simples, EIRELI, Ltda, etc.), e um input/slider para número de funcionários, faturamento faixa. Esses valores alimentam regras de template sugerido.
   * Acceptance: tipo preenchido; sliders tem limits.

4. **Template ou construir do zero**

   * Tela com duas cards: `Escolher template pronto` OU `Montar meu sistema`.
   * Cada opção tem pré-visualização animada: ao escolher, rodar uma animação que mostra blocos sendo colocados (assembly animation).

   * Acceptance: escolha feita e animação concluída.

5. **(Se montar) Escolhas detalhadas**

   * Exibir tipos de sistema (os 10 tipos priorizados), paletas de cores, set de componentes (barTop-A / barTop-B / barTop-C), e organização do menu (collapsed/expanded). Permitir arrastar componentes para mock-menu (drag & drop).
   * Acceptance: mapa de menu preenchido e topBar selecionado.

6. **(Se template) Customizações rápidas**

   * Se o usuário escolheu um template, permitir ajustes rápidos: trocar cores, reordenar menu, adicionar/remover módulos principais. Também mostrar animação de reconfiguração.
   * Acceptance: salvar customizações mock.

7. **Resumo / Preview (confirm)**

   * Exibir JSON mock com tudo que foi selecionado + preview visual do app montado (mock UI). Mostrar `Confirmar e Criar`.
   * Acceptance: botão `Confirmar` ativa e gera `workspacePayload.json` mock.

8. **Criar + Redirecionar para Dashboard**
Executar chamada mock POST /api/mock/domains/workspace/create que invoca domains/workspace.createWorkspace(payload) e retorna 200 + mockWorkspace. Salvar mockUserSettings. Redirecionar para dashboard mock com tema e menus conforme seleção.

Acceptance: dashboard mock mostra topBar e side menu conforme escolhas; mockUserSettings reflete seleção do usuário.

Regras de domínio obrigatórias (colocar dentro de domains/)

enforceSingleFreeWorkspace(userId) → erro se usuário já tem workspace gratuito. (exceção: enterprise allow)

validateCompanyIdentifier(id, type) → valida CNPJ/CPF (basic checksum + format). Retorna valid|invalid|optional.

chooseDefaultAppsByCompanyType(companyType) → retorna suggested apps list.

applyTemplateCompatibility(template, features, companyType) → garante que template suporta selected features, caso contrário retornar warnings e sugestões.

assembleMenu(componentsSelected) → transformar seleção DnD em menuItems[] ordenado.

generateRBACDefaults(workspace) → cria roles Owner/Admin/Member/Guest com permission blobs.

Forneça pseudocódigo TS para cada uma.

Contratos de API Mock (exemplos exigidos)

GET /api/mock/domains/templates → lista templates (mock)

POST /api/mock/domains/validate-id { type: 'CNPJ'|'CPF', value } → { valid: boolean, message }

POST /api/mock/domains/workspace/create { payload } → { success: boolean, workspace, errors? }

POST /api/mock/domains/preview { payload } → { previewHtml: string, previewJson }

JSON final esperado (exemplo mínimo)
{
  "workspaceId": "mock-uuid-123",
  "slug": "acme-studio",
  "name": "Acme Studio",
  "brand": { "logo": "data:image/png;base64,...", "colors": { "primary": "#123456", "accent": "#FFAA00" } },
  "company": { "name": "Acme LTDA", "identifier": { "type": "CNPJ", "value": "12.345.678/0001-95" } },
  "apps": ["projects","docs","people"],
  "menuItems": [{"id":"projects","label":"Projetos","order":1},{"id":"docs","label":"Docs","order":2}],
  "topBarVariant":"barTop-A",
  "theme":"corporate",
  "ownerId":"user-mock-1",
  "settings": { "billingPlan":"free", "locale":"pt-BR" }
}
Esse é somente um exemplo minimo..

Critérios de aceitação (resumidos)

Mocked flow completo 8 passos funcional no front.

Todos os domains escritos em TS-like pseudocódigo e testáveis mentalmente.

Mock API contracts documentados e convergentes com domains.
Visual preview que respeita menuItems e topBarVariant.

Animations: assembly + reconfiguration descritas com triggers.

Tom: direto, técnico, sem hype. Entregar artefatos em formato JSON + pseudocódigo + capturas/wireframes. Evitar pedir aprovações constantes: entregue tudo pronto para handed-off ao time frontend.

Fim. Boa sorte, amigo, monte um plano e nos apresente
