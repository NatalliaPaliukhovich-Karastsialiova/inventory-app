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
  SelectValue,
} from "@/components/ui/select";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal, X } from "lucide-react";
import { Switch } from "../ui/switch";
import { Label } from "@radix-ui/react-label";

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
}

export function InventoryFieldBuilder({
  initialFields = [],
  onChange,
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
    const newFields = fields.map((f) => (f.id === id ? { ...f, ...updated } : f));
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
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
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
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      <Button className="mt-4 w-full" onClick={addField}>
        Add Field
      </Button>
    </div>
  );
}

interface SortableFieldProps {
  field: CustomField;
  updateField: (id: string, updated: Partial<CustomField>) => void;
  removeField: (id: string) => void;
}

function SortableField({
  field,
  updateField
}: SortableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
  <div
    ref={setNodeRef}
    style={style}
    className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full"
  >
    <div
      className="cursor-move p-2"
      aria-label="Drag handle"
      {...attributes}
      {...listeners}
    >
      <GripHorizontal />
    </div>

    <Input
      placeholder="Field label"
      value={field.label}
      onChange={(e) => updateField(field.id, { label: e.target.value })}
      className="w-full sm:flex-grow"
    />

    <Input
      placeholder="Field Description"
      value={field.description}
      onChange={(e) => updateField(field.id, { description: e.target.value })}
      className="w-full sm:flex-grow"
    />

    <Select
      value={field.type}
      onValueChange={(value) => updateField(field.id, { type: value as FieldType })}
    >
      <SelectTrigger className="w-full sm:w-[450px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Field Type</SelectLabel>
          <SelectItem value="single_line_text">Text</SelectItem>
          <SelectItem value="number">Number</SelectItem>
          <SelectItem value="link">Link</SelectItem>
          <SelectItem value="multi_line_text">Multi line Text</SelectItem>
          <SelectItem value="boolean">Checkbox</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>

    <div className="flex items-center gap-2 shrink-0">
      <Switch
        checked={field.showInTable}
        onCheckedChange={(value) => updateField(field.id, { showInTable: value })}
      />
      <Label htmlFor="airplane-mode">Show in Table</Label>
    </div>
  </div>
);

}
