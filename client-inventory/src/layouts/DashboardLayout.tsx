import { AppSidebar } from "@/components/AppSidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/ModeToggle"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import GlobalSearch from "@/components/GlobalSearch"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
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
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 py-0 overflow-x-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
