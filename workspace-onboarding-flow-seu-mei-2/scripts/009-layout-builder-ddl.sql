-- ============================================
-- SCRIPT: 009-layout-builder-ddl.sql
-- Tabelas para configuracao de layout
-- ============================================

-- Tabela de layouts de workspace
CREATE TABLE IF NOT EXISTS workspace_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice para busca por workspace
CREATE INDEX IF NOT EXISTS idx_workspace_layouts_workspace_id 
  ON workspace_layouts(workspace_id);

-- Indice para buscar layout ativo
CREATE INDEX IF NOT EXISTS idx_workspace_layouts_active 
  ON workspace_layouts(workspace_id) 
  WHERE is_active = true;

-- Tabela de presets de layout (templates do sistema)
CREATE TABLE IF NOT EXISTS layout_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  category VARCHAR(50) NOT NULL, -- minimal, professional, creative, data-heavy
  is_system BOOLEAN DEFAULT false, -- presets do sistema vs criados pelo usuario
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice para busca por categoria
CREATE INDEX IF NOT EXISTS idx_layout_presets_category 
  ON layout_presets(category);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_workspace_layouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_workspace_layouts_updated_at ON workspace_layouts;
CREATE TRIGGER trigger_workspace_layouts_updated_at
  BEFORE UPDATE ON workspace_layouts
  FOR EACH ROW
  EXECUTE FUNCTION update_workspace_layouts_updated_at();

-- Garantir apenas um layout ativo por workspace
CREATE OR REPLACE FUNCTION ensure_single_active_layout()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE workspace_layouts 
    SET is_active = false 
    WHERE workspace_id = NEW.workspace_id 
      AND id != NEW.id 
      AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_single_active_layout ON workspace_layouts;
CREATE TRIGGER trigger_single_active_layout
  BEFORE INSERT OR UPDATE ON workspace_layouts
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_layout();

-- Inserir presets padrao do sistema
INSERT INTO layout_presets (name, description, config, category, is_system) VALUES
(
  'Minimalista',
  'Layout clean e focado no essencial',
  '{
    "sidebar": {
      "variant": "mini",
      "position": "left",
      "width": 64,
      "collapsedWidth": 64,
      "isCollapsible": true,
      "isCollapsed": false,
      "showHeader": true,
      "showFooter": true,
      "showDividers": false,
      "stickyHeader": true
    },
    "topBar": {
      "variant": "barTop-A",
      "height": 56,
      "isVisible": true,
      "isSticky": true,
      "showSearch": true,
      "showNotifications": true,
      "showUserMenu": true,
      "showBreadcrumb": false,
      "showLogo": true
    },
    "dashboard": {
      "layoutType": "grid",
      "columns": 12,
      "gap": 24,
      "padding": 32,
      "maxWidth": null
    },
    "footer": {
      "isVisible": false,
      "height": 48,
      "isSticky": false,
      "showVersion": false,
      "showCopyright": false,
      "customContent": null
    },
    "visualStyle": {
      "density": "spacious",
      "borderStyle": "rounded",
      "shadowIntensity": "subtle",
      "animationLevel": "subtle"
    }
  }',
  'minimal',
  true
),
(
  'Profissional',
  'Layout corporativo com todas as funcionalidades',
  '{
    "sidebar": {
      "variant": "standard",
      "position": "left",
      "width": 260,
      "collapsedWidth": 64,
      "isCollapsible": true,
      "isCollapsed": false,
      "showHeader": true,
      "showFooter": true,
      "showDividers": true,
      "stickyHeader": true
    },
    "topBar": {
      "variant": "barTop-A",
      "height": 64,
      "isVisible": true,
      "isSticky": true,
      "showSearch": true,
      "showNotifications": true,
      "showUserMenu": true,
      "showBreadcrumb": true,
      "showLogo": true
    },
    "dashboard": {
      "layoutType": "grid",
      "columns": 12,
      "gap": 16,
      "padding": 24,
      "maxWidth": null
    },
    "footer": {
      "isVisible": true,
      "height": 48,
      "isSticky": false,
      "showVersion": true,
      "showCopyright": true,
      "customContent": null
    },
    "visualStyle": {
      "density": "comfortable",
      "borderStyle": "rounded",
      "shadowIntensity": "medium",
      "animationLevel": "subtle"
    }
  }',
  'professional',
  true
),
(
  'Compacto',
  'Maximiza o espaco de conteudo',
  '{
    "sidebar": {
      "variant": "compact",
      "position": "left",
      "width": 180,
      "collapsedWidth": 48,
      "isCollapsible": true,
      "isCollapsed": false,
      "showHeader": true,
      "showFooter": false,
      "showDividers": false,
      "stickyHeader": true
    },
    "topBar": {
      "variant": "barTop-A",
      "height": 48,
      "isVisible": true,
      "isSticky": true,
      "showSearch": true,
      "showNotifications": true,
      "showUserMenu": true,
      "showBreadcrumb": false,
      "showLogo": true
    },
    "dashboard": {
      "layoutType": "table-focus",
      "columns": 12,
      "gap": 8,
      "padding": 16,
      "maxWidth": null
    },
    "footer": {
      "isVisible": false,
      "height": 32,
      "isSticky": false,
      "showVersion": false,
      "showCopyright": false,
      "customContent": null
    },
    "visualStyle": {
      "density": "compact",
      "borderStyle": "sharp",
      "shadowIntensity": "none",
      "animationLevel": "none"
    }
  }',
  'data-heavy',
  true
),
(
  'Criativo',
  'Layout dinamico com visual moderno',
  '{
    "sidebar": {
      "variant": "floating",
      "position": "left",
      "width": 280,
      "collapsedWidth": 64,
      "isCollapsible": true,
      "isCollapsed": false,
      "showHeader": true,
      "showFooter": true,
      "showDividers": true,
      "stickyHeader": true
    },
    "topBar": {
      "variant": "barTop-B",
      "height": 60,
      "isVisible": true,
      "isSticky": true,
      "showSearch": true,
      "showNotifications": true,
      "showUserMenu": true,
      "showBreadcrumb": false,
      "showLogo": true
    },
    "dashboard": {
      "layoutType": "bento",
      "columns": 12,
      "gap": 20,
      "padding": 28,
      "maxWidth": null
    },
    "footer": {
      "isVisible": false,
      "height": 48,
      "isSticky": false,
      "showVersion": false,
      "showCopyright": false,
      "customContent": null
    },
    "visualStyle": {
      "density": "comfortable",
      "borderStyle": "pill",
      "shadowIntensity": "strong",
      "animationLevel": "full"
    }
  }',
  'creative',
  true
),
(
  'Kanban',
  'Otimizado para gestao de projetos',
  '{
    "sidebar": {
      "variant": "compact",
      "position": "left",
      "width": 200,
      "collapsedWidth": 56,
      "isCollapsible": true,
      "isCollapsed": false,
      "showHeader": true,
      "showFooter": true,
      "showDividers": true,
      "stickyHeader": true
    },
    "topBar": {
      "variant": "barTop-A",
      "height": 56,
      "isVisible": true,
      "isSticky": true,
      "showSearch": true,
      "showNotifications": true,
      "showUserMenu": true,
      "showBreadcrumb": true,
      "showLogo": true
    },
    "dashboard": {
      "layoutType": "kanban",
      "columns": 12,
      "gap": 12,
      "padding": 20,
      "maxWidth": null
    },
    "footer": {
      "isVisible": false,
      "height": 48,
      "isSticky": false,
      "showVersion": false,
      "showCopyright": false,
      "customContent": null
    },
    "visualStyle": {
      "density": "comfortable",
      "borderStyle": "rounded",
      "shadowIntensity": "subtle",
      "animationLevel": "full"
    }
  }',
  'professional',
  true
)
ON CONFLICT DO NOTHING;
