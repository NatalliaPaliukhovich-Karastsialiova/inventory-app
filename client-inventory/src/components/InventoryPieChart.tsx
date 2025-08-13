import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export function InventoryPieChart({
  totalInventories,
  inventoriesLastDay,
}: {
  totalInventories: number
  inventoriesLastDay: number
}) {
  const chartData = [
    { segment: "lastDay", count: inventoriesLastDay, fill: "var(--color-blue-500)" },
    { segment: "older", count: totalInventories - inventoriesLastDay, fill: "var(--color-blue-300)" },
  ]

  const chartConfig = {
    count: {
      label: "Inventories",
    },
    lastDay: {
      label: "Last 24h",
    },
    older: {
      label: "Older",
    },
  } satisfies ChartConfig

  return (
    <Card className="bg-muted/50 flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Inventories Distribution</CardTitle>
        <CardDescription>Last 24h vs older inventories</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="segment"
              stroke="0"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Showing share of inventories created in the last day
        </div>
      </CardFooter>
    </Card>
  )
}
