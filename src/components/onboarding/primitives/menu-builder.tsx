"use client";

import { GripVertical, Plus, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import type { MenuComponent } from "~/domains/workspace/assemble-menu";

interface MenuBuilderProps {
  items: MenuComponent[];
  onReorder: (items: MenuComponent[]) => void;
  onRemove?: (id: string) => void;
  onAdd?: () => void;
  className?: string;
}

/**
 * Item sortable do menu
 */
function SortableMenuItem({
  item,
  onRemove,
}: {
  item: MenuComponent;
  onRemove?: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg border bg-card",
        isDragging && "opacity-50"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{item.label || item.id}</p>
        {item.type === "group" && item.children && (
          <p className="text-xs text-muted-foreground">
            {item.children.length} itens
          </p>
        )}
      </div>
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id)}
          type="button"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * Builder de menu com drag and drop
 * Permite reordenar itens do menu
 */
export function MenuBuilder({
  items,
  onReorder,
  onRemove,
  onAdd,
  className,
}: MenuBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Organizar Menu</h3>
          <p className="text-sm text-muted-foreground">
            Arraste para reordenar os itens do menu
          </p>
        </div>
        {onAdd && (
          <Button variant="outline" size="sm" onClick={onAdd} type="button">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Nenhum item no menu. Adicione itens para começar.
                </p>
              </Card>
            ) : (
              items.map((item) => (
                <SortableMenuItem
                  key={item.id}
                  item={item}
                  onRemove={onRemove}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
