import { useState, useRef, useEffect, useMemo } from "react";
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
import { useTranslation } from "react-i18next";
import { useCodeListsStore } from "@/store/codeListsStore";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { generateCustomIdPreview } from "@/lib/inventory";
import type { CustomIDField } from "@/types";
import { toast } from "sonner";

const MAX_ELEMENTS = 10;

import type { CustomIdType } from "@/types";

// types moved to @/types

interface CustomIDBuilderProps {
  initialFields?: CustomIDField[];
  onChange: (fields: CustomIDField[], hasErrors: boolean) => void;
  readOnly: boolean;
}

type FieldDescription = {
  description: string;
  valuePlaceholder: string;
  valueHidden: boolean;
};

type DescriptionsMap = Record<CustomIdType, FieldDescription>;

function validateField(
  field: CustomIDField,
  descriptions: DescriptionsMap
): { isValid: boolean; error: boolean } {
  const desc = descriptions[field.type];

  if (!desc.valueHidden && !field.value?.trim()) {
    return { isValid: false, error: true };
  }

  if (!field.value) {
    return { isValid: true, error: false };
  }

  switch (field.type) {
    case "seq":
      return {
        isValid: /^D\d{0,2}$/i.test(field.value),
        error: !/^D\d{0,2}$/i.test(field.value)
      };
    case "rand20":
      return {
        isValid: /^(D6|X5)$/i.test(field.value),
        error: !/^(D6|X5)$/i.test(field.value)
      };
    case "rand32":
      return {
        isValid: /^(D10|X8)$/i.test(field.value),
        error: !/^(D10|X8)$/i.test(field.value)
      };
    case "date":
      return {
        isValid: /^[YMDHms:\-\/\.\s]*$/.test(field.value),
        error: !/^[YMDHms:\-\/\.\s]*$/.test(field.value)
      };
    default:
      return { isValid: true, error: false };
  }
}

export function CustomIDBuilder({
  initialFields = [],
  onChange,
  readOnly
}: CustomIDBuilderProps) {
  const { t } = useTranslation();
  const [fields, setFields] = useState<CustomIDField[]>(initialFields);
  const [previewId, setPreviewId] = useState<string>("");

  const descriptions: DescriptionsMap = {
    fixed: {
      description: t("customIdBuilder.fixedDescription"),
      valuePlaceholder: t("customIdBuilder.fixedValuePlaceholder"),
      valueHidden: false
    },
    guid: {
      description: t("customIdBuilder.guidDescription"),
      valuePlaceholder: "",
      valueHidden: true
    },
    date: {
      description: t("customIdBuilder.dateDescription"),
      valuePlaceholder: t("customIdBuilder.dateValuePlaceholder"),
      valueHidden: false
    },
    seq: {
      description: t("customIdBuilder.seqDescription"),
      valuePlaceholder: t("customIdBuilder.seqValuePlaceholder"),
      valueHidden: false
    },
    rand6: {
      description: t("customIdBuilder.rand6Description"),
      valuePlaceholder: t("customIdBuilder.rand6ValuePlaceholder"),
      valueHidden: true
    },
    rand9: {
      description: t("customIdBuilder.rand9Description"),
      valuePlaceholder: t("customIdBuilder.rand9ValuePlaceholder"),
      valueHidden: true
    },
    rand20: {
      description: t("customIdBuilder.rand20Description"),
      valuePlaceholder: t("customIdBuilder.rand20ValuePlaceholder"),
      valueHidden: false
    },
    rand32: {
      description: t("customIdBuilder.rand32Description"),
      valuePlaceholder: t("customIdBuilder.rand32ValuePlaceholder"),
      valueHidden: false
    }
  };

  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

  useEffect(() => {
    setPreviewId(generateCustomIdPreview(fields as CustomIDField[]));
  }, [fields]);

  const listRef = useRef<HTMLDivElement>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  function addField() {
    if (fields.length >= MAX_ELEMENTS) {
      toast.error(t("customIdBuilder.maxElementsReached"));
      return;
    }
    const newField: CustomIDField = {
      id: crypto.randomUUID(),
      type: "fixed",
      value: "",
      separator: ""
    };
    const newFields = [...fields, newField];
    setFields(newFields);
    const hasErrors = newFields.some((f) => !validateField(f, descriptions).isValid);
    onChange(newFields, hasErrors);
  }

  function updateField(id: string, updated: Partial<CustomIDField>) {
    const newFields = fields.map((f) =>
      f.id === id ? { ...f, ...updated } : f
    );
    setFields(newFields);
    const hasErrors = newFields.some(
      (f) => !validateField(f, descriptions).isValid
    );
    onChange(newFields, hasErrors);
  }

  function removeField(id: string) {
    if (fields.length <= 1) {
      toast.error(t("customIdBuilder.minElementsRequired"));
      return;
    }
    const newFields = fields.filter((f) => f.id !== id);
    setFields(newFields);
    const hasErrors = newFields.some(
      (f) => !validateField(f, descriptions).isValid
    );
    onChange(newFields, hasErrors);
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
      if (fields.length <= 1) {
        toast.error(t("customIdBuilder.minElementsRequired"));
      } else {
        removeField(active.id as string);
      }
      return;
    }
    if (active.id !== over?.id && over?.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over?.id);
      const newFields = arrayMove(fields, oldIndex, newIndex);
      setFields(newFields);
      const hasErrors = newFields.some(
        (f) => !validateField(f, descriptions).isValid
      );
      onChange(newFields, hasErrors);
    }
  }

  return (
    <div>
      <div className="mb-4 p-3 rounded-md bg-muted/50 flex gap-3 items-start">
        <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div className="text-sm text-muted-foreground flex-1">
          {t("customIdBuilder.instructions")}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              {t("customIdBuilder.help")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="max-w-lg text-sm">
            {t("customIdBuilder.helpContent")}
          </PopoverContent>
        </Popover>
      </div>
      <div className="mb-4">
        <span className="text-sm text-muted-foreground mr-2">
          {t("customIdBuilder.preview")}:
        </span>
        <Badge variant="secondary">{previewId}</Badge>
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
                descriptions={descriptions}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      {!readOnly && (
        <Button
          className="mt-4 w-full"
          onClick={addField}
          disabled={fields.length >= MAX_ELEMENTS}
        >
          {t("customIdBuilder.addElement")}
        </Button>
      )}
    </div>
  );
}

interface SortableFieldProps {
  field: CustomIDField;
  updateField: (id: string, updated: Partial<CustomIDField>) => void;
  removeField: (id: string) => void;
  readOnly: boolean;
  index: number;
  descriptions: DescriptionsMap;
}

function SortableField({
  field,
  updateField,
  readOnly,
  index,
  descriptions
}: SortableFieldProps) {
  const { t } = useTranslation();
  const { codeLists } = useCodeListsStore();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  const currentDescription = descriptions[field.type];

  const { error: isValueInvalid } = useMemo(
    () => validateField(field, descriptions),
    [field, descriptions]
  );

  return (
    <Card
      ref={setNodeRef as any}
      style={style as any}
      className="w-full p-2 mb-2"
    >
      <div className="flex items-center gap-3 ml-3">
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
          {t("customIdBuilder.element")}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Select
          value={field.type}
          onValueChange={(value) =>
            updateField(field.id, { type: value as CustomIdType, value: "" })
          }
          disabled={readOnly}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{t("customIdBuilder.elementType")}</SelectLabel>
              {codeLists?.idSeqTypes.map((idSeqType) => (
                <SelectItem key={idSeqType} value={idSeqType}>
                  {t(`codelists.idSeqTypes.${idSeqType}`)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {!currentDescription.valueHidden && (
          <div className="flex flex-col gap-1">
            <Input
              placeholder={currentDescription.valuePlaceholder}
              value={field.value}
              onChange={(e) => updateField(field.id, { value: e.target.value })}
              className="w-full"
              readOnly={readOnly || currentDescription.valueHidden}
              disabled={readOnly || currentDescription.valueHidden}
            />
            {isValueInvalid && (
              <p className="text-xs text-red-500 ml-1">
                {t(`customIdBuilder.validation.${field.type}`)}
              </p>
            )}
          </div>
        )}
        <Input
          placeholder={t("customIdBuilder.separatorPlaceholder")}
          value={field.separator}
          onChange={(e) => updateField(field.id, { separator: e.target.value })}
          className="w-full"
          readOnly={readOnly}
        />
      </div>
      <p className="text-xs text-muted-foreground ml-1">
        {currentDescription.description}
      </p>
    </Card>
  );
}
