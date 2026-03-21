"use client";

import { Download, Check, X, Loader2 } from "lucide-react";
import { ImportSummary } from "@/lib/csv/types";
import { generateErrorsCsv, downloadCsv } from "@/lib/csv/generator";
import { cn } from "@/lib/utils";

interface CsvPreviewSummaryProps {
  summary: ImportSummary;
  onApply: () => void;
  onCancel: () => void;
  applying: boolean;
}

export function CsvPreviewSummary({
  summary,
  onApply,
  onCancel,
  applying,
}: CsvPreviewSummaryProps) {
  const hasValid =
    summary.toCreate + summary.toUpdate + summary.toDelete > 0;
  const hasErrors = summary.errors > 0;

  const handleDownloadErrors = () => {
    const csv = generateErrorsCsv(summary.rows);
    downloadCsv(csv, "errores-importacion.csv");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {summary.toCreate > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
            {summary.toCreate} a crear
          </span>
        )}
        {summary.toUpdate > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {summary.toUpdate} a actualizar
          </span>
        )}
        {summary.toDelete > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
            {summary.toDelete} a eliminar
          </span>
        )}
        {hasErrors && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
            {summary.errors} con errores
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onApply}
          disabled={!hasValid || applying}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            "bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {applying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {applying ? "Procesando..." : "Aplicar válidas"}
        </button>
        <button
          onClick={onCancel}
          disabled={applying}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>
        {hasErrors && (
          <button
            onClick={handleDownloadErrors}
            disabled={applying}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-700 border border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Descargar errores
          </button>
        )}
      </div>
    </div>
  );
}
