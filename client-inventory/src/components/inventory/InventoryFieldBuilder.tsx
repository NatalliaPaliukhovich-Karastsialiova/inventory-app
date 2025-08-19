import React, { useRef, useState } from "react";
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
import { GripHorizontal, X } from "lucide-react";
import { Switch } from "../ui/switch";
import { Label } from "@radix-ui/react-label";
import { useCodeListsStore } from "@/store/codeListsStore";
import { useTranslation } from "react-i18next";

type FieldType =
  | "single_line_text"
  | "multi_line_text"
  | "number"
  | "link"
  | "boolean";

export interface CustomField {
  id: string;
  label: string;
  type: FieldType;
  description: string;
  showInTable: boolean;
}

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
  const [fields, setFields] = useState<CustomField[]>(initialFields);
  const listRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  function addField() {
    const newField: CustomField = {
      id: "",
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
            {fields.map((field) => (
              <SortableField
                key={field.id}
                field={field}
                updateField={updateField}
                removeField={removeField}
                readOnly={readOnly}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      {!readOnly && (
        <Button className="mt-4 w-full" onClick={addField}>
          Add Field
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
}

function SortableField({ field, updateField, readOnly }: SortableFieldProps) {
  const { codeLists } = useCodeListsStore();
  const { t, i18n } = useTranslation();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full"
    >
      {!readOnly && (
        <div
          className="cursor-move p-2"
          aria-label="Drag handle"
          {...attributes}
          {...listeners}
        >
          <GripHorizontal />
        </div>
      )}

      <Input
        placeholder="Field label"
        value={field.label}
        onChange={(e) => updateField(field.id, { label: e.target.value })}
        className="w-full sm:flex-grow"
        readOnly={readOnly}
      />

      <Input
        placeholder="Field Description"
        value={field.description}
        onChange={(e) => updateField(field.id, { description: e.target.value })}
        className="w-full sm:flex-grow"
        readOnly={readOnly}
      />

      <Select
        value={field.type}
        onValueChange={(value) =>
          updateField(field.id, { type: value as FieldType })
        }
        disabled={readOnly}
      >
        <SelectTrigger className="w-full sm:w-[450px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Field Type</SelectLabel>
            {codeLists?.fieldTypes.map((fieldType) => (
              <SelectItem key={fieldType} value={fieldType}>
                {t(`codelists.fieldTypes.${fieldType}`)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2 shrink-0">
        <Switch
          checked={field.showInTable}
          onCheckedChange={(value) =>
            updateField(field.id, { showInTable: value })
          }
          disabled={readOnly}
        />
        <Label htmlFor="airplane-mode">Show in Table</Label>
      </div>
    </div>
  );
}
