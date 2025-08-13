import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Clock, Package, Users } from "lucide-react"

export function SectionCards({
  totalInventories,
  inventoriesLastDay,
  totalUsers,
}: {
  totalInventories: number
  inventoriesLastDay: number
  totalUsers: number
}) {
  const { t } = useTranslation()

  return (
    <div className="grid auto-rows-fr gap-4 md:grid-cols-3 items-stretch">
      <Card className="bg-muted/50 rounded-xl flex flex-col justify-between h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardDescription>{t("dashboard.totalInventories.title")}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalInventories}
            </CardTitle>
          </div>
          <div className="flex flex-col items-end">
            <Package className="h-6 w-6 text-primary" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t("dashboard.totalInventories.subtitle")}
          </div>
          <div className="text-muted-foreground">
            {t("dashboard.totalInventories.description")}
          </div>
        </CardFooter>
      </Card>

      <Card className="bg-muted/50 rounded-xl flex flex-col justify-between h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardDescription>{t("dashboard.inventoriesLastDay.title")}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {inventoriesLastDay}
            </CardTitle>
          </div>
          <div className="flex flex-col items-end">
            <Clock className="h-6 w-6 text-green-500" />
            <Badge className="mt-1 bg-green-500/20 text-green-700">
              {t("dashboard.inventoriesLastDay.badge")}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t("dashboard.inventoriesLastDay.subtitle")}
          </div>
          <div className="text-muted-foreground">
            {t("dashboard.inventoriesLastDay.description")}
          </div>
        </CardFooter>
      </Card>

      <Card className="bg-muted/50 rounded-xl flex flex-col justify-between h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardDescription>{t("dashboard.totalUsers.title")}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalUsers}
            </CardTitle>
          </div>
          <div className="flex flex-col items-end">
            <Users className="h-6 w-6 text-blue-500" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t("dashboard.totalUsers.subtitle")}
          </div>
          <div className="text-muted-foreground">
            {t("dashboard.totalUsers.description")}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
