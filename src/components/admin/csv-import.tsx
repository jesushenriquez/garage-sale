"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { parseCsvFile, validateRows } from "@/lib/csv/parser";
import {
  ImportSummary,
  BulkOperationPayload,
  BulkOperationResult,
} from "@/lib/csv/types";
import { CsvPreviewSummary } from "./csv-preview-summary";
import { CsvPreviewTable } from "./csv-preview-table";
import { cn } from "@/lib/utils";

type ImportState = "idle" | "preview" | "applying" | "done";

export function CsvImport() {
  const [state, setState] = useState<ImportState>("idle");
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [result, setResult] = useState<BulkOperationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setState("idle");
    setSummary(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      const rows = await parseCsvFile(file);

      if (rows.length === 0) {
        setError("El archivo CSV está vacío.");
        return;
      }

      // Collect IDs that need validation
      const idsToValidate = rows
        .filter(
          (r) =>
            r.action?.trim().toLowerCase() === "update" ||
            r.action?.trim().toLowerCase() === "delete"
        )
        .map((r) => r.id?.trim())
        .filter((id): id is string => !!id);

      let existingIds: string[] = [];

      if (idsToValidate.length > 0) {
        const uniqueIds = [...new Set(idsToValidate)];
        const res = await fetch(
          `/api/admin/bulk-products/validate-ids?ids=${uniqueIds.join(",")}`
        );
        if (!res.ok) throw new Error("Error al validar IDs");
        const data = await res.json();
        existingIds = data.existing;
      }

      const importSummary = validateRows(rows, existingIds);
      setSummary(importSummary);
      setState("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar archivo");
    }
  };

  const handleApply = async () => {
    if (!summary) return;

    setState("applying");

    const validRows = summary.rows.filter((r) => r.isValid);

    const payload: BulkOperationPayload = {
      creates: validRows
        .filter((r) => r.action === "create")
        .map((r) => ({
          name: r.parsed!.name!,
          description: r.parsed!.description!,
          price: r.parsed!.price!,
          category: r.parsed!.category!,
          item_condition: r.parsed!.item_condition!,
          sale_status: r.parsed!.sale_status || "available",
          delivery_method: r.parsed!.delivery_method || null,
          pickup_address: r.parsed!.pickup_address || null,
          pickup_map_url: r.parsed!.pickup_map_url || null,
        })),
      updates: validRows
        .filter((r) => r.action === "update")
        .map((r) => {
          const fields: Record<string, unknown> = {};
          if (r.parsed!.name) fields.name = r.parsed!.name;
          if (r.parsed!.description) fields.description = r.parsed!.description;
          if (r.parsed!.price !== undefined) fields.price = r.parsed!.price;
          if (r.parsed!.category) fields.category = r.parsed!.category;
          if (r.parsed!.item_condition) fields.item_condition = r.parsed!.item_condition;
          if (r.parsed!.sale_status) fields.sale_status = r.parsed!.sale_status;
          if (r.parsed!.delivery_method !== undefined)
            fields.delivery_method = r.parsed!.delivery_method;
          if (r.parsed!.pickup_address !== undefined)
            fields.pickup_address = r.parsed!.pickup_address;
          if (r.parsed!.pickup_map_url !== undefined)
            fields.pickup_map_url = r.parsed!.pickup_map_url;
          return { id: r.parsed!.id!, fields };
        }),
      deletes: validRows
        .filter((r) => r.action === "delete")
        .map((r) => r.parsed!.id!),
    };

    try {
      const res = await fetch("/api/admin/bulk-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al procesar operaciones");
      }

      const data: BulkOperationResult = await res.json();
      setResult(data);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al aplicar cambios");
      setState("preview");
    }
  };

  if (state === "done" && result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Importación completada</span>
        </div>
        <div className="space-y-1 text-sm text-gray-700">
          {result.created > 0 && <p>{result.created} productos creados</p>}
          {result.updated > 0 && <p>{result.updated} productos actualizados</p>}
          {result.deleted > 0 && <p>{result.deleted} productos eliminados</p>}
          {result.errors.length > 0 && (
            <div className="mt-2 p-3 bg-red-50 rounded-lg">
              <p className="font-medium text-red-800 mb-1">
                {result.errors.length} errores del servidor:
              </p>
              {result.errors.map((err, i) => (
                <p key={i} className="text-red-600 text-xs">
                  {err.action}
                  {err.id ? ` (${err.id})` : ""}: {err.error}
                </p>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Nueva importación
        </button>
      </div>
    );
  }

  if ((state === "preview" || state === "applying") && summary) {
    return (
      <div className="space-y-4">
        <CsvPreviewSummary
          summary={summary}
          onApply={handleApply}
          onCancel={reset}
          applying={state === "applying"}
        />
        <CsvPreviewTable rows={summary.rows} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed border-gray-300 rounded-lg p-8",
          "flex flex-col items-center gap-3 cursor-pointer",
          "hover:border-brand-400 hover:bg-brand-50/50 transition-colors"
        )}
      >
        <Upload className="w-8 h-8 text-gray-400" />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            Haz clic para seleccionar un archivo CSV
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Máximo 200 filas. Usa el template para el formato correcto.
          </p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
          <FileText className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
