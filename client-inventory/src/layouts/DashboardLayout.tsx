import { AppSidebar } from "@/components/AppSidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/ModeToggle"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import GlobalSearch from "@/components/GlobalSearch"
import { HelpCircle } from "lucide-react"
import { useState } from "react"
import { SupportTicketDialog } from "@/components/SupportTicketDialog"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const [ticketOpen, setTicketOpen] = useState(false);
  const currentUrl = window.location.origin + location.pathname + location.search + location.hash;
  const inventoryMatch = location.pathname.match(/\/inventories\/([^/]+)/);
  const inventoryId = inventoryMatch ? inventoryMatch[1] : null;

  const adminEmails: string[] = [];
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex-1 flex flex-col min-w-0">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center justify-between gap-2 px-4 w-full">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />

            </div>
            <div className="flex items-center gap-1">
              <Separator orientation="vertical" className="mr-2 h-4" />
              <GlobalSearch />
              <ModeToggle />
              <LanguageSwitcher />
              <Button variant="outline" size="icon" onClick={() => setTicketOpen(true)}>
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 py-0 overflow-x-hidden">
          {children}
          <div className="text-center text-xs text-muted-foreground py-4">
            <a className="underline cursor-pointer" onClick={() => setTicketOpen(true)}>{t("ticket.createLink")}</a>
          </div>
          <SupportTicketDialog
            open={ticketOpen}
            onOpenChange={setTicketOpen}
            inventoryId={inventoryId}
            adminEmails={adminEmails}
            currentUrl={currentUrl}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
