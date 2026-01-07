"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { ACTIVITY_ACTION_LABELS, ACTIVITY_CATEGORIES } from "~/domains/workspace/activity.constants";

export interface ActivityFilters {
  search: string;
  action: string;
  category: string;
  dateRange: string;
}

interface ActivityLogFiltersProps {
  onFiltersChange: (filters: ActivityFilters) => void;
}

export function ActivityLogFilters({ onFiltersChange }: ActivityLogFiltersProps) {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [category, setCategory] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFiltersChange({ search: value, action, category, dateRange });
  };

  const handleActionChange = (value: string) => {
    setAction(value);
    onFiltersChange({ search, action: value, category, dateRange });
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    onFiltersChange({ search, action, category: value, dateRange });
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    onFiltersChange({ search, action, category, dateRange: value });
  };

  const handleClearFilters = () => {
    setSearch("");
    setAction("all");
    setCategory("all");
    setDateRange("all");
    onFiltersChange({ search: "", action: "all", category: "all", dateRange: "all" });
  };

  const hasActiveFilters = search || action !== "all" || category !== "all" || dateRange !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por descrição..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            <SelectItem value={ACTIVITY_CATEGORIES.PROJECTS}>Projetos</SelectItem>
            <SelectItem value={ACTIVITY_CATEGORIES.MEMBERS}>Membros</SelectItem>
            <SelectItem value={ACTIVITY_CATEGORIES.SETTINGS}>Configurações</SelectItem>
            <SelectItem value={ACTIVITY_CATEGORIES.BILLING}>Assinaturas</SelectItem>
            <SelectItem value={ACTIVITY_CATEGORIES.WALLET}>Carteira</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Select value={dateRange} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo período</SelectItem>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Últimos 7 dias</SelectItem>
            <SelectItem value="month">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearFilters}
            title="Limpar filtros"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Action Filter (expandido) */}
      {category !== "all" && (
        <Select value={action} onValueChange={handleActionChange}>
          <SelectTrigger className="w-full sm:w-[240px]">
            <SelectValue placeholder="Ação específica" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as ações</SelectItem>
            {Object.entries(ACTIVITY_ACTION_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

