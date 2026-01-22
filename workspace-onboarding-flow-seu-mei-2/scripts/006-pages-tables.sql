-- ============================================
-- PAGES TABLES - Gerenciamento de páginas
-- ============================================

-- ======================================================
-- ENUMS
-- ======================================================
CREATE TYPE page_visibility AS ENUM (
  'public',
  'private',
  'draft'
);

CREATE TYPE page_layout AS ENUM (
  'default',
  'full-width',
  'sidebar-left',
  'sidebar-right',
  'dashboard'
);

-- ======================================================
-- FUNÇÃO updated_at
-- ======================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ======================================================
-- TABELA: PAGES
-- ======================================================
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,

  slug VARCHAR(100),
  title VARCHAR(200),
  description TEXT,
  content TEXT,

  visibility page_visibility DEFAULT 'draft',
  layout page_layout DEFAULT 'default',

  parent_id UUID REFERENCES pages(id) ON DELETE SET NULL,

  order_index INTEGER DEFAULT 0,
  icon VARCHAR(50),

  custom_meta JSONB,
  permissions JSONB,

  created_by UUID,
  updated_by UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT unique_slug_per_workspace
    UNIQUE (workspace_id, slug),

  CONSTRAINT check_order_range
    CHECK (order_index >= 0 AND order_index < 10000),

  CONSTRAINT check_not_self_parent
    CHECK (parent_id IS NULL OR id <> parent_id)
);

-- ======================================================
-- ÍNDICES
-- ======================================================
CREATE INDEX idx_pages_workspace
  ON pages(workspace_id);

CREATE INDEX idx_pages_slug
  ON pages(workspace_id, slug);

CREATE INDEX idx_pages_parent
  ON pages(parent_id);

CREATE INDEX idx_pages_visibility
  ON pages(workspace_id, visibility);

CREATE INDEX idx_pages_created_by
  ON pages(created_by);

CREATE INDEX idx_pages_search
  ON pages
  USING gin (
    to_tsvector(
      'portuguese',
      title || ' ' || COALESCE(description, '')
    )
  );

-- ======================================================
-- TRIGGER
-- ======================================================
CREATE TRIGGER pages_updated_at
BEFORE UPDATE ON pages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ======================================================
-- PAGE VERSIONS
-- ======================================================
CREATE TABLE page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  version_number INTEGER,
  title VARCHAR(200),
  description TEXT,
  content TEXT,
  visibility page_visibility,
  layout page_layout,
  custom_meta JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_page_version UNIQUE (page_id, version_number)
);

CREATE INDEX idx_page_versions_page
  ON page_versions(page_id, version_number DESC);

-- ======================================================
-- PAGE COMMENTS
-- ======================================================
CREATE TABLE page_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES page_comments(id) ON DELETE CASCADE,
  user_id UUID,
  content TEXT,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_page_comments_page
  ON page_comments(page_id);

CREATE INDEX idx_page_comments_user
  ON page_comments(user_id);

-- ======================================================
-- FEATURE SEED (SAFE)
-- ======================================================
INSERT INTO features (slug, name, description, icon, category, is_active)
SELECT
  'pages',
  'Páginas',
  'Sistema de páginas e documentação',
  'FileText',
  'content',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM features WHERE slug = 'pages'
);
