-- ============================================
-- DDL: Seumei Database Schema
-- PostgreSQL 14+
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca fuzzy

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE theme_style AS ENUM ('minimal', 'corporate', 'playful');
CREATE TYPE topbar_variant AS ENUM ('barTop-A', 'barTop-B', 'barTop-C');
CREATE TYPE billing_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE identifier_type AS ENUM ('CNPJ', 'CPF');
CREATE TYPE company_type AS ENUM ('MEI', 'Simples', 'EIRELI', 'Ltda', 'SA', 'Startup');
CREATE TYPE permission_action AS ENUM ('create', 'read', 'update', 'delete', 'manage');
CREATE TYPE member_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');
CREATE TYPE component_type AS ENUM ('topbar', 'sidebar', 'footer');

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- Workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL, -- FK para users será adicionada quando auth existir
  created_by UUID NOT NULL,
  theme theme_style NOT NULL DEFAULT 'minimal',
  top_bar_variant topbar_variant NOT NULL DEFAULT 'barTop-A',
  billing_plan billing_plan NOT NULL DEFAULT 'free',
  locale VARCHAR(10) NOT NULL DEFAULT 'pt-BR',
  timezone VARCHAR(50) NOT NULL DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_workspaces_created_by ON workspaces(created_by);

-- Workspace Brand
CREATE TABLE workspace_brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  logo_url TEXT,
  primary_color VARCHAR(7) NOT NULL DEFAULT '#18181B',
  accent_color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workspace Company
CREATE TABLE workspace_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  identifier_type identifier_type,
  identifier_value VARCHAR(18),
  company_type company_type,
  employee_count INTEGER,
  revenue_range VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workspace Apps
CREATE TABLE workspace_apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  app_id VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, app_id)
);

CREATE INDEX idx_workspace_apps_workspace ON workspace_apps(workspace_id);

-- Menu Items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  item_id VARCHAR(50) NOT NULL,
  label VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  route VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_menu_items_workspace ON menu_items(workspace_id, order_index);

-- Templates (seed data)
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  theme theme_style NOT NULL DEFAULT 'minimal',
  top_bar_variant topbar_variant NOT NULL DEFAULT 'barTop-A',
  primary_color VARCHAR(7) NOT NULL,
  accent_color VARCHAR(7) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Template Features
CREATE TABLE template_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  feature_id VARCHAR(50) NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(template_id, feature_id)
);

-- Template Target Company Types
CREATE TABLE template_target_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  company_type company_type NOT NULL,
  UNIQUE(template_id, company_type)
);

-- Template Menu Presets
CREATE TABLE template_menu_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  item_id VARCHAR(50) NOT NULL,
  label VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_template_menu_presets_template ON template_menu_presets(template_id, order_index);

-- ============================================
-- RBAC TABLES
-- ============================================

-- Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  slug VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, slug)
);

CREATE INDEX idx_roles_workspace ON roles(workspace_id);

-- Role Permissions
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  resource VARCHAR(50) NOT NULL,
  action permission_action NOT NULL,
  scope UUID NOT NULL, -- workspace_id
  UNIQUE(role_id, resource, action)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);

-- Workspace Members
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id),
  invited_by UUID,
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  status member_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);

-- Workspace Invites
CREATE TABLE workspace_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id),
  invited_by UUID NOT NULL,
  token VARCHAR(100) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workspace_invites_token ON workspace_invites(token);
CREATE INDEX idx_workspace_invites_email ON workspace_invites(email);

-- ============================================
-- BILLING TABLES
-- ============================================

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  plan billing_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Wallets
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ONBOARDING & SETTINGS
-- ============================================

-- Onboarding Completions
CREATE TABLE onboarding_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  current_step INTEGER NOT NULL DEFAULT 1 CHECK (current_step >= 1 AND current_step <= 8),
  steps_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Features Catalog (seed data)
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50) NOT NULL,
  category VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Component Layouts (seed data)
CREATE TABLE component_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  type component_type NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Settings
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  default_workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  ui_preferences JSONB NOT NULL DEFAULT '{}',
  notification_preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER tr_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_workspace_brands_updated_at BEFORE UPDATE ON workspace_brands FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_workspace_companies_updated_at BEFORE UPDATE ON workspace_companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_workspace_members_updated_at BEFORE UPDATE ON workspace_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_onboarding_completions_updated_at BEFORE UPDATE ON onboarding_completions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE workspaces IS 'Workspace principal - unidade de tenant';
COMMENT ON TABLE workspace_brands IS 'Branding do workspace (logo, cores)';
COMMENT ON TABLE workspace_companies IS 'Dados da empresa vinculada ao workspace';
COMMENT ON TABLE workspace_apps IS 'Apps/módulos habilitados no workspace';
COMMENT ON TABLE menu_items IS 'Itens do menu lateral, ordenáveis';
COMMENT ON TABLE templates IS 'Templates pré-definidos para onboarding';
COMMENT ON TABLE roles IS 'Papéis RBAC por workspace';
COMMENT ON TABLE role_permissions IS 'Permissões por papel, com scope por workspace';
COMMENT ON TABLE workspace_members IS 'Membros do workspace com papel atribuído';
COMMENT ON TABLE workspace_invites IS 'Convites pendentes para workspace';
COMMENT ON TABLE subscriptions IS 'Assinaturas e billing';
COMMENT ON TABLE wallets IS 'Carteira de créditos do workspace';
COMMENT ON TABLE onboarding_completions IS 'Status do onboarding por workspace';
COMMENT ON TABLE features IS 'Catálogo de features disponíveis (seed)';
COMMENT ON TABLE component_layouts IS 'Layouts de componentes UI (seed)';
COMMENT ON TABLE user_settings IS 'Preferências do usuário (não do workspace)';
