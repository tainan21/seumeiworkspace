-- ============================================
-- SEED: Templates e Features
-- ============================================

-- Features disponíveis
INSERT INTO features (slug, name, description, icon, category) VALUES
  ('projects', 'Projetos', 'Kanban, listas e gestão de tarefas', 'FolderKanban', 'core'),
  ('docs', 'Documentos', 'Wiki e base de conhecimento', 'FileText', 'core'),
  ('people', 'Pessoas', 'RH e gestão de equipes', 'Users', 'core'),
  ('finances', 'Financeiro', 'Contas, fluxo de caixa', 'DollarSign', 'core'),
  ('clients', 'Clientes', 'CRM e relacionamento', 'Building2', 'core'),
  ('calendar', 'Agenda', 'Eventos e compromissos', 'Calendar', 'productivity'),
  ('analytics', 'Analytics', 'Dashboards e métricas', 'BarChart3', 'insights'),
  ('reports', 'Relatórios', 'Relatórios customizados', 'FileBarChart', 'insights'),
  ('integrations', 'Integrações', 'Conecte apps externos', 'Puzzle', 'advanced'),
  ('roadmap', 'Roadmap', 'Planejamento de produto', 'Map', 'advanced'),
  ('teams', 'Times', 'Gestão de times', 'UsersRound', 'advanced'),
  ('departments', 'Departamentos', 'Estrutura organizacional', 'Network', 'advanced'),
  ('workflows', 'Workflows', 'Automações e fluxos', 'GitBranch', 'advanced'),
  ('compliance', 'Compliance', 'Conformidade e auditoria', 'Shield', 'enterprise');

-- Component Layouts
INSERT INTO component_layouts (slug, name, type, config) VALUES
  ('barTop-A', 'TopBar Clássica', 'topbar', '{"showSearch": true, "showNotifications": true, "showProfile": true, "layout": "standard"}'),
  ('barTop-B', 'TopBar Minimal', 'topbar', '{"showSearch": true, "showNotifications": false, "showProfile": true, "layout": "minimal"}'),
  ('barTop-C', 'TopBar Expandida', 'topbar', '{"showSearch": true, "showNotifications": true, "showProfile": true, "showBreadcrumb": true, "layout": "expanded"}');

-- ======================================================
-- Template: Startup SaaS
-- ======================================================
INSERT INTO templates (slug, name, description, theme, top_bar_variant, primary_color, accent_color) VALUES
  ('startup-saas', 'Startup SaaS', 'Ideal para startups de tecnologia e produtos digitais', 'minimal', 'barTop-B', '#6366F1', '#22D3EE');

INSERT INTO template_features (template_id, feature_id, is_required)
SELECT t.id, 'projects', true FROM templates t WHERE t.slug = 'startup-saas'
UNION ALL
SELECT t.id, 'docs', false FROM templates t WHERE t.slug = 'startup-saas'
UNION ALL
SELECT t.id, 'analytics', false FROM templates t WHERE t.slug = 'startup-saas'
UNION ALL
SELECT t.id, 'roadmap', false FROM templates t WHERE t.slug = 'startup-saas'
UNION ALL
SELECT t.id, 'integrations', false FROM templates t WHERE t.slug = 'startup-saas';

INSERT INTO template_target_companies (template_id, company_type)
SELECT t.id, 'Startup'::company_type FROM templates t WHERE t.slug = 'startup-saas'
UNION ALL
SELECT t.id, 'Ltda'::company_type FROM templates t WHERE t.slug = 'startup-saas';

INSERT INTO template_menu_presets (template_id, item_id, label, icon, order_index)
SELECT t.id, 'dashboard', 'Dashboard', 'LayoutDashboard', 0 FROM templates t WHERE t.slug = 'startup-saas'
UNION ALL
SELECT t.id, 'projects', 'Projetos', 'FolderKanban', 1 FROM templates t WHERE t.slug = 'startup-saas'
UNION ALL
SELECT t.id, 'roadmap', 'Roadmap', 'Map', 2 FROM templates t WHERE t.slug = 'startup-saas'
UNION ALL
SELECT t.id, 'docs', 'Docs', 'FileText', 3 FROM templates t WHERE t.slug = 'startup-saas'
UNION ALL
SELECT t.id, 'analytics', 'Analytics', 'BarChart3', 4 FROM templates t WHERE t.slug = 'startup-saas'
UNION ALL
SELECT t.id, 'settings', 'Configurações', 'Settings', 99 FROM templates t WHERE t.slug = 'startup-saas';

-- ======================================================
-- Template: Agência Criativa
-- ======================================================
INSERT INTO templates (slug, name, description, theme, top_bar_variant, primary_color, accent_color) VALUES
  ('agency', 'Agência Criativa', 'Gestão de projetos e clientes para agências', 'playful', 'barTop-A', '#EC4899', '#F59E0B');

INSERT INTO template_features (template_id, feature_id, is_required)
SELECT t.id, 'projects', true FROM templates t WHERE t.slug = 'agency'
UNION ALL
SELECT t.id, 'clients', true FROM templates t WHERE t.slug = 'agency'
UNION ALL
SELECT t.id, 'finances', false FROM templates t WHERE t.slug = 'agency'
UNION ALL
SELECT t.id, 'calendar', false FROM templates t WHERE t.slug = 'agency'
UNION ALL
SELECT t.id, 'docs', false FROM templates t WHERE t.slug = 'agency';

INSERT INTO template_target_companies (template_id, company_type)
SELECT t.id, 'Simples'::company_type FROM templates t WHERE t.slug = 'agency'
UNION ALL
SELECT t.id, 'EIRELI'::company_type FROM templates t WHERE t.slug = 'agency'
UNION ALL
SELECT t.id, 'Ltda'::company_type FROM templates t WHERE t.slug = 'agency';

INSERT INTO template_menu_presets (template_id, item_id, label, icon, order_index)
SELECT t.id, 'dashboard', 'Dashboard', 'LayoutDashboard', 0 FROM templates t WHERE t.slug = 'agency'
UNION ALL
SELECT t.id, 'projects', 'Projetos', 'FolderKanban', 1 FROM templates t WHERE t.slug = 'agency'
UNION ALL
SELECT t.id, 'clients', 'Clientes', 'Building2', 2 FROM templates t WHERE t.slug = 'agency'
UNION ALL
SELECT t.id, 'calendar', 'Agenda', 'Calendar', 3 FROM templates t WHERE t.slug = 'agency'
UNION ALL
SELECT t.id, 'finances', 'Financeiro', 'DollarSign', 4 FROM templates t WHERE t.slug = 'agency'
UNION ALL
SELECT t.id, 'settings', 'Configurações', 'Settings', 99 FROM templates t WHERE t.slug = 'agency';

-- ======================================================
-- Template: Corporativo
-- ======================================================
INSERT INTO templates (slug, name, description, theme, top_bar_variant, primary_color, accent_color) VALUES
  ('corporate', 'Corporativo', 'Estrutura completa para empresas estabelecidas', 'corporate', 'barTop-C', '#1E40AF', '#059669');

INSERT INTO template_features (template_id, feature_id, is_required)
SELECT t.id, 'docs', true FROM templates t WHERE t.slug = 'corporate'
UNION ALL
SELECT t.id, 'people', true FROM templates t WHERE t.slug = 'corporate'
UNION ALL
SELECT t.id, 'projects', false FROM templates t WHERE t.slug = 'corporate'
UNION ALL
SELECT t.id, 'finances', false FROM templates t WHERE t.slug = 'corporate'
UNION ALL
SELECT t.id, 'reports', false FROM templates t WHERE t.slug = 'corporate'
UNION ALL
SELECT t.id, 'compliance', false FROM templates t WHERE t.slug = 'corporate';

INSERT INTO template_target_companies (template_id, company_type)
SELECT t.id, 'Ltda'::company_type FROM templates t WHERE t.slug = 'corporate'
UNION ALL
SELECT t.id, 'SA'::company_type FROM templates t WHERE t.slug = 'corporate';

INSERT INTO template_menu_presets (template_id, item_id, label, icon, order_index)
SELECT t.id, 'dashboard', 'Dashboard', 'LayoutDashboard', 0 FROM templates t WHERE t.slug = 'corporate'
UNION ALL
SELECT t.id, 'people', 'Pessoas', 'Users', 1 FROM templates t WHERE t.slug = 'corporate'
UNION ALL
SELECT t.id, 'docs', 'Documentos', 'FileText', 2 FROM templates t WHERE t.slug = 'corporate'
UNION ALL
SELECT t.id, 'projects', 'Projetos', 'FolderKanban', 3 FROM templates t WHERE t.slug = 'corporate'
UNION ALL
SELECT t.id, 'reports', 'Relatórios', 'FileBarChart', 4 FROM templates t WHERE t.slug = 'corporate'
UNION ALL
SELECT t.id, 'finances', 'Financeiro', 'DollarSign', 5 FROM templates t WHERE t.slug = 'corporate'
UNION ALL
SELECT t.id, 'settings', 'Configurações', 'Settings', 99 FROM templates t WHERE t.slug = 'corporate';

-- ======================================================
-- Template: Freelancer
-- ======================================================
INSERT INTO templates (slug, name, description, theme, top_bar_variant, primary_color, accent_color) VALUES
  ('freelancer', 'Freelancer', 'Simples e direto ao ponto para profissionais autônomos', 'minimal', 'barTop-A', '#10B981', '#8B5CF6');

INSERT INTO template_features (template_id, feature_id, is_required)
SELECT t.id, 'finances', true FROM templates t WHERE t.slug = 'freelancer'
UNION ALL
SELECT t.id, 'projects', false FROM templates t WHERE t.slug = 'freelancer'
UNION ALL
SELECT t.id, 'clients', false FROM templates t WHERE t.slug = 'freelancer'
UNION ALL
SELECT t.id, 'calendar', false FROM templates t WHERE t.slug = 'freelancer';

INSERT INTO template_target_companies (template_id, company_type)
SELECT t.id, 'MEI'::company_type FROM templates t WHERE t.slug = 'freelancer';

INSERT INTO template_menu_presets (template_id, item_id, label, icon, order_index)
SELECT t.id, 'dashboard', 'Dashboard', 'LayoutDashboard', 0 FROM templates t WHERE t.slug = 'freelancer'
UNION ALL
SELECT t.id, 'finances', 'Financeiro', 'DollarSign', 1 FROM templates t WHERE t.slug = 'freelancer'
UNION ALL
SELECT t.id, 'clients', 'Clientes', 'Building2', 2 FROM templates t WHERE t.slug = 'freelancer'
UNION ALL
SELECT t.id, 'projects', 'Projetos', 'FolderKanban', 3 FROM templates t WHERE t.slug = 'freelancer'
UNION ALL
SELECT t.id, 'calendar', 'Agenda', 'Calendar', 4 FROM templates t WHERE t.slug = 'freelancer'
UNION ALL
SELECT t.id, 'settings', 'Configurações', 'Settings', 99 FROM templates t WHERE t.slug = 'freelancer';
