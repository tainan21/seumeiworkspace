-- ============================================
-- DDL: Component Configuration Tables
-- Stores user component configurations and presets
-- ============================================

-- ============================================
-- ENUMS (se ainda nao existirem)
-- ============================================

DO $$ BEGIN
  CREATE TYPE sidebar_variant AS ENUM ('standard', 'compact', 'mini', 'floating', 'dual', 'hidden');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE dashboard_layout_type AS ENUM ('grid', 'masonry', 'list', 'kanban', 'split', 'bento', 'timeline', 'calendar', 'table-focus');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sidebar_behavior AS ENUM ('fixed', 'collapsible', 'hover', 'hidden');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sidebar_position AS ENUM ('left', 'right');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE topbar_layout AS ENUM ('centered', 'left-aligned', 'split', 'minimal');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE layout_density AS ENUM ('compact', 'comfortable', 'spacious');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE border_style AS ENUM ('none', 'subtle', 'standard', 'prominent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- COMPONENT CONFIGURATIONS
-- ============================================

-- Workspace Component Configs (per-workspace settings)
CREATE TABLE IF NOT EXISTS workspace_component_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Sidebar Configuration
  sidebar_variant sidebar_variant NOT NULL DEFAULT 'standard',
  sidebar_behavior sidebar_behavior NOT NULL DEFAULT 'collapsible',
  sidebar_position sidebar_position NOT NULL DEFAULT 'left',
  sidebar_width_expanded INTEGER NOT NULL DEFAULT 240,
  sidebar_width_collapsed INTEGER NOT NULL DEFAULT 72,
  sidebar_show_logo BOOLEAN NOT NULL DEFAULT true,
  sidebar_show_search BOOLEAN NOT NULL DEFAULT true,
  sidebar_show_user_profile BOOLEAN NOT NULL DEFAULT true,
  sidebar_group_navigation BOOLEAN NOT NULL DEFAULT true,
  
  -- TopBar Configuration
  topbar_variant topbar_variant NOT NULL DEFAULT 'barTop-A',
  topbar_layout topbar_layout NOT NULL DEFAULT 'left-aligned',
  topbar_height INTEGER NOT NULL DEFAULT 56,
  topbar_show_search BOOLEAN NOT NULL DEFAULT true,
  topbar_show_notifications BOOLEAN NOT NULL DEFAULT true,
  topbar_show_user_menu BOOLEAN NOT NULL DEFAULT true,
  topbar_show_breadcrumbs BOOLEAN NOT NULL DEFAULT true,
  topbar_show_quick_actions BOOLEAN NOT NULL DEFAULT false,
  topbar_sticky_on_scroll BOOLEAN NOT NULL DEFAULT true,
  
  -- Dashboard Configuration
  dashboard_type dashboard_layout_type NOT NULL DEFAULT 'grid',
  dashboard_columns INTEGER NOT NULL DEFAULT 12,
  dashboard_gap INTEGER NOT NULL DEFAULT 16,
  dashboard_padding INTEGER NOT NULL DEFAULT 24,
  dashboard_enable_drag_drop BOOLEAN NOT NULL DEFAULT true,
  dashboard_enable_resize BOOLEAN NOT NULL DEFAULT true,
  
  -- Footer Configuration
  footer_enabled BOOLEAN NOT NULL DEFAULT true,
  footer_height INTEGER NOT NULL DEFAULT 48,
  footer_show_copyright BOOLEAN NOT NULL DEFAULT true,
  footer_show_version BOOLEAN NOT NULL DEFAULT false,
  footer_show_links BOOLEAN NOT NULL DEFAULT true,
  footer_sticky BOOLEAN NOT NULL DEFAULT false,
  
  -- Visual Settings
  density layout_density NOT NULL DEFAULT 'comfortable',
  border_style border_style NOT NULL DEFAULT 'subtle',
  enable_animations BOOLEAN NOT NULL DEFAULT true,
  
  -- JSON fields for complex configs
  fonts_config JSONB NOT NULL DEFAULT '{}',
  tailwind_overrides JSONB NOT NULL DEFAULT '{}',
  slots_config JSONB NOT NULL DEFAULT '{}',
  widget_config JSONB NOT NULL DEFAULT '{}',
  
  -- Active preset reference
  active_preset_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(workspace_id)
);

CREATE INDEX idx_workspace_component_configs_workspace ON workspace_component_configs(workspace_id);

-- ============================================
-- CUSTOM PRESETS (user-created)
-- ============================================

CREATE TABLE IF NOT EXISTS component_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE, -- NULL = system preset
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  
  -- Full configuration snapshot
  config JSONB NOT NULL,
  
  -- Metadata
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT false,
  use_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_component_presets_workspace ON component_presets(workspace_id);
CREATE INDEX idx_component_presets_system ON component_presets(is_system) WHERE is_system = true;

-- Add FK to workspace_component_configs after component_presets exists
ALTER TABLE workspace_component_configs 
  ADD CONSTRAINT fk_component_configs_preset 
  FOREIGN KEY (active_preset_id) 
  REFERENCES component_presets(id) 
  ON DELETE SET NULL;

-- ============================================
-- CONFIGURATION HISTORY (for undo/redo)
-- ============================================

CREATE TABLE IF NOT EXISTS component_config_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Snapshot of config at this point
  config_snapshot JSONB NOT NULL,
  
  -- Action that caused this snapshot
  action VARCHAR(100) NOT NULL,
  action_description TEXT,
  
  -- Who made the change (when auth exists)
  changed_by UUID,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_component_config_history_workspace ON component_config_history(workspace_id, created_at DESC);

-- Limit history entries per workspace (keep last 100)
CREATE OR REPLACE FUNCTION limit_component_config_history()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM component_config_history
  WHERE workspace_id = NEW.workspace_id
  AND id NOT IN (
    SELECT id FROM component_config_history
    WHERE workspace_id = NEW.workspace_id
    ORDER BY created_at DESC
    LIMIT 100
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_limit_config_history
AFTER INSERT ON component_config_history
FOR EACH ROW
EXECUTE FUNCTION limit_component_config_history();

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER tr_workspace_component_configs_updated_at 
BEFORE UPDATE ON workspace_component_configs 
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_component_presets_updated_at 
BEFORE UPDATE ON component_presets 
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE workspace_component_configs IS 'Per-workspace component configuration settings';
COMMENT ON TABLE component_presets IS 'Saved layout presets - system or user-created';
COMMENT ON TABLE component_config_history IS 'History of config changes for undo/redo';
