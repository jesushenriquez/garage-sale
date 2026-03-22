"use client";

import { Plus, Trash2 } from "lucide-react";
import type { PickupScheduleBlock } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PickupScheduleEditorProps {
  value: PickupScheduleBlock[];
  onChange: (blocks: PickupScheduleBlock[]) => void;
}

export function PickupScheduleEditor({ value, onChange }: PickupScheduleEditorProps) {
  const inputClass =
    "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent";
  const labelClass = "block text-xs font-medium text-gray-600 mb-1";

  const addBlock = () => {
    onChange([...value, { days: "", start_time: "", end_time: "" }]);
  };

  const updateBlock = (index: number, field: keyof PickupScheduleBlock, fieldValue: string) => {
    const updated = value.map((block, i) =>
      i === index ? { ...block, [field]: fieldValue } : block
    );
    onChange(updated);
  };

  const removeBlock = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const isIncomplete = (block: PickupScheduleBlock) => {
    const hasDays = block.days.trim() !== "";
    const hasStart = block.start_time !== "";
    const hasEnd = block.end_time !== "";
    const hasAny = hasDays || hasStart || hasEnd;
    const hasAll = hasDays && hasStart && hasEnd;
    return hasAny && !hasAll;
  };

  return (
    <div className="space-y-3">
      {value.map((block, index) => {
        const incomplete = isIncomplete(block);
        const hasDays = block.days.trim() !== "";
        const hasStart = block.start_time !== "";
        const hasEnd = block.end_time !== "";

        return (
          <div key={index}>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className={labelClass}>Días</label>
                <input
                  type="text"
                  value={block.days}
                  onChange={(e) => updateBlock(index, "days", e.target.value)}
                  className={cn(inputClass, incomplete && !hasDays ? "border-red-400" : "border-gray-300")}
                  placeholder="Lunes a Viernes"
                />
              </div>
              <div className="w-28">
                <label className={labelClass}>Desde</label>
                <input
                  type="time"
                  value={block.start_time}
                  onChange={(e) => updateBlock(index, "start_time", e.target.value)}
                  className={cn(inputClass, incomplete && !hasStart ? "border-red-400" : "border-gray-300")}
                />
              </div>
              <div className="w-28">
                <label className={labelClass}>Hasta</label>
                <input
                  type="time"
                  value={block.end_time}
                  onChange={(e) => updateBlock(index, "end_time", e.target.value)}
                  className={cn(inputClass, incomplete && !hasEnd ? "border-red-400" : "border-gray-300")}
                />
              </div>
              <button
                type="button"
                onClick={() => removeBlock(index)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Eliminar horario"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {incomplete && (
              <p className="text-xs text-red-500 mt-1">Completa todos los campos del horario</p>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addBlock}
        className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Agregar horario
      </button>
    </div>
  );
}

/** Returns true if all blocks are complete (or there are no blocks) */
export function isScheduleValid(blocks: PickupScheduleBlock[]): boolean {
  return blocks.every(
    (b) => b.days.trim() !== "" && b.start_time !== "" && b.end_time !== ""
  );
}
