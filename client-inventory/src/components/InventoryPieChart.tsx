import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { useTranslation } from "react-i18next";

export function InventoryPieChart({
  totalInventories,
  inventoriesLastDay
}: {
  totalInventories: number;
  inventoriesLastDay: number;
}) {
  const { t } = useTranslation();
  const chartData = [
    {
      segment: "lastDay",
      count: inventoriesLastDay,
      fill: "var(--color-blue-500)"
    },
    {
      segment: "older",
      count: totalInventories - inventoriesLastDay,
      fill: "var(--color-blue-300)"
    }
  ];

  const chartConfig = {
    count: {
      label: t("pieChart.inventories")
    },
    lastDay: {
      label: t("pieChart.last24h")
    },
    older: {
      label: t("pieChart.older")
    }
  } satisfies ChartConfig;

  return (
    <Card className="bg-transparent border-0 shadow-none flex flex-col">
      <CardHeader className="items-start pb-0">
        <CardTitle>{t("pieChart.inventoriesDistribution")}</CardTitle>
        <CardDescription>{t("pieChart.last24hVsOlder")}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[260px]"
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
    </Card>
  );
}
