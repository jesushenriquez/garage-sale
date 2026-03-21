"use client";

import { CsvExport } from "@/components/admin/csv-export";
import { CsvImport } from "@/components/admin/csv-import";

export default function ImportExportPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Importar / Exportar
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Exportar productos
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Descarga tus productos en formato CSV. Puedes filtrar por estado o
            categoría.
          </p>
          <CsvExport />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Importar productos
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Sube un archivo CSV para crear, actualizar o eliminar productos de
            forma masiva.
          </p>
          <CsvImport />
        </div>
      </div>
    </div>
  );
}
