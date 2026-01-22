-- ============================================
-- TASKS & BACKLOG SEED DATA
-- SAFE for Supabase + Neon
-- ============================================

-- ======================================================
-- BASE WORKSPACE
-- ======================================================
WITH base_workspace AS (
  INSERT INTO workspaces (
    id,
    slug,
    name,
    owner_id,
    created_by
  )
  VALUES (
    gen_random_uuid(),
    'default-workspace',
    'Default Workspace',
    gen_random_uuid(),
    gen_random_uuid()
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id
),
workspace AS (
  SELECT id FROM base_workspace
  UNION ALL
  SELECT id FROM workspaces WHERE slug = 'default-workspace'
  LIMIT 1
)

-- ======================================================
-- TEAMS
-- ======================================================
INSERT INTO teams (id, workspace_id, name, description, color)
SELECT
  gen_random_uuid(),
  w.id,
  t.name,
  t.description,
  t.color
FROM workspace w
CROSS JOIN (
  VALUES
    ('Platform', 'Core platform and infrastructure team', '#6366F1'),
    ('Frontend', 'UI/UX and frontend development', '#10B981'),
    ('Backend', 'API and backend services', '#F59E0B')
) AS t(name, description, color)
ON CONFLICT DO NOTHING;

-- ======================================================
-- SPRINTS
-- ======================================================
WITH workspace AS (
  SELECT id FROM workspaces WHERE slug = 'default-workspace' LIMIT 1
)
INSERT INTO sprints (
  id,
  workspace_id,
  name,
  goal,
  status,
  start_date,
  end_date
)
SELECT
  gen_random_uuid(),
  w.id,
  s.name,
  s.goal,
  s.status::sprint_status,
  s.start_date,
  s.end_date
FROM workspace w
CROSS JOIN (
  VALUES
    ('Sprint 1 - Foundation', 'Establish core analytics infrastructure', 'completed', DATE '2025-12-01', DATE '2025-12-14'),
    ('Sprint 2 - Data Layer', 'Implement data persistence and tracking', 'active', DATE '2025-12-15', DATE '2025-12-28'),
    ('Sprint 3 - Dashboard', 'Build analytics dashboard UI', 'planning', DATE '2025-12-29', DATE '2026-01-11')
) AS s(name, goal, status, start_date, end_date)
ON CONFLICT DO NOTHING;

-- ======================================================
-- TASKS (BACKLOG)
-- ======================================================
WITH workspace AS (
  SELECT id FROM workspaces WHERE slug = 'default-workspace' LIMIT 1
)
INSERT INTO tasks (
  id,
  workspace_id,
  title,
  description,
  domain,
  status,
  priority,
  effort,
  value_rationale,
  backlog_order,
  generated_by,
  labels
)
SELECT
  gen_random_uuid(),
  w.id,
  t.title,
  t.description,
  t.domain,
  t.status::task_status,
  t.priority::task_priority,
  t.effort::task_effort,
  t.value_rationale,
  t.backlog_order,
  t.generated_by,
  t.labels
FROM workspace w
CROSS JOIN (
  VALUES
    (
      'Apply analytics database schema',
      'Execute the analytics DDL script in production.',
      'infrastructure',
      'proposed',
      'high',
      'medium',
      'Analytics data layer must exist before tracking.',
      1,
      'task-generation-domain',
      ARRAY['database','analytics']
    ),
    (
      'Build analytics dashboard page',
      'Create dashboard UI with charts and filters.',
      'dashboard',
      'blocked',
      'medium',
      'large',
      'Users need visual access to analytics data.',
      2,
      'task-generation-domain',
      ARRAY['ui','analytics']
    )
) AS t(
  title,
  description,
  domain,
  status,
  priority,
  effort,
  value_rationale,
  backlog_order,
  generated_by,
  labels
)
ON CONFLICT DO NOTHING;

-- ======================================================
-- TASK COMMENTS
-- ======================================================
INSERT INTO task_comments (
  id,
  task_id,
  user_id,
  content
)
SELECT
  gen_random_uuid(),
  t.id,
  gen_random_uuid(),
  'Seeded comment for task'
FROM tasks t
ORDER BY created_at DESC
LIMIT 3
ON CONFLICT DO NOTHING;
