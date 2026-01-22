-- ============================================
-- SEED: Workspace de exemplo (corrigido)
-- ============================================

-- Mock user ID (será substituído por auth real)
DO $$
DECLARE
  mock_user_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  v_workspace_id UUID;
  v_owner_role_id UUID;
  v_admin_role_id UUID;
  v_member_role_id UUID;
  v_guest_role_id UUID;
BEGIN
  -- Criar workspace de exemplo
  INSERT INTO workspaces (id, slug, name, owner_id, created_by, theme, top_bar_variant, billing_plan)
  VALUES (
    uuid_generate_v4(),
    'acme-studio',
    'Acme Studio',
    mock_user_id,
    mock_user_id,
    'corporate'::theme_style,
    'barTop-A'::topbar_variant,
    'free'::billing_plan
  )
  RETURNING id INTO v_workspace_id;

  -- Brand
  INSERT INTO workspace_brands (workspace_id, primary_color, accent_color)
  VALUES (v_workspace_id, '#2563EB', '#F59E0B');

  -- Company (casts para enums)
  INSERT INTO workspace_companies (workspace_id, name, identifier_type, identifier_value, company_type, employee_count)
  VALUES (v_workspace_id, 'Acme Tecnologia LTDA', 'CNPJ'::identifier_type, '12.345.678/0001-95', 'Ltda'::company_type, 25);

  -- Apps
  INSERT INTO workspace_apps (workspace_id, app_id) VALUES
    (v_workspace_id, 'projects'),
    (v_workspace_id, 'docs'),
    (v_workspace_id, 'people'),
    (v_workspace_id, 'finances'),
    (v_workspace_id, 'analytics');

  -- Menu Items
  INSERT INTO menu_items (workspace_id, item_id, label, icon, route, order_index) VALUES
    (v_workspace_id, 'dashboard', 'Dashboard', 'LayoutDashboard', '/dashboard', 0),
    (v_workspace_id, 'projects', 'Projetos', 'FolderKanban', '/projects', 1),
    (v_workspace_id, 'docs', 'Documentos', 'FileText', '/docs', 2),
    (v_workspace_id, 'people', 'Pessoas', 'Users', '/people', 3),
    (v_workspace_id, 'finances', 'Financeiro', 'DollarSign', '/finances', 4),
    (v_workspace_id, 'analytics', 'Analytics', 'BarChart3', '/analytics', 5),
    (v_workspace_id, 'settings', 'Configurações', 'Settings', '/settings', 99);

  -- RBAC Roles
  INSERT INTO roles (workspace_id, slug, name, description, is_system)
  VALUES (v_workspace_id, 'owner', 'Proprietário', 'Acesso total ao workspace', true)
  RETURNING id INTO v_owner_role_id;

  INSERT INTO roles (workspace_id, slug, name, description, is_system)
  VALUES (v_workspace_id, 'admin', 'Administrador', 'Gerencia membros e configurações', true)
  RETURNING id INTO v_admin_role_id;

  INSERT INTO roles (workspace_id, slug, name, description, is_default, is_system)
  VALUES (v_workspace_id, 'member', 'Membro', 'Acesso padrão aos apps', true, false)
  RETURNING id INTO v_member_role_id;

  INSERT INTO roles (workspace_id, slug, name, description, is_system)
  VALUES (v_workspace_id, 'guest', 'Convidado', 'Acesso somente leitura', true)
  RETURNING id INTO v_guest_role_id;

  -- Owner Permissions
  INSERT INTO role_permissions (role_id, resource, action, scope) VALUES
    (v_owner_role_id, '*', 'manage'::permission_action, v_workspace_id),
    (v_owner_role_id, 'workspace', 'manage'::permission_action, v_workspace_id),
    (v_owner_role_id, 'billing', 'manage'::permission_action, v_workspace_id),
    (v_owner_role_id, 'members', 'manage'::permission_action, v_workspace_id);

  -- Admin Permissions
  INSERT INTO role_permissions (role_id, resource, action, scope) VALUES
    (v_admin_role_id, 'members', 'create'::permission_action, v_workspace_id),
    (v_admin_role_id, 'members', 'read'::permission_action, v_workspace_id),
    (v_admin_role_id, 'members', 'update'::permission_action, v_workspace_id),
    (v_admin_role_id, 'settings', 'read'::permission_action, v_workspace_id),
    (v_admin_role_id, 'settings', 'update'::permission_action, v_workspace_id),
    (v_admin_role_id, 'projects', 'manage'::permission_action, v_workspace_id),
    (v_admin_role_id, 'docs', 'manage'::permission_action, v_workspace_id),
    (v_admin_role_id, 'people', 'manage'::permission_action, v_workspace_id),
    (v_admin_role_id, 'finances', 'manage'::permission_action, v_workspace_id),
    (v_admin_role_id, 'analytics', 'manage'::permission_action, v_workspace_id);

  -- Member Permissions (create/read/update for each installed app)
  INSERT INTO role_permissions (role_id, resource, action, scope)
  SELECT v_member_role_id, app_id, 'create'::permission_action, v_workspace_id FROM workspace_apps WHERE workspace_id = v_workspace_id
  UNION ALL
  SELECT v_member_role_id, app_id, 'read'::permission_action, v_workspace_id FROM workspace_apps WHERE workspace_id = v_workspace_id
  UNION ALL
  SELECT v_member_role_id, app_id, 'update'::permission_action, v_workspace_id FROM workspace_apps WHERE workspace_id = v_workspace_id;

  -- Guest Permissions (read only)
  INSERT INTO role_permissions (role_id, resource, action, scope)
  SELECT v_guest_role_id, app_id, 'read'::permission_action, v_workspace_id FROM workspace_apps WHERE workspace_id = v_workspace_id;

  -- Add owner as member
  INSERT INTO workspace_members (workspace_id, user_id, role_id, status, joined_at)
  VALUES (v_workspace_id, mock_user_id, v_owner_role_id, 'active', NOW());

  -- Subscription
  INSERT INTO subscriptions (workspace_id, plan, status)
  VALUES (v_workspace_id, 'free'::billing_plan, 'active'::subscription_status);

  -- Wallet
  INSERT INTO wallets (workspace_id, balance)
  VALUES (v_workspace_id, 0);

  -- Onboarding completed
  INSERT INTO onboarding_completions (workspace_id, completed_at, current_step)
  VALUES (v_workspace_id, NOW(), 8);

  -- User settings
  INSERT INTO user_settings (user_id, default_workspace_id)
  VALUES (mock_user_id, v_workspace_id)
  ON CONFLICT (user_id) DO UPDATE SET default_workspace_id = EXCLUDED.default_workspace_id;

END $$;
