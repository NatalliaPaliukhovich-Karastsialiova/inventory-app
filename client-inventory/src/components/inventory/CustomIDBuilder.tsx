import React, { useState, useRef } from "react";
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

type CustomIdType =
  | "fixed"
  | "rand20"
  | "rand32"
  | "rand6"
  | "rand9"
  | "date"
  | "seq"
  | "guid";

export interface CustomIDField {
  id: string;
  type: CustomIdType;
  value?: string;
  separator?: string;
}

interface CustomIDBuilderProps {
  initialFields?: CustomIDField[];
  onChange: (fields: CustomIDField[]) => void;
}

export function CustomIDBuilder({
  initialFields = [],
  onChange,
}: CustomIDBuilderProps) {
  const [fields, setFields] = useState<CustomIDField[]>(initialFields);
  const listRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  function addField() {
    const newField: CustomIDField = {
      id: crypto.randomUUID(),
      type: "fixed",
      value: "",
      separator: "",
    };
    const newFields = [...fields, newField];
    setFields(newFields);
    onChange(newFields);
  }

  function updateField(id: string, updated: Partial<CustomIDField>) {
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
        Add element
      </Button>
    </div>
  );
}

interface SortableFieldProps {
  field: CustomIDField;
  updateField: (id: string, updated: Partial<CustomIDField>) => void;
  removeField: (id: string) => void;
}

function SortableField({
  field,
  updateField,
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

      <Select
        value={field.type}
        onValueChange={(value) =>
          updateField(field.id, { type: value as CustomIdType })
        }
      >
        <SelectTrigger className="w-full sm:w-[250px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>ID Type</SelectLabel>
            <SelectItem value="fixed">Fixed</SelectItem>
            <SelectItem value="rand20">20-bit random</SelectItem>
            <SelectItem value="rand32">32-bit random</SelectItem>
            <SelectItem value="rand6">6 digits</SelectItem>
            <SelectItem value="rand9">9 digits</SelectItem>
            <SelectItem value="date">Date/time</SelectItem>
            <SelectItem value="seq">Sequence</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Input
        placeholder="Field Mask"
        value={field.value}
        onChange={(e) => updateField(field.id, { value: e.target.value })}
        className="w-full sm:flex-grow"
      />

      <Input
        placeholder="Separator"
        value={field.separator}
        onChange={(e) => updateField(field.id, { separator: e.target.value })}
        className="w-full sm:flex-grow"
      />
    </div>
  );
}
