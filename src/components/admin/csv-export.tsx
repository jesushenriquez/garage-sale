"use client";

import { useState } from "react";
import { Download, FileDown, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { generateExportCsv, generateTemplate, downloadCsv } from "@/lib/csv/generator";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CsvExport() {
  const [saleStatus, setSaleStatus] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (saleStatus) params.set("sale_status", saleStatus);
      if (category) params.set("category", category);

      const res = await fetch(
        `/api/admin/bulk-products/export?${params.toString()}`
      );
      if (!res.ok) throw new Error("Error al exportar productos");

      const { products } = (await res.json()) as { products: Product[] };

      if (products.length === 0) {
        alert("No se encontraron productos con los filtros seleccionados.");
        return;
      }

      const csv = generateExportCsv(products);
      const date = new Date().toISOString().slice(0, 10);
      downloadCsv(csv, `productos-${date}.csv`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al exportar");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csv = generateTemplate();
    downloadCsv(csv, "template-productos.csv");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={saleStatus}
            onChange={(e) => setSaleStatus(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="available">Disponible</option>
            <option value="sold">Vendido</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Todas</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleExport}
          disabled={loading}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            "bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-50"
          )}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Exportar CSV
        </button>
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Descargar template
        </button>
      </div>
    </div>
  );
}
