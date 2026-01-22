-- ============================================
-- DDL: Live Theme Configuration Tables
-- Stores real-time theme settings and palettes
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

DO $$ BEGIN
  CREATE TYPE color_mode AS ENUM ('light', 'dark', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE color_harmony AS ENUM ('complementary', 'analogous', 'triadic', 'split-complementary', 'tetradic', 'monochromatic');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- LIVE THEME CONFIGURATIONS
-- ============================================

-- Workspace Theme Configs (extends workspace_brands)
CREATE TABLE IF NOT EXISTS workspace_theme_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Base Colors
  primary_color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#6366F1',
  accent_color VARCHAR(7) NOT NULL DEFAULT '#10B981',
  background_color VARCHAR(7) DEFAULT '#FFFFFF',
  foreground_color VARCHAR(7) DEFAULT '#0A0A0A',
  
  -- Color Mode
  color_mode color_mode NOT NULL DEFAULT 'system',
  
  -- Generated Palette (stored for performance)
  primary_palette JSONB NOT NULL DEFAULT '{}',
  secondary_palette JSONB DEFAULT '{}',
  accent_palette JSONB NOT NULL DEFAULT '{}',
  neutral_palette JSONB NOT NULL DEFAULT '{}',
  
  -- Semantic Colors
  success_color VARCHAR(7) DEFAULT '#22C55E',
  warning_color VARCHAR(7) DEFAULT '#EAB308',
  error_color VARCHAR(7) DEFAULT '#EF4444',
  info_color VARCHAR(7) DEFAULT '#3B82F6',
  
  -- Surface Colors
  card_background VARCHAR(7) DEFAULT '#FFFFFF',
  card_foreground VARCHAR(7) DEFAULT '#0A0A0A',
  popover_background VARCHAR(7) DEFAULT '#FFFFFF',
  popover_foreground VARCHAR(7) DEFAULT '#0A0A0A',
  muted_background VARCHAR(7) DEFAULT '#F5F5F5',
  muted_foreground VARCHAR(7) DEFAULT '#737373',
  
  -- Border & Ring
  border_color VARCHAR(7) DEFAULT '#E5E5E5',
  ring_color VARCHAR(7) DEFAULT '#3B82F6',
  
  -- CSS Variables Override (full control)
  css_variables JSONB NOT NULL DEFAULT '{}',
  
  -- Dark Mode Overrides
  dark_mode_overrides JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(workspace_id)
);

CREATE INDEX idx_workspace_theme_configs_workspace ON workspace_theme_configs(workspace_id);

-- ============================================
-- COLOR PALETTES (pre-generated for selection)
-- ============================================

CREATE TABLE IF NOT EXISTS color_palettes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'brand', 'nature', 'tech', 'minimal', etc.
  
  -- Base colors
  primary_color VARCHAR(7) NOT NULL,
  secondary_color VARCHAR(7),
  accent_color VARCHAR(7) NOT NULL,
  
  -- Generated shades
  primary_shades JSONB NOT NULL DEFAULT '{}',
  secondary_shades JSONB DEFAULT '{}',
  accent_shades JSONB NOT NULL DEFAULT '{}',
  
  -- Harmony type used
  harmony color_harmony,
  
  -- Metadata
  is_system BOOLEAN NOT NULL DEFAULT false,
  popularity INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_color_palettes_category ON color_palettes(category);
CREATE INDEX idx_color_palettes_system ON color_palettes(is_system) WHERE is_system = true;

-- ============================================
-- THEME HISTORY (for preview/undo)
-- ============================================

CREATE TABLE IF NOT EXISTS theme_change_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- What changed
  field_changed VARCHAR(100) NOT NULL,
  old_value VARCHAR(100),
  new_value VARCHAR(100),
  
  -- Full snapshot for complex changes
  config_snapshot JSONB,
  
  -- Who changed it
  changed_by UUID,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_theme_change_history_workspace ON theme_change_history(workspace_id, created_at DESC);

-- Limit history entries per workspace (keep last 50)
CREATE OR REPLACE FUNCTION limit_theme_change_history()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM theme_change_history
  WHERE workspace_id = NEW.workspace_id
  AND id NOT IN (
    SELECT id FROM theme_change_history
    WHERE workspace_id = NEW.workspace_id
    ORDER BY created_at DESC
    LIMIT 50
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_limit_theme_history
AFTER INSERT ON theme_change_history
FOR EACH ROW
EXECUTE FUNCTION limit_theme_change_history();

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER tr_workspace_theme_configs_updated_at 
BEFORE UPDATE ON workspace_theme_configs 
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED: Default Color Palettes
-- ============================================

INSERT INTO color_palettes (name, description, category, primary_color, secondary_color, accent_color, primary_shades, accent_shades, harmony, is_system) VALUES
(
  'Ocean Blue',
  'Professional blue palette ideal for corporate and tech',
  'tech',
  '#3B82F6',
  '#6366F1',
  '#10B981',
  '{"50":"#EFF6FF","100":"#DBEAFE","200":"#BFDBFE","300":"#93C5FD","400":"#60A5FA","500":"#3B82F6","600":"#2563EB","700":"#1D4ED8","800":"#1E40AF","900":"#1E3A8A","950":"#172554"}',
  '{"50":"#ECFDF5","100":"#D1FAE5","200":"#A7F3D0","300":"#6EE7B7","400":"#34D399","500":"#10B981","600":"#059669","700":"#047857","800":"#065F46","900":"#064E3B","950":"#022C22"}',
  'complementary',
  true
),
(
  'Emerald Green',
  'Fresh and natural green palette for eco-friendly brands',
  'nature',
  '#10B981',
  '#14B8A6',
  '#3B82F6',
  '{"50":"#ECFDF5","100":"#D1FAE5","200":"#A7F3D0","300":"#6EE7B7","400":"#34D399","500":"#10B981","600":"#059669","700":"#047857","800":"#065F46","900":"#064E3B","950":"#022C22"}',
  '{"50":"#EFF6FF","100":"#DBEAFE","200":"#BFDBFE","300":"#93C5FD","400":"#60A5FA","500":"#3B82F6","600":"#2563EB","700":"#1D4ED8","800":"#1E40AF","900":"#1E3A8A","950":"#172554"}',
  'analogous',
  true
),
(
  'Violet Purple',
  'Creative and modern purple for design agencies',
  'brand',
  '#8B5CF6',
  '#A855F7',
  '#F59E0B',
  '{"50":"#F5F3FF","100":"#EDE9FE","200":"#DDD6FE","300":"#C4B5FD","400":"#A78BFA","500":"#8B5CF6","600":"#7C3AED","700":"#6D28D9","800":"#5B21B6","900":"#4C1D95","950":"#2E1065"}',
  '{"50":"#FFFBEB","100":"#FEF3C7","200":"#FDE68A","300":"#FCD34D","400":"#FBBF24","500":"#F59E0B","600":"#D97706","700":"#B45309","800":"#92400E","900":"#78350F","950":"#451A03"}',
  'split-complementary',
  true
),
(
  'Slate Minimal',
  'Clean and minimal dark palette for professional apps',
  'minimal',
  '#18181B',
  '#27272A',
  '#3B82F6',
  '{"50":"#FAFAFA","100":"#F4F4F5","200":"#E4E4E7","300":"#D4D4D8","400":"#A1A1AA","500":"#71717A","600":"#52525B","700":"#3F3F46","800":"#27272A","900":"#18181B","950":"#09090B"}',
  '{"50":"#EFF6FF","100":"#DBEAFE","200":"#BFDBFE","300":"#93C5FD","400":"#60A5FA","500":"#3B82F6","600":"#2563EB","700":"#1D4ED8","800":"#1E40AF","900":"#1E3A8A","950":"#172554"}',
  'monochromatic',
  true
),
(
  'Sunset Orange',
  'Warm and energetic orange for startups and creative',
  'brand',
  '#F97316',
  '#FB923C',
  '#0EA5E9',
  '{"50":"#FFF7ED","100":"#FFEDD5","200":"#FED7AA","300":"#FDBA74","400":"#FB923C","500":"#F97316","600":"#EA580C","700":"#C2410C","800":"#9A3412","900":"#7C2D12","950":"#431407"}',
  '{"50":"#F0F9FF","100":"#E0F2FE","200":"#BAE6FD","300":"#7DD3FC","400":"#38BDF8","500":"#0EA5E9","600":"#0284C7","700":"#0369A1","800":"#075985","900":"#0C4A6E","950":"#082F49"}',
  'complementary',
  true
),
(
  'Rose Pink',
  'Modern and playful pink for consumer apps',
  'brand',
  '#F43F5E',
  '#FB7185',
  '#14B8A6',
  '{"50":"#FFF1F2","100":"#FFE4E6","200":"#FECDD3","300":"#FDA4AF","400":"#FB7185","500":"#F43F5E","600":"#E11D48","700":"#BE123C","800":"#9F1239","900":"#881337","950":"#4C0519"}',
  '{"50":"#F0FDFA","100":"#CCFBF1","200":"#99F6E4","300":"#5EEAD4","400":"#2DD4BF","500":"#14B8A6","600":"#0D9488","700":"#0F766E","800":"#115E59","900":"#134E4A","950":"#042F2E"}',
  'triadic',
  true
);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE workspace_theme_configs IS 'Per-workspace theme and color configuration';
COMMENT ON TABLE color_palettes IS 'Pre-defined color palettes for easy selection';
COMMENT ON TABLE theme_change_history IS 'History of theme changes for preview/undo';
