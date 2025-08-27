import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { CustomField } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  createItem,
  updateItem,
  fetchItemById,
  uploadFile
} from "@/services/api";
import type { Item, CustomIDField } from "@/types";
import { useTranslation } from "react-i18next";
import ConflictDialog from "@/components/ConflictDialog";
import { validateCustomId, generateCustomIdPreview } from "@/lib/inventory";

interface ItemFormProps {
  templateFields?: CustomField[];
  inventoryId: string;
  readOnly: boolean;
  item?: Item | null;
  setItem: React.Dispatch<React.SetStateAction<Item | null>>;
  enableAutoSave?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  onSavingChange?: (saving: boolean) => void;
  customId?: string;
  customIdElements: CustomIDField[];
}

const generateSchema = (
  fields: CustomField[],
  customIdElements: CustomIDField[]
) => {
  const shape: Record<string, z.ZodTypeAny> = {};
  fields.forEach((field) => {
    switch (field.type) {
      case "single_line_text":
      case "multi_line_text":
      case "link":
        shape[field.id] = z.string().optional();
        break;
      case "number":
        shape[field.id] = z
          .union([z.number(), z.string().regex(/^\d*$/)])
          .optional();
        break;
      case "boolean":
        shape[field.id] = z.boolean().optional();
        break;
      default:
        shape[field.id] = z.any().optional();
    }
  });
  return z.object(shape).extend({
    customId: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          return validateCustomId(val, customIdElements);
        },
        {
          message: "Custom ID does not match the required format"
        }
      )
  });
};

export function ItemForm({
  templateFields = [],
  inventoryId,
  readOnly,
  item,
  setItem,
  enableAutoSave = false,
  onDirtyChange,
  onSavingChange,
  customIdElements
}: ItemFormProps) {
  const [uploading, setUploading] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(generateSchema(templateFields, customIdElements)),
    defaultValues: {
      customId: item?.customId || ""
    },
    mode: "onChange"
  });

  useEffect(() => {
    form.reset({ customId: item?.customId || "", ...form.getValues() });
    form.control._options.resolver = zodResolver(
      generateSchema(templateFields, customIdElements)
    );
  }, [customIdElements]);

  useEffect(() => {
    const values = templateFields.reduce((acc, field) => {
      const existingValue = item?.fieldValues.find(
        (fv) => fv.fieldId === field.id
      )?.value;

      switch (field.type) {
        case "boolean":
          acc[field.id] = String(existingValue) === "true";
          break;
        case "number":
          acc[field.id] = existingValue ? Number(existingValue) : "";
          break;
        default:
          acc[field.id] = existingValue ?? "";
      }
      return acc;
    }, {} as Record<string, any>);

    form.reset({ ...values, customId: item?.customId || "" });
  }, [item, templateFields, form]);

  useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

  async function silentAutoSave() {
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }
    const values = form.getValues();
    const fieldValues = Object.entries(values).map(([fieldId, value]) => ({
      fieldId,
      value: value?.toString() || ""
    }));
    if (item) {
      const res = await updateItem(item.id, {
        fieldValues,
        customId: values.customId,
        version: (item as any).version
      });
      setItem(res);
      form.reset(values);
    }
  }

  useEffect(() => {
    let timeoutId: number | undefined;
    let canceled = false;

    function scheduleNext() {
      if (canceled) return;
      const delay = 7000 + Math.floor(Math.random() * 3000);
      timeoutId = window.setTimeout(async () => {
        try {
          if (
            enableAutoSave &&
            !readOnly &&
            !uploading &&
            item?.id &&
            form.formState.isDirty &&
            !isAutoSaving
          ) {
            setIsAutoSaving(true);
            onSavingChange?.(true);
            await silentAutoSave();
          }
        } finally {
          setIsAutoSaving(false);
          onSavingChange?.(false);
          scheduleNext();
        }
      }, delay);
    }

    scheduleNext();
    return () => {
      canceled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [enableAutoSave, readOnly, uploading, item?.id]);

  async function handleFileUpload(file?: File | null) {
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

  async function onSubmit(data: Record<string, any>) {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const { customId, ...otherFields } = data;
      const fieldValues = Object.entries(otherFields).map(
        ([fieldId, value]) => ({
          fieldId,
          value: value?.toString() || ""
        })
      );

      if (item) {
        try {
          const res = await updateItem(item.id, {
            fieldValues,
            customId,
            version: (item as any).version
          });
          setItem(res);
          toast.success(t("itemForm.itemUpdatedSuccessfully"));
        } catch (e: any) {
          if (e?.response?.status === 409) {
            setConflictOpen(true);
            return;
          }
          throw e;
        }
      } else {
        await createItem({ inventoryId, fieldValues, customId }, inventoryId);
        toast.success(t("itemForm.itemCreatedSuccessfully"));
        navigate(`/inventories/${inventoryId}`);
      }
      setIsSubmitting(false);
      form.reset();
    } catch (error) {
      setIsSubmitting(false);
      console.error(error);
      toast.error(t("itemForm.failedToCreateItem"));
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const target = e.target as HTMLElement;
            if (target && target.tagName !== "TEXTAREA") {
              e.preventDefault();
            }
          }
        }}
        className="w-full space-y-6"
      >
        {item && (
          <FormField
            control={form.control}
            name="customId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("itemForm.customIdLabel")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    readOnly={readOnly}
                    disabled={readOnly}
                    className="w-full"
                    value={field.value as string}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground mt-1">
                  Preview: {generateCustomIdPreview(customIdElements)}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {templateFields.map((field) => (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {field.type === "single_line_text" ? (
                        <Input
                          {...formField}
                          readOnly={readOnly}
                          disabled={readOnly}
                          className="w-full"
                          value={formField.value as string}
                        />
                      ) : field.type === "multi_line_text" ? (
                        <Textarea
                          {...formField}
                          readOnly={readOnly}
                          disabled={readOnly}
                          className="w-full"
                          value={formField.value as string}
                        />
                      ) : field.type === "number" ? (
                        <Input
                          type="number"
                          readOnly={readOnly}
                          disabled={readOnly}
                          {...formField}
                          className="w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={formField.value as number | undefined}
                          onChange={(e) =>
                            formField.onChange(Number(e.target.value))
                          }
                        />
                      ) : field.type === "boolean" ? (
                        <Switch
                          className="bg-amber-500"
                          disabled={readOnly}
                          checked={formField.value as boolean}
                          onCheckedChange={formField.onChange}
                        />
                      ) : field.type === "link" ? (
                        <Input
                          type="file"
                          className="w-full"
                          readOnly={readOnly}
                          disabled={readOnly}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await handleFileUpload(file);
                            if (url) formField.onChange(url);
                          }}
                        />
                      ) : null}
                    </TooltipTrigger>
                    <TooltipContent side="top" align="start">
                      <p>{field.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        {!readOnly && (
          <Button
            className="w-full"
            type="submit"
            disabled={uploading || isSubmitting}
          >
            {uploading
              ? t("itemForm.uploading")
              : isSubmitting
              ? t("common.saving")
              : t("common.save")}
          </Button>
        )}
      </form>

      <ConflictDialog
        open={conflictOpen}
        onClose={() => setConflictOpen(false)}
        onReload={async () => {
          try {
            if (!item) return;
            const latest = await fetchItemById(item.id);
            setItem(latest);
            const values = templateFields.reduce((acc, field) => {
              const existingValue = latest?.fieldValues.find(
                (fv: { fieldId: string }) => fv.fieldId === field.id
              )?.value;
              switch (field.type) {
                case "boolean":
                  acc[field.id] = String(existingValue) === "true";
                  break;
                case "number":
                  acc[field.id] = existingValue ? Number(existingValue) : "";
                  break;
                default:
                  acc[field.id] = existingValue ?? "";
              }
              return acc;
            }, {} as Record<string, any>);
            form.reset({ ...values, customId: latest?.customId || "" });
            setConflictOpen(false);
          } catch {}
        }}
      />
    </Form>
  );
}
