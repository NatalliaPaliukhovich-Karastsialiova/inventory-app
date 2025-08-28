import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Info } from "lucide-react";
import { Switch } from "../ui/switch";
import { Label } from "@radix-ui/react-label";
import { useCodeListsStore } from "@/store/codeListsStore";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FieldType, CustomField } from "@/types";

interface InventoryFieldBuilderProps {
  initialFields?: CustomField[];
  onChange: (fields: CustomField[]) => void;
  readOnly: boolean;
}

export function InventoryFieldBuilder({
  initialFields = [],
  onChange,
  readOnly
}: InventoryFieldBuilderProps) {
  const { t } = useTranslation();
  const [fields, setFields] = useState<CustomField[]>(initialFields);
  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);
  const listRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  function addField() {
    const newField: CustomField = {
      id: crypto.randomUUID(),
      label: "",
      type: "single_line_text",
      description: "",
      showInTable: false
    };
    const newFields = [...fields, newField];
    setFields(newFields);
    onChange(newFields);
  }

  function updateField(id: string, updated: Partial<CustomField>) {
    const newFields = fields.map((f) =>
      f.id === id ? { ...f, ...updated } : f
    );
    setFields(newFields);
    onChange(newFields);
  }

  function removeField(id: string) {
    const newFields = fields.filter((f) => f.id !== id);
    setFields(newFields);
    onChange(newFields);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over, delta } = event;

    const parentRect = listRef.current?.getBoundingClientRect();
    const activeRect = event.active.rect.current?.initial;

    if (!parentRect || !activeRect) return;

    const finalX = activeRect.left + delta.x;
    const finalY = activeRect.top + delta.y;

    if (
      finalY < parentRect.top - 100 ||
      finalY > parentRect.bottom + 100 ||
      finalX < parentRect.left - 100 ||
      finalX > parentRect.right + 100
    ) {
      removeField(active.id as string);
      return;
    }

    if (active.id !== over?.id && over?.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over?.id);
      const newFields = arrayMove(fields, oldIndex, newIndex);
      setFields(newFields);
      onChange(newFields);
    }
  }

  return (
    <div>
      <div className="mb-4 p-3 rounded-md bg-muted/50 flex gap-3 items-start">
        <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">
          {t("inventoryFieldBuilder.instructions")}
        </div>
      </div>
      <DndContext
        sensors={readOnly ? undefined : sensors}
        collisionDetection={closestCenter}
        onDragEnd={readOnly ? undefined : handleDragEnd}
      >
        <div ref={listRef}>
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field, index) => (
              <SortableField
                key={field.id}
                field={field}
                updateField={updateField}
                removeField={removeField}
                readOnly={readOnly}
                index={index + 1}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      {!readOnly && (
        <Button className="mt-4 w-full" onClick={addField}>
          {t("inventoryFieldBuilder.addField")}
        </Button>
      )}
    </div>
  );
}

interface SortableFieldProps {
  field: CustomField;
  updateField: (id: string, updated: Partial<CustomField>) => void;
  removeField: (id: string) => void;
  readOnly: boolean;
  index: number;
}

function SortableField({
  field,
  updateField,
  readOnly,
  index
}: SortableFieldProps) {
  const { codeLists } = useCodeListsStore();
  const { t } = useTranslation();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <Card
      ref={setNodeRef as any}
      style={style as any}
      className="w-full p-4 mb-3"
    >
      <div className="flex items-center gap-3 mb-3">
        {!readOnly && (
          <div
            className="cursor-move p-2"
            aria-label="Drag handle"
            {...attributes}
            {...listeners}
          >
            <GripVertical />
          </div>
        )}
        <Badge variant="secondary">#{index}</Badge>
        <div className="text-sm text-muted-foreground">
          {t("inventoryDetails.fields")}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          placeholder={t("inventoryFieldBuilder.fieldLabel")}
          value={field.label}
          onChange={(e) => updateField(field.id, { label: e.target.value })}
          className="w-full"
          readOnly={readOnly}
        />
        <Select
          value={field.type}
          onValueChange={(value) =>
            updateField(field.id, { type: value as FieldType })
          }
          disabled={readOnly}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{t("inventoryFieldBuilder.fieldType")}</SelectLabel>
              {codeLists?.fieldTypes.map((fieldType) => (
                <SelectItem key={fieldType} value={fieldType}>
                  {t(`codelists.fieldTypes.${fieldType}`)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          placeholder={t("inventoryFieldBuilder.fieldDescription")}
          value={field.description}
          onChange={(e) =>
            updateField(field.id, { description: e.target.value })
          }
          className="w-full"
          readOnly={readOnly}
        />
        <div className="flex items-center gap-2">
          <Switch
            className="bg-gray-900 dark:bg-blue-500"
            checked={field.showInTable}
            onCheckedChange={(value) =>
              updateField(field.id, { showInTable: value })
            }
            disabled={readOnly}
          />
          <Label htmlFor="airplane-mode">
            {t("inventoryFieldBuilder.showInTable")}
          </Label>
        </div>
      </div>
    </Card>
  );
}
