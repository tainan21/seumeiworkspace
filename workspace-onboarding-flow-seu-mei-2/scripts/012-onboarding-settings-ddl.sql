-- ============================================
-- DDL: Onboarding Settings & Step Data Tables
-- Stores onboarding progress and step configurations
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

DO $$ BEGIN
  CREATE TYPE onboarding_step AS ENUM (
    'intro',
    'company-type', 
    'template-choice',
    'template-customize',
    'custom-builder',
    'theme-features',
    'preview',
    'create'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE onboarding_status AS ENUM ('in_progress', 'completed', 'skipped', 'abandoned');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- ONBOARDING SESSIONS
-- ============================================

-- Main onboarding session tracking
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User/workspace reference (user_id when not logged in becomes workspace creator)
  user_id UUID,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Session status
  status onboarding_status NOT NULL DEFAULT 'in_progress',
  current_step onboarding_step NOT NULL DEFAULT 'intro',
  
  -- Flow path taken
  chose_template BOOLEAN DEFAULT NULL, -- NULL until step 3
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  
  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Duration tracking
  total_duration_seconds INTEGER DEFAULT 0
);

CREATE INDEX idx_onboarding_sessions_user ON onboarding_sessions(user_id);
CREATE INDEX idx_onboarding_sessions_status ON onboarding_sessions(status);
CREATE INDEX idx_onboarding_sessions_workspace ON onboarding_sessions(workspace_id);

-- ============================================
-- STEP DATA (per-step state storage)
-- ============================================

CREATE TABLE IF NOT EXISTS onboarding_step_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES onboarding_sessions(id) ON DELETE CASCADE,
  
  step onboarding_step NOT NULL,
  step_data JSONB NOT NULL DEFAULT '{}',
  
  -- Validation state
  is_valid BOOLEAN NOT NULL DEFAULT false,
  validation_errors JSONB DEFAULT '[]',
  
  -- Timing
  entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  
  UNIQUE(session_id, step)
);

CREATE INDEX idx_onboarding_step_data_session ON onboarding_step_data(session_id);

-- ============================================
-- WORKSPACE CREATION QUEUE
-- ============================================

-- Queue for workspace creation (handles async creation)
CREATE TABLE IF NOT EXISTS workspace_creation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES onboarding_sessions(id) ON DELETE CASCADE,
  
  -- Requested configuration
  workspace_name VARCHAR(255) NOT NULL,
  workspace_slug VARCHAR(100) NOT NULL,
  full_config JSONB NOT NULL,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  
  -- Result
  created_workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  
  -- Timestamps
  queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_workspace_creation_queue_session ON workspace_creation_queue(session_id);
CREATE INDEX idx_workspace_creation_queue_status ON workspace_creation_queue(status);

-- ============================================
-- ONBOARDING ANALYTICS
-- ============================================

CREATE TABLE IF NOT EXISTS onboarding_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES onboarding_sessions(id) ON DELETE CASCADE,
  
  -- Event data
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  
  -- Context
  step onboarding_step,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_onboarding_analytics_session ON onboarding_analytics(session_id);
CREATE INDEX idx_onboarding_analytics_type ON onboarding_analytics(event_type);
CREATE INDEX idx_onboarding_analytics_step ON onboarding_analytics(step);

-- ============================================
-- STEP DEFAULT CONFIGURATIONS
-- ============================================

-- Default values for each step (seed data)
CREATE TABLE IF NOT EXISTS onboarding_step_defaults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  step onboarding_step NOT NULL UNIQUE,
  
  -- Default configuration for this step
  default_data JSONB NOT NULL DEFAULT '{}',
  
  -- Validation schema
  validation_schema JSONB DEFAULT '{}',
  
  -- UI hints
  ui_config JSONB DEFAULT '{}',
  
  -- Active status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SEED: Step Defaults
-- ============================================

INSERT INTO onboarding_step_defaults (step, default_data, validation_schema, ui_config) VALUES
(
  'intro',
  '{"workspaceName":"","workspaceSlug":""}',
  '{"workspaceName":{"required":true,"minLength":3,"maxLength":100},"workspaceSlug":{"required":true,"pattern":"^[a-z0-9-]+$"}}',
  '{"showSlugPreview":true,"autoGenerateSlug":true}'
),
(
  'company-type',
  '{"companyType":null,"selectedFeatures":[]}',
  '{"companyType":{"required":true},"selectedFeatures":{"minItems":1}}',
  '{"showFeatureDescriptions":true,"maxFeatures":10}'
),
(
  'template-choice',
  '{"choseTemplate":null,"selectedTemplateId":null}',
  '{"choseTemplate":{"required":true}}',
  '{"showTemplatePreview":true}'
),
(
  'template-customize',
  '{"templateId":null,"customizations":{}}',
  '{"templateId":{"required":true}}',
  '{"allowColorChange":true,"allowMenuReorder":true}'
),
(
  'custom-builder',
  '{"layoutConfig":{},"presetId":null}',
  '{}',
  '{"showPreview":true,"enableDragDrop":true}'
),
(
  'theme-features',
  '{"theme":"minimal","primaryColor":"#3B82F6","accentColor":"#10B981","selectedFeatures":[]}',
  '{"theme":{"required":true},"primaryColor":{"pattern":"^#[0-9A-Fa-f]{6}$"}}',
  '{"showColorPicker":true,"showThemePreview":true}'
),
(
  'preview',
  '{"approved":false}',
  '{}',
  '{"showFullPreview":true,"allowEdit":true}'
),
(
  'create',
  '{"confirmed":false,"createdWorkspaceId":null}',
  '{}',
  '{"showSummary":true,"showConfirmation":true}'
);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER tr_onboarding_step_defaults_updated_at 
BEFORE UPDATE ON onboarding_step_defaults 
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update last_activity_at on session when step data changes
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE onboarding_sessions 
  SET last_activity_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_step_data_update_session_activity
AFTER INSERT OR UPDATE ON onboarding_step_data
FOR EACH ROW
EXECUTE FUNCTION update_session_activity();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE onboarding_sessions IS 'Tracks user onboarding progress and flow';
COMMENT ON TABLE onboarding_step_data IS 'Per-step data and validation state';
COMMENT ON TABLE workspace_creation_queue IS 'Queue for async workspace creation';
COMMENT ON TABLE onboarding_analytics IS 'Analytics events during onboarding';
COMMENT ON TABLE onboarding_step_defaults IS 'Default configuration per step';
