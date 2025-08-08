import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { useAuthStore } from "@/store/authStore"
import DashboardLayout from "@/layouts/DashboardLayout"

export default function ProfilePage() {

  const user = useAuthStore((state) => state.user)

  return (
    <DashboardLayout>
      <div className="grid auto-rows-min gap-4 md:grid-cols-">
        <div className="bg-muted/50 aspect-video rounded-xl"><Avatar className="w-25 h-25 mb-4">
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
    </DashboardLayout>
  )
}
