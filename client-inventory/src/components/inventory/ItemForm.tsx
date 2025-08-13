import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { CustomField } from "./InventoryFieldBuilder";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createItem, updateItem } from "@/services/api";
import type { Item } from "../table/ItemColumns";

interface ItemFormProps {
  templateFields?: CustomField[];
  inventoryId: string;
  readOnly: boolean;
  item?: Item | null;
  setItem: React.Dispatch<React.SetStateAction<Item | null>>;
}

const generateSchema = (fields: CustomField[]) => {
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
  return z.object(shape);
};

export function ItemForm({ templateFields = [], inventoryId, readOnly, item, setItem }: ItemFormProps) {
  const [uploading, setUploading] = useState(false);

  const FormSchema = generateSchema(templateFields);


  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {},
  });

  useEffect(() => {
    const values = templateFields.reduce((acc, field) => {
      const existingValue = item?.fieldValues.find((fv) => fv.fieldId === field.id)?.value;

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

    form.reset(values);
  }, [item, templateFields, form]);

  async function handleImageUpload(file?: File | null) {
    if (!file) return null;
    setUploading(true);
    try {
      const url = "https://api.cloudinary.com/v1_1/ddkih77fi/upload";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "inventory-app");
      const res = await fetch(url, { method: "POST", body: formData });
      const data = await res.json();
      return data.secure_url || null;
    } catch (e) {
      console.error("Upload failed", e);
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: Record<string, any>) {
    try {
      const fieldValues = Object.entries(data).map(([fieldId, value]) => ({
        fieldId,
        value: value?.toString() || "",
      }));

      if (item) {
        const res = await updateItem(item.id, { fieldValues });
        setItem(res);
        toast.success("Item updated successfully!");
      } else {
        await createItem({ inventoryId, fieldValues }, inventoryId);
        toast.success("Item created successfully!");
        form.reset();
      }
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create item");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-6"
      >
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
                        <Input {...formField}
                          readOnly={readOnly}
                          disabled={readOnly}
                          className="w-full"
                          value={formField.value as string}/>
                      ) : field.type === "multi_line_text" ? (
                        <Textarea {...formField}
                          readOnly={readOnly}
                          disabled={readOnly}
                          className="w-full"
                          value={formField.value as string}/>
                      ) : field.type === "number" ? (
                        <Input
                          type="number"
                          readOnly={readOnly}
                          disabled={readOnly}
                          {...formField}
                          className="w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={formField.value as number | undefined}
                          onChange={(e) => formField.onChange(Number(e.target.value))}
                        />
                      ) : field.type === "boolean" ? (
                        <Switch
                          className="bg-amber-500"
                          disabled={readOnly}
                          checked={formField.value as boolean}
                          onCheckedChange={formField.onChange} />
                      ) : field.type === "link" ? (
                        <Input
                          type="file"
                          className="w-full"
                          readOnly={readOnly}
                          disabled={readOnly}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await handleImageUpload(file);
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
          <Button className="w-full" type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Save"}
          </Button>
        )}
      </form>
    </Form>
  );
}
