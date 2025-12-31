# Features Components - Guia Rápido

## Importações

```tsx
// Componentes compartilhados
import { PageHeader, EmptyState, LoadingState } from "~/components/features/shared";

// Dashboard
import { DashboardOverview } from "~/components/features/dashboard";
```

## Exemplos de Uso

### PageHeader
```tsx
<PageHeader
  title="Clientes"
  description="Gerencie seus clientes cadastrados"
  action={{
    label: "Novo Cliente",
    onClick: () => router.push("/customers/new"),
    icon: Plus
  }}
/>
```

### EmptyState
```tsx
<EmptyState
  icon={Users}
  title="Nenhum cliente encontrado"
  description="Comece criando seu primeiro cliente para começar"
  action={{
    label: "Criar Cliente",
    onClick: () => router.push("/customers/new")
  }}
/>
```

### LoadingState
```tsx
// Cards
<LoadingState variant="card" count={6} />

// Lista
<LoadingState variant="list" count={5} />

// Tabela
<LoadingState variant="table" count={10} />
```

### DashboardOverview
```tsx
<DashboardOverview
  stats={[
    {
      title: "Total de Clientes",
      value: "150",
      icon: Users,
      trend: { value: 12, isPositive: true },
      description: "vs mês anterior"
    },
    {
      title: "Receita Mensal",
      value: "R$ 45.000",
      icon: DollarSign,
      trend: { value: 8, isPositive: true }
    }
  ]}
/>
```

