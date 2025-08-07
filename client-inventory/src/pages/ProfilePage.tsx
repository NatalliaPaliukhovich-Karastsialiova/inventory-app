import { AppSidebar } from "@/components/AppSidebar"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/store/authStore"

export default function ProfilePage() {

  const user = useAuthStore((state) => state.user)
  console.log(user)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-screen p-8 bg-muted/50">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <Avatar className="w-25 h-25 mb-4">
                  <AvatarImage src={user?.avatar} alt="Photo" />
                  <AvatarFallback>LA</AvatarFallback>
                </Avatar>
                <h1 className="text-3xl font-bold">{user?.fullName}</h1>
                <p className="text-lg mb-4">###</p>
                <div className="space-y-2 w-full max-w-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold">Email</span>
                    <span className="font-semibold">{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
