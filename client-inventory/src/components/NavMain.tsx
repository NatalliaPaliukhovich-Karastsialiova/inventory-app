import { type LucideIcon } from "lucide-react"
import { useNavigate } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "react-i18next";

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    access: string
  }[]
}) {

  const { t } = useTranslation();

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user)

  let filteredItems = items;
  if(user?.role !== 'admin'){
    filteredItems = items.filter(item =>
      item.access === 'user'
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("menu.platform")}</SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton tooltip={t(`menu.${item.title}`)}
              onClick={() => navigate(item.url)}
            >
              {item.icon && <item.icon />}
              <span>{t(`menu.${item.title}`)}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
