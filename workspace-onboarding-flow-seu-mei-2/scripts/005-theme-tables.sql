-- ============================================
-- DDL: Theme Tables
-- Tabelas para persistência de temas
-- ============================================

-- Tabela principal de temas de workspace
CREATE TABLE IF NOT EXISTS workspace_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  style VARCHAR(20) NOT NULL CHECK (style IN ('minimal', 'corporate', 'playful')),
  primary_color VARCHAR(7) NOT NULL CHECK (primary_color ~ '^#[A-Fa-f0-9]{6}$'),
  accent_color VARCHAR(7) NOT NULL CHECK (accent_color ~ '^#[A-Fa-f0-9]{6}$'),
  custom_colors JSONB DEFAULT NULL,
  is_dark_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Um tema por workspace
  CONSTRAINT workspace_themes_workspace_unique UNIQUE (workspace_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_workspace_themes_workspace_id ON workspace_themes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_themes_style ON workspace_themes(style);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_workspace_themes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_workspace_themes_updated_at ON workspace_themes;
CREATE TRIGGER trigger_workspace_themes_updated_at
  BEFORE UPDATE ON workspace_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_workspace_themes_updated_at();

-- Tabela de paletas customizadas do usuário
CREATE TABLE IF NOT EXISTS user_color_palettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- FK para users quando auth existir
  name VARCHAR(100) NOT NULL,
  primary_color VARCHAR(7) NOT NULL CHECK (primary_color ~ '^#[A-Fa-f0-9]{6}$'),
  accent_color VARCHAR(7) NOT NULL CHECK (accent_color ~ '^#[A-Fa-f0-9]{6}$'),
  category VARCHAR(20) DEFAULT 'custom' CHECK (category IN ('professional', 'vibrant', 'neutral', 'custom')),
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índice para busca por usuário
  CONSTRAINT user_color_palettes_unique UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_user_color_palettes_user_id ON user_color_palettes(user_id);

-- Tabela de histórico de temas (auditoria)
CREATE TABLE IF NOT EXISTS workspace_theme_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  changed_by UUID, -- FK para users quando auth existir
  previous_style VARCHAR(20),
  new_style VARCHAR(20),
  previous_primary VARCHAR(7),
  new_primary VARCHAR(7),
  previous_accent VARCHAR(7),
  new_accent VARCHAR(7),
  change_reason VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspace_theme_history_workspace_id ON workspace_theme_history(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_theme_history_created_at ON workspace_theme_history(created_at DESC);

-- Comentários
COMMENT ON TABLE workspace_themes IS 'Configuração de tema visual de cada workspace';
COMMENT ON TABLE user_color_palettes IS 'Paletas de cores customizadas salvas pelo usuário';
COMMENT ON TABLE workspace_theme_history IS 'Histórico de alterações de tema para auditoria';
