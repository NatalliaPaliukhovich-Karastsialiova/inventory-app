import type { Inventory, Tag, InventoryTag } from "@/types";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "../ui/form";
import { Input } from "../ui/input";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { inventorySchema, type InventorySettingSchema } from "@/lib/inventory";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { listTags, uploadFile } from "@/services/api";
import { useState as useReactState } from "react";
import { Button as UIButton } from "../ui/button";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { AvatarWithUpload } from "./AvatarWithUpload";
import { useCodeListsStore } from "@/store/codeListsStore";
import { Plus } from "lucide-react";

interface SettingsProps {
  inventory: Inventory | null;
  setInventory: React.Dispatch<React.SetStateAction<Inventory | null>>;
  readOnly: boolean;
  formRef?: React.Ref<any>;
}

export function Settings({
  inventory,
  setInventory,
  readOnly,
  formRef
}: SettingsProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const { codeLists } = useCodeListsStore();
  const [tagQuery, setTagQuery] = useReactState("");
  const [suggestedTags, setSuggestedTags] = useReactState<Tag[]>([]);

  const form = useForm<InventorySettingSchema>({
    resolver: zodResolver(inventorySchema(t)),
    defaultValues: {
      title: inventory?.title ?? "",
      description: inventory?.description ?? "",
      category: inventory?.category ?? "equipment",
      imageUrl: inventory?.imageUrl ?? null,
      isPublic: inventory?.isPublic ?? false
    }
  });

  useEffect(() => {
    if (formRef && typeof formRef !== "function") {
      (formRef as React.RefObject<any>).current = form;
    }
  }, [form, formRef]);

  const resetKey = inventory
    ? `${inventory.id}:${
        (inventory as any)?.version ?? (inventory as any)?.updatedAt ?? ""
      }`
    : "nil";

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

  useEffect(() => {
    if (!inventory) return;

    form.reset(
      {
        title: inventory.title ?? "",
        description: inventory.description ?? "",
        category: inventory.category ?? "equipment",
        imageUrl: inventory.imageUrl ?? null,
        isPublic: inventory.isPublic ?? false
      },
      {
        keepDefaultValues: true,
        keepDirty: false
      }
    );
  }, [resetKey]);

  useEffect(() => {
    const sub = form.watch((values) => {
      setInventory((prev) =>
        prev ? ({ ...prev, ...values } as Inventory) : prev
      );
    });
    return () => sub.unsubscribe();
  }, [form, setInventory]);

  useEffect(() => {
    let active = true;
    let handle: number | undefined;
    const q = tagQuery.trim();
    if (!q || q.length < 2) {
      setSuggestedTags([]);
    } else {
      handle = window.setTimeout(async () => {
        const tags = await listTags(q);
        if (active) setSuggestedTags(tags);
      }, 200);
    }
    return () => {
      active = false;
      if (handle) window.clearTimeout(handle);
    };
  }, [tagQuery]);

  return (
    <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min">
      <Form {...form}>
        <form className="flex flex-col gap-6 p-4 sm:p-6 md:p-10">
          {!readOnly && (
            <p className="text-sm text-muted-foreground">
              {t("inventory.settings.imageUploadHint")}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-6 items-start">
            <AvatarWithUpload
              form={form}
              urlPath="imageUrl"
              handleImageUpload={handleImageUpload}
              uploading={uploading}
              readOnly={readOnly}
            />
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("inventory.settings.title")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "inventory.settings.inventoryTitlePlaceholder"
                        )}
                        {...field}
                        readOnly={readOnly}
                      />
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
                    <FormLabel>{t("inventory.settings.category")}</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={readOnly}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t(
                              "inventory.settings.selectCategoryPlaceholder"
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>
                              {t("inventory.settings.categories")}
                            </SelectLabel>
                            {codeLists?.categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {t(`codelists.categories.${cat}`)}
                              </SelectItem>
                            ))}
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
                        disabled={readOnly}
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="isPublic"
                      className="cursor-pointer text-sm sm:text-base"
                    >
                      {t("inventory.settings.public")}
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid gap-3">
            {!readOnly && (
              <div>
                <FormLabel>{t("inventory.settings.tags")}</FormLabel>
                <div className="flex gap-2 items-center mt-2">
                  <Input
                    placeholder={t("inventory.settings.tagsPlaceholder")}
                    value={tagQuery}
                    onChange={(e) => setTagQuery(e.target.value)}
                    readOnly={readOnly}
                  />
                  <UIButton
                    type="button"
                    disabled={!tagQuery.trim()}
                    onClick={() => {
                      const t: Tag = { id: undefined as any, name: tagQuery.trim() } as any;
                      setInventory((prev) =>
                        prev
                          ? ({
                              ...prev,
                              tags: [
                                ...((prev?.tags ?? []) as InventoryTag[]),
                                { tag: t }
                              ]
                            } as Inventory)
                          : prev
                      );
                      setTagQuery("");
                      setSuggestedTags([]);
                    }}
                  >
                    <Plus />
                    {t("inventory.settings.tagsCreate")}
                  </UIButton>
                </div>
                {suggestedTags.length > 0 && (
                  <div className="border rounded-md mt-2 divide-y">
                    {suggestedTags.map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        className="w-full text-left px-3 py-2 hover:bg-accent"
                        onClick={() => {
                          const currentTags = (inventory?.tags ?? []).map((x) => x.tag);
                          if (
                            currentTags.some((s) => s.id === t.id || s.name === t.name)
                          )
                            return;
                          setInventory((prev) =>
                            prev
                              ? ({
                                  ...prev,
                                  tags: [
                                    ...((prev?.tags ?? []) as InventoryTag[]),
                                    { tag: t }
                                  ]
                                } as Inventory)
                              : prev
                          );
                          setTagQuery("");
                          setSuggestedTags([]);
                        }}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
                {(inventory?.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(inventory?.tags ?? []).map((t) => (
                      <span
                        key={(t.tag.id as any) ?? t.tag.name}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs"
                      >
                        {t.tag.name}
                        {!readOnly && (
                          <button
                            type="button"
                            className="ml-1 text-xs text-red-500 hover:text-red-700"
                            onClick={() => {
                              setInventory((prev) =>
                                prev
                                  ? ({
                                      ...prev,
                                      tags: (prev?.tags ?? []).filter(
                                        (x) =>
                                          x.tag.id !== t.tag.id &&
                                          x.tag.name !== t.tag.name
                                      )
                                    } as Inventory)
                                  : prev
                              );
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("inventory.settings.descriptionMarkdown")}
                  </FormLabel>
                  <FormControl>
                    <div
                      className={
                        readOnly
                          ? "grid grid-cols-1"
                          : "grid grid-cols-1 md:grid-cols-2 gap-4"
                      }
                    >
                      {!readOnly && (
                        <Textarea
                          placeholder={t(
                            "inventory.settings.writeDescriptionPlaceholder"
                          )}
                          rows={8}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="resize-none font-mono"
                        />
                      )}
                      <div className="prose prose-sm prose-stone dark:prose-invert max-w-none p-4 border rounded-md bg-muted/30 overflow-y-auto min-h-[200px]">
                        {field.value ? (
                          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                            {field.value}
                          </ReactMarkdown>
                        ) : (
                          <span className="text-muted-foreground">
                            {t("inventory.settings.livePreview")}
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
