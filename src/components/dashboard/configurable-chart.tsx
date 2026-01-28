"use client"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ChartConfig } from "@/domains/component/component.types"
import type { BrandColors } from "@/types/workspace"

interface ConfigurableChartProps {
  config: ChartConfig
  data: Record<string, unknown>[]
  colors: BrandColors
  className?: string
}

const CHART_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
]

function getSeriesColor(index: number, brandColors: BrandColors, colorScheme: string): string {
  if (colorScheme === "brand") {
    return index === 0
      ? brandColors.primary
      : index === 1
        ? brandColors.accent
        : CHART_COLORS[index % CHART_COLORS.length]
  }
  if (colorScheme === "monochrome") {
    const opacity = 1 - index * 0.15
    return `rgba(0, 0, 0, ${Math.max(0.2, opacity)})`
  }
  return CHART_COLORS[index % CHART_COLORS.length]
}

export function ConfigurableChart({ config, data, colors, className }: ConfigurableChartProps) {
  const visibleSeries = config.series.filter((s) => s.visible !== false)

  const renderChart = () => {
    switch (config.type) {
      case "line":
        return (
          <LineChart data={data}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            {visibleSeries.map((series, index) => (
              <Line
                key={series.id}
                type="monotone"
                dataKey={series.dataKey}
                name={series.name}
                stroke={series.color || getSeriesColor(index, colors, config.colorScheme)}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        )

      case "bar":
        return (
          <BarChart data={data}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            {visibleSeries.map((series, index) => (
              <Bar
                key={series.id}
                dataKey={series.dataKey}
                name={series.name}
                fill={series.color || getSeriesColor(index, colors, config.colorScheme)}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        )

      case "area":
        return (
          <AreaChart data={data}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            {visibleSeries.map((series, index) => (
              <Area
                key={series.id}
                type="monotone"
                dataKey={series.dataKey}
                name={series.name}
                stroke={series.color || getSeriesColor(index, colors, config.colorScheme)}
                fill={series.color || getSeriesColor(index, colors, config.colorScheme)}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        )

      case "pie":
      case "donut":
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={visibleSeries[0]?.dataKey || "value"}
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={config.type === "donut" ? "60%" : 0}
              outerRadius="80%"
              label
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={getSeriesColor(index, colors, config.colorScheme)} />
              ))}
            </Pie>
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
          </PieChart>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Tipo de gráfico não suportado
          </div>
        )
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{config.title}</CardTitle>
        {config.description && <CardDescription>{config.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ aspectRatio: config.aspectRatio || 16 / 9, minHeight: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
        {data.length === 0 && config.emptyState && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground">{config.emptyState.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
