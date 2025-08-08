import * as React from "react"
import {
  BookOpen,
  Bot,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/NavMain"
import { NavUser } from "@/components/NavUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { AppLogo } from "./AppLogo"

const data = {
  navMain: [
    {
      title: "home",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      access: 'user'
    },
    {
      title: "templates",
      url: "#",
      icon: Bot,
      access: 'user'
    },
    {
      title: "inventories",
      url: "#",
      icon: BookOpen,
      access: 'user'
    },
    {
      title: "adminConsole",
      url: "/admin",
      icon: Settings2,
      access: 'admin'
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
