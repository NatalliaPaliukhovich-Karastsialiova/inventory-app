import type { Inventory } from "../table/InventoryColumns"
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { inventorySchema, type InventorySettingSchema } from "@/lib/inventory";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AvatarWithUpload } from "./AvatarWithUpload";

interface SettingsProps {
  inventory: Inventory | null;
  setInventory: React.Dispatch<React.SetStateAction<Inventory | null>>;
}

export function Settings({ inventory, setInventory  }: SettingsProps) {

  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const form = useForm<InventorySettingSchema>({
    resolver: zodResolver(inventorySchema(t)),
    defaultValues: {
      title: inventory?.title ?? "",
      description: inventory?.description ?? "",
      category: inventory?.category ?? "equipment",
      imageUrl: inventory?.imageUrl ?? null,
      isPublic: inventory?.isPublic ?? false,
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

  useEffect(() => {
    const subscription = form.watch((values) => {
      const timeout = setTimeout(() => {
        setInventory((prev) => prev ? { ...prev, ...values } as Inventory : prev);
      }, 300);
      return () => clearTimeout(timeout);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, setInventory]);

  return (
    <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min">
      <Form {...form}>
        <form className="flex flex-col gap-6 p-4 sm:p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-6 items-start">
            <AvatarWithUpload
              form={form}
              urlPath="imageUrl"
              handleImageUpload={handleImageUpload}
              uploading={uploading}
            />
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Inventory title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Categories</SelectLabel>
                            <SelectItem value="furniture">Furniture</SelectItem>
                            <SelectItem value="test">Furniture2</SelectItem>
                            <SelectItem value="test2">Furniture3</SelectItem>
                            <SelectItem value="test2">Furniture4</SelectItem>
                            <SelectItem value="test4">Furniture5</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="isPublic"
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="isPublic"
                      className="cursor-pointer text-sm sm:text-base"
                    >
                      Public (any authenticated user can add items)
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Markdown)</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Textarea
                        placeholder="Write description in Markdown..."
                        rows={8}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="resize-none font-mono"
                      />
                      <div className="prose prose-sm prose-stone dark:prose-invert max-w-none p-4 border rounded-md bg-muted/30 overflow-y-auto min-h-[200px]">
                        {field.value ? (
                          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                            {field.value}
                          </ReactMarkdown>
                        ) : (
                          <span className="text-muted-foreground">
                            Live preview will appear here...
                          </span>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
