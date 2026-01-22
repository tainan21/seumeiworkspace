-- ============================================
-- SEED: Component Presets (System Defaults)
-- Pre-defined layout configurations
-- ============================================

-- Insert system presets into component_presets table
INSERT INTO component_presets (name, description, category, config, is_system, is_public) VALUES
(
  'Minimalista',
  'Layout limpo e focado com sidebar compacta e dashboard em lista',
  'minimal',
  '{
    "sidebar": {
      "variant": "compact",
      "behavior": "collapsible",
      "position": "left",
      "width": {"expanded": 200, "collapsed": 56},
      "showLogo": true,
      "showSearch": false,
      "showUserProfile": true,
      "groupNavigation": false
    },
    "topbar": {
      "variant": "barTop-B",
      "layout": "centered",
      "height": 48,
      "showSearch": true,
      "showNotifications": false,
      "showUserMenu": true,
      "showBreadcrumbs": false,
      "showQuickActions": false,
      "stickyOnScroll": true
    },
    "dashboard": {
      "type": "list",
      "columns": 1,
      "gap": 8,
      "padding": 16,
      "enableDragDrop": false,
      "enableResize": false
    },
    "footer": {
      "enabled": false,
      "height": 32,
      "showCopyright": false,
      "showVersion": false,
      "showLinks": false,
      "sticky": false
    },
    "density": "comfortable",
    "borderStyle": "subtle"
  }',
  true,
  true
),
(
  'Profissional',
  'Layout corporativo com sidebar completa e dashboard em grid',
  'corporate',
  '{
    "sidebar": {
      "variant": "standard",
      "behavior": "collapsible",
      "position": "left",
      "width": {"expanded": 240, "collapsed": 72},
      "showLogo": true,
      "showSearch": true,
      "showUserProfile": true,
      "groupNavigation": true
    },
    "topbar": {
      "variant": "barTop-A",
      "layout": "left-aligned",
      "height": 56,
      "showSearch": true,
      "showNotifications": true,
      "showUserMenu": true,
      "showBreadcrumbs": true,
      "showQuickActions": true,
      "stickyOnScroll": true
    },
    "dashboard": {
      "type": "grid",
      "columns": 12,
      "gap": 16,
      "padding": 24,
      "enableDragDrop": true,
      "enableResize": true
    },
    "footer": {
      "enabled": true,
      "height": 48,
      "showCopyright": true,
      "showVersion": true,
      "showLinks": true,
      "sticky": false
    },
    "density": "comfortable",
    "borderStyle": "standard"
  }',
  true,
  true
),
(
  'Compacto',
  'Maximo de espaco util com elementos reduzidos',
  'tech',
  '{
    "sidebar": {
      "variant": "mini",
      "behavior": "hover",
      "position": "left",
      "width": {"expanded": 180, "collapsed": 48},
      "showLogo": true,
      "showSearch": false,
      "showUserProfile": false,
      "groupNavigation": false
    },
    "topbar": {
      "variant": "barTop-C",
      "layout": "minimal",
      "height": 40,
      "showSearch": false,
      "showNotifications": true,
      "showUserMenu": true,
      "showBreadcrumbs": false,
      "showQuickActions": false,
      "stickyOnScroll": true
    },
    "dashboard": {
      "type": "masonry",
      "columns": 4,
      "gap": 8,
      "padding": 12,
      "enableDragDrop": true,
      "enableResize": false
    },
    "footer": {
      "enabled": false,
      "height": 32,
      "showCopyright": false,
      "showVersion": false,
      "showLinks": false,
      "sticky": false
    },
    "density": "compact",
    "borderStyle": "none"
  }',
  true,
  true
),
(
  'Criativo',
  'Layout diferenciado com sidebar flutuante e dashboard bento',
  'creative',
  '{
    "sidebar": {
      "variant": "floating",
      "behavior": "collapsible",
      "position": "left",
      "width": {"expanded": 220, "collapsed": 60},
      "showLogo": true,
      "showSearch": true,
      "showUserProfile": true,
      "groupNavigation": true
    },
    "topbar": {
      "variant": "barTop-B",
      "layout": "split",
      "height": 60,
      "showSearch": true,
      "showNotifications": true,
      "showUserMenu": true,
      "showBreadcrumbs": false,
      "showQuickActions": true,
      "stickyOnScroll": false
    },
    "dashboard": {
      "type": "bento",
      "columns": 8,
      "gap": 16,
      "padding": 20,
      "enableDragDrop": true,
      "enableResize": true
    },
    "footer": {
      "enabled": true,
      "height": 40,
      "showCopyright": true,
      "showVersion": false,
      "showLinks": true,
      "sticky": false
    },
    "density": "spacious",
    "borderStyle": "prominent"
  }',
  true,
  true
),
(
  'Kanban Focus',
  'Otimizado para gestao de projetos e tarefas',
  'productivity',
  '{
    "sidebar": {
      "variant": "compact",
      "behavior": "fixed",
      "position": "left",
      "width": {"expanded": 200, "collapsed": 60},
      "showLogo": true,
      "showSearch": true,
      "showUserProfile": true,
      "groupNavigation": true
    },
    "topbar": {
      "variant": "barTop-A",
      "layout": "left-aligned",
      "height": 52,
      "showSearch": true,
      "showNotifications": true,
      "showUserMenu": true,
      "showBreadcrumbs": true,
      "showQuickActions": true,
      "stickyOnScroll": true
    },
    "dashboard": {
      "type": "kanban",
      "columns": 6,
      "gap": 12,
      "padding": 16,
      "enableDragDrop": true,
      "enableResize": false
    },
    "footer": {
      "enabled": false,
      "height": 32,
      "showCopyright": false,
      "showVersion": false,
      "showLinks": false,
      "sticky": false
    },
    "density": "comfortable",
    "borderStyle": "subtle"
  }',
  true,
  true
);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE component_presets IS 'System and custom layout presets for quick configuration';
