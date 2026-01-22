-- ============================================
-- TASKS & BACKLOG SCHEMA (Draft)
-- Domain: infrastructure
-- Status: DRAFT - Pending validation
-- ============================================

-- Note: This schema supports the task-generation domain
-- It stores proposed tasks and backlog items
-- Read-oriented with support for CRUD operations

-- ============================================
-- ENUMS
-- ============================================

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('proposed', 'approved', 'rejected', 'blocked', 'in_progress', 'done');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE task_effort AS ENUM ('small', 'medium', 'large');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE sprint_status AS ENUM ('planning', 'active', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- TEAMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366F1', -- Hex color
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_team_name_per_workspace UNIQUE (workspace_id, name)
);

CREATE INDEX IF NOT EXISTS idx_teams_workspace ON teams(workspace_id);

-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'member', -- member, lead, observer
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_team_member UNIQUE (team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- ============================================
-- SPRINTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS sprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    goal TEXT,
    status sprint_status DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_sprint_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_sprints_workspace ON sprints(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON sprints(status);

-- ============================================
-- TASKS TABLE (Main backlog storage)
-- ============================================

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    
    -- Core fields
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    domain VARCHAR(50) NOT NULL, -- Allowed domains only
    
    -- Classification
    status task_status DEFAULT 'proposed',
    priority task_priority DEFAULT 'medium',
    effort task_effort DEFAULT 'medium',
    
    -- Rationale
    value_rationale TEXT NOT NULL,
    
    -- Assignment
    assignee_id UUID,
    reporter_id UUID,
    
    -- Ordering
    backlog_order INTEGER DEFAULT 0,
    sprint_order INTEGER DEFAULT 0,
    
    -- Blocking
    blocked_reason TEXT,
    
    -- Metadata
    labels TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Generation tracking
    generated_by VARCHAR(50), -- 'manual' | 'task-generation-domain'
    generation_context_hash VARCHAR(64),
    
    CONSTRAINT valid_domain CHECK (domain IN (
        'company', 'workspace', 'page', 'theme', 'template',
        'rbac', 'onboarding', 'dashboard', 'financeiro', 'infrastructure'
    ))
);

CREATE INDEX IF NOT EXISTS idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_tasks_team ON tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_domain ON tasks(domain);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_backlog_order ON tasks(workspace_id, backlog_order);
CREATE INDEX IF NOT EXISTS idx_tasks_sprint_order ON tasks(sprint_id, sprint_order);

-- ============================================
-- TASK DEPENDENCIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT no_self_dependency CHECK (task_id != depends_on_id),
    CONSTRAINT unique_dependency UNIQUE (task_id, depends_on_id)
);

CREATE INDEX IF NOT EXISTS idx_task_deps_task ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_deps_depends_on ON task_dependencies(depends_on_id);

-- ============================================
-- TASK COMMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);

-- ============================================
-- TASK HISTORY TABLE (Audit log)
-- ============================================

CREATE TABLE IF NOT EXISTS task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID,
    action VARCHAR(50) NOT NULL, -- created, updated, moved, status_changed, etc.
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_history_task ON task_history(task_id);
CREATE INDEX IF NOT EXISTS idx_task_history_created ON task_history(created_at DESC);

-- ============================================
-- VIEWS
-- ============================================

-- Backlog view with task counts by status
CREATE OR REPLACE VIEW backlog_summary AS
SELECT 
    workspace_id,
    COUNT(*) FILTER (WHERE status = 'proposed') as proposed_count,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
    COUNT(*) FILTER (WHERE status = 'done') as done_count,
    COUNT(*) FILTER (WHERE status = 'blocked') as blocked_count,
    COUNT(*) as total_count
FROM tasks
WHERE sprint_id IS NULL
GROUP BY workspace_id;

-- Sprint board view
CREATE OR REPLACE VIEW sprint_board AS
SELECT 
    s.id as sprint_id,
    s.name as sprint_name,
    s.status as sprint_status,
    s.workspace_id,
    COUNT(t.id) as task_count,
    COUNT(*) FILTER (WHERE t.status = 'done') as completed_count,
    SUM(CASE t.effort 
        WHEN 'small' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'large' THEN 3 
        ELSE 0 END
    ) as total_effort_points
FROM sprints s
LEFT JOIN tasks t ON t.sprint_id = s.id
GROUP BY s.id, s.name, s.status, s.workspace_id;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to reorder backlog items
CREATE OR REPLACE FUNCTION reorder_backlog(
    p_workspace_id UUID,
    p_task_id UUID,
    p_new_order INTEGER
) RETURNS VOID AS $$
DECLARE
    v_old_order INTEGER;
BEGIN
    SELECT backlog_order INTO v_old_order FROM tasks WHERE id = p_task_id;
    
    IF p_new_order > v_old_order THEN
        UPDATE tasks 
        SET backlog_order = backlog_order - 1,
            updated_at = NOW()
        WHERE workspace_id = p_workspace_id 
          AND sprint_id IS NULL
          AND backlog_order > v_old_order 
          AND backlog_order <= p_new_order;
    ELSE
        UPDATE tasks 
        SET backlog_order = backlog_order + 1,
            updated_at = NOW()
        WHERE workspace_id = p_workspace_id 
          AND sprint_id IS NULL
          AND backlog_order >= p_new_order 
          AND backlog_order < v_old_order;
    END IF;
    
    UPDATE tasks 
    SET backlog_order = p_new_order,
        updated_at = NOW()
    WHERE id = p_task_id;
END;
$$ LANGUAGE plpgsql;

-- Function to move task to sprint
CREATE OR REPLACE FUNCTION move_task_to_sprint(
    p_task_id UUID,
    p_sprint_id UUID
) RETURNS VOID AS $$
DECLARE
    v_max_order INTEGER;
BEGIN
    SELECT COALESCE(MAX(sprint_order), 0) + 1 INTO v_max_order 
    FROM tasks WHERE sprint_id = p_sprint_id;
    
    UPDATE tasks 
    SET sprint_id = p_sprint_id,
        sprint_order = v_max_order,
        updated_at = NOW()
    WHERE id = p_task_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_task_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Track status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        IF NEW.status = 'in_progress' AND OLD.started_at IS NULL THEN
            NEW.started_at = NOW();
        ELSIF NEW.status = 'done' THEN
            NEW.completed_at = NOW();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_task_timestamp ON tasks;
CREATE TRIGGER trigger_update_task_timestamp
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_task_timestamp();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;

-- Policies would be added based on workspace membership
-- Example (to be customized):
-- CREATE POLICY "Users can view tasks in their workspace"
--     ON tasks FOR SELECT
--     USING (workspace_id IN (
--         SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
--     ));
