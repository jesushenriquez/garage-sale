"use client";

import { ValidatedRow } from "@/lib/csv/types";
import { cn } from "@/lib/utils";

interface CsvPreviewTableProps {
  rows: ValidatedRow[];
}

const ACTION_STYLES = {
  create: "bg-green-50 text-green-700",
  update: "bg-blue-50 text-blue-700",
  delete: "bg-orange-50 text-orange-700",
} as const;

const ACTION_LABELS = {
  create: "Crear",
  update: "Actualizar",
  delete: "Eliminar",
} as const;

export function CsvPreviewTable({ rows }: CsvPreviewTableProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-600 w-12">
                #
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-600 w-24">
                Acción
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">
                Nombre
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-600 w-16">
                Estado
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">
                Errores
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  row.isValid ? "bg-white" : "bg-red-50"
                )}
              >
                <td className="px-3 py-2 text-gray-500">{row.rowNumber}</td>
                <td className="px-3 py-2">
                  {row.action ? (
                    <span
                      className={cn(
                        "inline-block px-2 py-0.5 rounded text-xs font-medium",
                        row.isValid
                          ? ACTION_STYLES[row.action]
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      {ACTION_LABELS[row.action]}
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                      Inválida
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-gray-900 truncate max-w-48">
                  {row.raw.name || row.parsed?.id || "—"}
                </td>
                <td className="px-3 py-2 text-center">
                  {row.isValid ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-red-600">✗</span>
                  )}
                </td>
                <td className="px-3 py-2 text-red-600 text-xs">
                  {row.errors.join("; ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
