-- ============================================
-- DDL DRAFT: Analytics Schema (Seumei)
-- PostgreSQL 14+
-- Status: DRAFT - Não aplicar até aprovação
-- ============================================

-- ============================================
-- NOTA: Este arquivo é um DRAFT para revisão.
-- Nenhuma migração será aplicada até ADR aprovado.
-- ============================================

-- ============================================
-- ENUMS PARA ANALYTICS
-- ============================================

CREATE TYPE analytics_event_type AS ENUM (
  'page_view',
  'page_interaction',
  'feature_usage',
  'navigation',
  'search',
  'error',
  'custom'
);

CREATE TYPE analytics_aggregation_period AS ENUM (
  'hourly',
  'daily',
  'weekly',
  'monthly'
);

-- ============================================
-- TABELAS DE ANALYTICS
-- ============================================

-- Eventos de Analytics (append-only)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID, -- Pode ser NULL para visitantes anônimos
  session_id VARCHAR(100), -- Para agrupar eventos da mesma sessão
  event_type analytics_event_type NOT NULL,
  event_name VARCHAR(100) NOT NULL, -- Nome específico do evento (ex: "page_view:dashboard")
  
  -- Contexto do evento
  page_id UUID, -- Referência à página (se aplicável)
  page_slug VARCHAR(100), -- Slug da página para queries rápidas
  feature_id VARCHAR(50), -- ID do feature/app (se aplicável)
  
  -- Dados do evento
  properties JSONB NOT NULL DEFAULT '{}', -- Propriedades customizadas
  
  -- Metadados técnicos
  user_agent TEXT,
  ip_hash VARCHAR(64), -- Hash do IP para privacidade
  referrer TEXT,
  device_type VARCHAR(20), -- 'desktop', 'mobile', 'tablet'
  browser VARCHAR(50),
  os VARCHAR(50),
  country_code VARCHAR(2),
  
  -- Timestamps
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Quando o evento ocorreu
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW() -- Quando foi recebido pelo servidor

  -- Nota: Não há updated_at pois eventos são append-only
);

-- Índices para queries comuns
CREATE INDEX idx_analytics_events_workspace_time ON analytics_events(workspace_id, occurred_at DESC);
CREATE INDEX idx_analytics_events_page ON analytics_events(page_id, occurred_at DESC) WHERE page_id IS NOT NULL;
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, occurred_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id, occurred_at DESC) WHERE session_id IS NOT NULL;
CREATE INDEX idx_analytics_events_type ON analytics_events(workspace_id, event_type, occurred_at DESC);
CREATE INDEX idx_analytics_events_feature ON analytics_events(workspace_id, feature_id, occurred_at DESC) WHERE feature_id IS NOT NULL;

-- Índice BRIN para particionamento temporal (mais eficiente para time-series)
CREATE INDEX idx_analytics_events_brin ON analytics_events USING BRIN (occurred_at);

-- ============================================
-- AGREGAÇÕES PRÉ-CALCULADAS
-- ============================================

-- Agregações por período (reduz queries em tempo real)
CREATE TABLE analytics_aggregations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  period analytics_aggregation_period NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Métricas agregadas
  total_page_views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  unique_sessions INTEGER NOT NULL DEFAULT 0,
  total_events INTEGER NOT NULL DEFAULT 0,
  
  -- Breakdown por tipo de evento (JSONB para flexibilidade)
  events_by_type JSONB NOT NULL DEFAULT '{}',
  
  -- Top pages (array de {page_id, page_slug, views})
  top_pages JSONB NOT NULL DEFAULT '[]',
  
  -- Top features
  top_features JSONB NOT NULL DEFAULT '[]',
  
  -- Timestamps
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint de unicidade para evitar duplicatas
  UNIQUE(workspace_id, period, period_start)
);

CREATE INDEX idx_analytics_aggregations_lookup ON analytics_aggregations(workspace_id, period, period_start DESC);

-- ============================================
-- PAGE VIEW COUNTERS (Hot path otimizado)
-- ============================================

-- Contadores rápidos para page views (atualização em tempo real)
CREATE TABLE analytics_page_view_counters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  page_id UUID NOT NULL,
  page_slug VARCHAR(100) NOT NULL,
  
  -- Contadores
  view_count_total BIGINT NOT NULL DEFAULT 0,
  view_count_today BIGINT NOT NULL DEFAULT 0,
  view_count_week BIGINT NOT NULL DEFAULT 0,
  view_count_month BIGINT NOT NULL DEFAULT 0,
  
  -- Última atualização dos contadores periódicos
  last_daily_reset TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_weekly_reset TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_monthly_reset TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(workspace_id, page_id)
);

CREATE INDEX idx_page_view_counters_workspace ON analytics_page_view_counters(workspace_id);

-- Trigger para updated_at
CREATE TRIGGER tr_analytics_page_view_counters_updated_at 
  BEFORE UPDATE ON analytics_page_view_counters 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- CONFIGURAÇÃO DE ANALYTICS POR WORKSPACE
-- ============================================

-- Configurações de analytics do workspace (extensão da tabela workspaces)
CREATE TABLE workspace_analytics_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Feature flags
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  track_page_views BOOLEAN NOT NULL DEFAULT true,
  track_feature_usage BOOLEAN NOT NULL DEFAULT true,
  track_navigation BOOLEAN NOT NULL DEFAULT false,
  track_searches BOOLEAN NOT NULL DEFAULT false,
  track_errors BOOLEAN NOT NULL DEFAULT true,
  
  -- Configurações de retenção
  retention_days INTEGER NOT NULL DEFAULT 90 CHECK (retention_days >= 7 AND retention_days <= 365),
  
  -- Configurações de privacidade
  anonymize_ip BOOLEAN NOT NULL DEFAULT true,
  respect_dnt BOOLEAN NOT NULL DEFAULT true, -- Do Not Track header
  
  -- Eventos customizados permitidos (limite por plano)
  custom_events_enabled BOOLEAN NOT NULL DEFAULT false,
  custom_events_limit INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER tr_workspace_analytics_config_updated_at 
  BEFORE UPDATE ON workspace_analytics_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE analytics_events IS 'Eventos de analytics - append-only, sem atualizações';
COMMENT ON TABLE analytics_aggregations IS 'Agregações pré-calculadas para reduzir load de queries';
COMMENT ON TABLE analytics_page_view_counters IS 'Contadores de page views otimizados para hot path';
COMMENT ON TABLE workspace_analytics_config IS 'Configurações de analytics por workspace';

COMMENT ON COLUMN analytics_events.ip_hash IS 'Hash SHA-256 do IP para privacidade (nunca armazenar IP raw)';
COMMENT ON COLUMN analytics_events.occurred_at IS 'Timestamp do cliente - quando o evento realmente aconteceu';
COMMENT ON COLUMN analytics_events.received_at IS 'Timestamp do servidor - quando recebemos o evento';

-- ============================================
-- FUNCTIONS PARA ANALYTICS (Helpers)
-- ============================================

-- Função para incrementar contador de page view
CREATE OR REPLACE FUNCTION increment_page_view_counter(
  p_workspace_id UUID,
  p_page_id UUID,
  p_page_slug VARCHAR(100)
) RETURNS void AS $$
BEGIN
  INSERT INTO analytics_page_view_counters (
    workspace_id, page_id, page_slug, view_count_total, view_count_today, view_count_week, view_count_month
  ) VALUES (
    p_workspace_id, p_page_id, p_page_slug, 1, 1, 1, 1
  )
  ON CONFLICT (workspace_id, page_id) DO UPDATE SET
    view_count_total = analytics_page_view_counters.view_count_total + 1,
    view_count_today = analytics_page_view_counters.view_count_today + 1,
    view_count_week = analytics_page_view_counters.view_count_week + 1,
    view_count_month = analytics_page_view_counters.view_count_month + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Função para resetar contadores periódicos (chamar via cron job)
CREATE OR REPLACE FUNCTION reset_periodic_page_view_counters() RETURNS void AS $$
BEGIN
  -- Reset diário
  UPDATE analytics_page_view_counters
  SET view_count_today = 0, last_daily_reset = NOW()
  WHERE last_daily_reset < CURRENT_DATE;
  
  -- Reset semanal (segundas-feiras)
  UPDATE analytics_page_view_counters
  SET view_count_week = 0, last_weekly_reset = NOW()
  WHERE EXTRACT(DOW FROM last_weekly_reset) != EXTRACT(DOW FROM NOW())
    AND EXTRACT(DOW FROM NOW()) = 1; -- Segunda-feira
  
  -- Reset mensal (dia 1)
  UPDATE analytics_page_view_counters
  SET view_count_month = 0, last_monthly_reset = NOW()
  WHERE EXTRACT(MONTH FROM last_monthly_reset) != EXTRACT(MONTH FROM NOW())
    AND EXTRACT(DAY FROM NOW()) = 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PARTICIONAMENTO (Opcional - para scale)
-- ============================================

-- NOTA: Para workspaces com alto volume, considerar particionar
-- analytics_events por mês usando:
--
-- CREATE TABLE analytics_events_y2025m01 PARTITION OF analytics_events
--   FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
--
-- Isso requer migrar para tabela particionada antes de produção.

-- ============================================
-- ESTIMATIVAS DE STORAGE
-- ============================================

/*
Estimativa por evento: ~500 bytes (incluindo índices)

Por workspace (médio):
- 1000 page views/dia = 500KB/dia = 15MB/mês
- Com retenção de 90 dias = ~45MB por workspace

Agregações:
- ~1KB por período por workspace
- 90 dias hourly + 365 days daily = ~500KB por workspace

Total estimado por workspace médio: ~50MB
*/
