import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { AvatarWithUpload } from "./inventory/AvatarWithUpload";
import { Input } from "./ui/input";
import { profileSchema, type ProfileSchema } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";
import { updateProfile, uploadFile } from "@/services/api";
import { toast } from "sonner";
import { Label } from "./ui/label";

export function ProfileSettings() {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const user = useAuthStore((state) => state.user);

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema(t)),
    defaultValues: {
      email: user?.email || "",
      givenName: user?.givenName || "",
      familyName: user?.familyName || "",
      avatar: user?.avatar || "",
      role: user?.role || ""
    }
  });

  async function handleImageUpload(file?: File | null) {
    if (!file) return null;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      return url;
    } catch (e) {
      console.error(t("itemForm.uploadFailed"), e);
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(data: ProfileSchema) {
    try {
      await updateProfile(data);
      toast.success(t("common.profileUpdated"));
    } catch (e) {
      toast.error(t("common.error"));
    }
  }

  return (
    <div className="bg-muted/50 flex-1 rounded-xl md:min-h-min">
      <Form {...form}>
        <form
          className={"flex flex-col gap-6 p-10"}
          onSubmit={form.handleSubmit(handleSave)}
        >
          <p className="text-sm text-muted-foreground">
            {t("profile.avatarUploadHint")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-6 items-start">
            <div className="flex flex-col items-center md:items-start gap-2">
              <AvatarWithUpload
                form={form}
                urlPath={"avatar"}
                handleImageUpload={handleImageUpload}
                uploading={uploading}
              />
              {Array.isArray(user?.accounts) && user.accounts.length > 0 && (
                <>
                  <Label>{t("profile.associatedAccounts")}</Label>
                  <div className="flex gap-2 mt-1">
                    {user.accounts.some((a) => a.provider === "google") && (
                      <span
                        className={`
                          inline-flex items-center justify-center
                          w-9 h-9 rounded-full border shadow-sm
                          bg-gradient-to-br from-gray-800 to-gray-900 text-white border-gray-700
                        `}
                        title="Google"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="w-4 h-4"
                          fill="currentColor"
                        >
                          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                        </svg>
                      </span>
                    )}
                    {user.accounts.some((a) => a.provider === "github") && (
                      <span
                        className={`
                          inline-flex items-center justify-center
                          w-9 h-9 rounded-full border shadow-sm
                          bg-gradient-to-br from-gray-800 to-gray-900 text-white border-gray-700
                        `}
                        title="GitHub"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="w-4 h-4"
                          fill="currentColor"
                        >
                          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="givenName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("profile.firstName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("profile.firstName")} {...field} />
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
                    <FormLabel>{t("profile.lastName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("profile.lastName")} {...field} />
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
                    <FormLabel>{t("profile.email")}</FormLabel>
                    <FormControl>
                      <Input
                        readOnly
                        {...field}
                        className="pointer-events-none"
                      />
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
                    <FormLabel>{t("profile.role")}</FormLabel>
                    <FormControl>
                      <Input
                        readOnly
                        value={t(`common.${field.value}`)}
                        className="pointer-events-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={uploading}>
                {t("common.save")}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
