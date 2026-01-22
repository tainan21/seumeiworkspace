/**
 * Componente de menu (estrutura DnD)
 */
export interface MenuComponent {
  id: string;
  type: "item" | "group" | "divider";
  label?: string;
  icon?: string;
  children?: MenuComponent[];
}

/**
 * Item de menu final (estrutura ordenada)
 */
export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  order: number;
  parentId?: string;
  route: string;
}

/**
 * Itens de sistema que sempre devem aparecer (não dependem de apps)
 */
const SYSTEM_ITEMS = ["dashboard", "settings"];

/**
 * Verifica se um item é de sistema (sempre disponível)
 */
function isSystemItem(itemId: string): boolean {
  return SYSTEM_ITEMS.includes(itemId);
}

/**
 * Gera label padrão baseado no ID
 */
function generateLabel(itemId: string): string {
  const labels: Record<string, string> = {
    dashboard: "Dashboard",
    projects: "Projetos",
    docs: "Documentos",
    people: "Pessoas",
    finances: "Financeiro",
    calendar: "Agenda",
    analytics: "Analytics",
    apps: "Apps",
    settings: "Configurações",
  };

  return labels[itemId] || itemId.charAt(0).toUpperCase() + itemId.slice(1);
}

/**
 * Gera ícone padrão baseado no ID
 */
function getDefaultIcon(itemId: string): string {
  const icons: Record<string, string> = {
    dashboard: "LayoutDashboard",
    projects: "FolderKanban",
    docs: "FileText",
    people: "Users",
    finances: "DollarSign",
    calendar: "Calendar",
    analytics: "BarChart3",
    apps: "Package",
    settings: "Settings",
  };

  return icons[itemId] || "Circle";
}

/**
 * Gera rota baseado no ID
 */
function generateRoute(itemId: string): string {
  // Rotas especiais
  if (itemId === "dashboard") {
    return "/";
  }

  // Rotas baseadas no ID
  return `/${itemId}`;
}

/**
 * Extrai o app ID de um item (ex: 'projects-list' -> 'projects')
 */
function extractAppId(itemId: string): string {
  return itemId.split("-")[0];
}

/**
 * Monta menu ordenado a partir de componentes DnD
 * 
 * @param componentsSelected - Componentes selecionados pelo usuário (estrutura DnD)
 * @param appsEnabled - Lista de apps habilitados no workspace
 * @returns Array de MenuItem ordenado
 */
export function assembleMenu(
  componentsSelected: MenuComponent[],
  appsEnabled: string[]
): MenuItem[] {
  const menuItems: MenuItem[] = [];
  let order = 0;

  /**
   * Processa um componente recursivamente
   */
  function processComponent(
    component: MenuComponent,
    parentId?: string
  ): void {
    // Pular dividers
    if (component.type === "divider") {
      return;
    }

    // Verificar se o app está habilitado (para itens de app)
    if (component.type === "item") {
      const appId = extractAppId(component.id);
      if (
        !isSystemItem(component.id) &&
        !appsEnabled.includes(appId) &&
        !appsEnabled.includes(component.id)
      ) {
        return; // Pular itens de apps desabilitados
      }
    }

    // Criar item de menu
    const menuItem: MenuItem = {
      id: component.id,
      label: component.label || generateLabel(component.id),
      icon: component.icon || getDefaultIcon(component.id),
      order: order++,
      parentId,
      route: generateRoute(component.id),
    };

    menuItems.push(menuItem);

    // Processar filhos recursivamente
    if (component.children && component.children.length > 0) {
      component.children.forEach((child) =>
        processComponent(child, component.id)
      );
    }
  }

  // Processar todos os componentes
  componentsSelected.forEach((c) => processComponent(c));

  return menuItems;
}

/**
 * Ordena menu items por ordem
 */
export function sortMenuItems(items: MenuItem[]): MenuItem[] {
  return [...items].sort((a, b) => a.order - b.order);
}

/**
 * Agrupa menu items por parentId
 */
export function groupMenuItems(items: MenuItem[]): {
  root: MenuItem[];
  children: Record<string, MenuItem[]>;
} {
  const root: MenuItem[] = [];
  const children: Record<string, MenuItem[]> = {};

  items.forEach((item) => {
    if (item.parentId) {
      if (!children[item.parentId]) {
        children[item.parentId] = [];
      }
      children[item.parentId].push(item);
    } else {
      root.push(item);
    }
  });

  return { root, children };
}
