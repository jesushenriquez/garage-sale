"use client";

import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
  showAll: boolean;
  onToggleAll: (showAll: boolean) => void;
}

export function CategoryFilter({ selected, onSelect, showAll, onToggleAll }: CategoryFilterProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            selected === null
              ? "bg-brand-600 text-white"
              : "bg-brand-100 text-brand-700 hover:bg-brand-200"
          )}
        >
          Todos
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              selected === cat
                ? "bg-brand-600 text-white"
                : "bg-brand-100 text-brand-700 hover:bg-brand-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-brand-600 cursor-pointer">
        <input
          type="checkbox"
          checked={!showAll}
          onChange={(e) => onToggleAll(!e.target.checked)}
          className="rounded border-brand-300 text-brand-600 focus:ring-brand-500"
        />
        Solo disponibles
      </label>
    </div>
  );
}
