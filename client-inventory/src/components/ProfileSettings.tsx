import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";

import { AvatarWithUpload } from "./inventory/AvatarWithUpload";
import { Input } from "./ui/input";
import { profileSchema, type ProfileSchema } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";
import { updateProfile } from "@/services/api";
import { toast } from "sonner";

export function ProfileSettings() {

  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const user = useAuthStore((state) => state.user)
  console.log(user)

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema(t)),
      defaultValues: {
        email: user?.email || '',
        givenName: user?.givenName || '',
        familyName: user?.familyName || '',
        avatar: user?.avatar || '',
        role: user?.role || ''
      }
  });

  async function handleImageUpload(file?: File | null) {
    if (!file) return null;
    setUploading(true);
    try {
      const url = `https://api.cloudinary.com/v1_1/ddkih77fi/upload`;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "inventory-app");
      try {
        const res = await fetch(url, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        return data.secure_url || null;
      } catch (e) {
        console.error("Upload failed", e);
        return null;
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(data: ProfileSchema) {
    try{
      await updateProfile(data)
      toast.success("Profile updated!")
    }catch(e) {
      toast.error("Error")
    }
  }

  return (
    <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">
      <Form {...form}>
        <form className={"flex flex-col gap-6 p-10"}
          onSubmit={form.handleSubmit(handleSave)}
        >
          <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-6 items-start">
            <AvatarWithUpload
              form={form}
              urlPath={'avatar'}
              handleImageUpload={handleImageUpload}
              uploading={uploading}
            />
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="givenName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="familyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input readOnly {...field} className="pointer-events-none"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input readOnly {...field} className="pointer-events-none"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={uploading}>Save</Button>
          </div>
        </div>
        </form>
      </Form>
    </div>
  )
}
