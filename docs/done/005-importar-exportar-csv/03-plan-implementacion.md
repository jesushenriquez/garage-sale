# Plan de Implementación — Importar/Exportar CSV

**Versión**: 1.0
**Fecha**: 2026-03-21
**Estado**: Aprobada
**Fecha de aprobación**: 2026-03-21

---

## Iteraciones

### Iteración 1: Fundación — tipos, librería CSV y navegación
**Objetivo**: Establecer la base de tipos, utilidades CSV y la nueva sección en el admin.

#### Tareas
- [ ] 1.1 Instalar `papaparse` y `@types/papaparse`
- [ ] 1.2 Crear `src/lib/csv/types.ts` con interfaces: `CsvRow`, `ValidatedRow`, `ImportSummary`, `BulkOperationPayload`, `BulkOperationResult`
- [ ] 1.3 Crear `src/lib/csv/generator.ts` con funciones:
  - `generateTemplate()` — genera CSV template con headers, fila de ejemplo y notas
  - `generateErrorsCsv(rows: ValidatedRow[])` — genera CSV con solo filas con error
  - `generateExportCsv(products: Product[])` — genera CSV de exportación con columna `action` pre-llenada como `update`
  - `downloadCsv(content: string, filename: string)` — trigger descarga via Blob
- [ ] 1.4 Crear `src/lib/csv/parser.ts` con funciones:
  - `parseCsvFile(file: File): Promise<CsvRow[]>` — parsea CSV con Papa Parse
  - `validateRows(rows: CsvRow[], existingIds: string[]): ValidatedRow[]` — valida cada fila y retorna con estado
- [ ] 1.5 Crear página `src/app/admin/import-export/page.tsx` (shell básico con título)
- [ ] 1.6 Agregar "Importar / Exportar" al `admin-nav.tsx` con icono `FileSpreadsheet`

**Entregable**: Navegación funcional a la nueva sección, lógica CSV testeable de forma aislada.

---

### Iteración 2: Exportación de productos
**Objetivo**: Poder exportar productos existentes a CSV con filtros.

#### Tareas
- [ ] 2.1 Crear endpoint `GET /api/admin/bulk-products/export` con filtros `sale_status` y `category`
- [ ] 2.2 Crear componente `src/components/admin/csv-export.tsx`:
  - Dropdown filtro por estado (Todos / Disponible / Vendido)
  - Dropdown filtro por categoría (Todas / cada categoría)
  - Botón "Exportar CSV"
  - Botón "Descargar template"
- [ ] 2.3 Integrar `csv-export` en la página `import-export/page.tsx`

**Entregable**: Admin puede exportar catálogo a CSV y descargar template.

---

### Iteración 3: Importación — upload, parseo y preview
**Objetivo**: Subir CSV, parsearlo en cliente y mostrar preview con validación.

#### Tareas
- [ ] 3.1 Crear endpoint `GET /api/admin/bulk-products/validate-ids` para validar existencia de IDs
- [ ] 3.2 Crear componente `src/components/admin/csv-preview-summary.tsx`:
  - Badges con conteos (crear, actualizar, eliminar, errores)
  - Botones: "Aplicar válidas", "Cancelar", "Descargar errores"
- [ ] 3.3 Crear componente `src/components/admin/csv-preview-table.tsx`:
  - Tabla con columnas: #, Acción, Nombre, Estado, Errores
  - Código de colores por acción/estado
  - Scroll vertical para muchas filas
- [ ] 3.4 Crear componente `src/components/admin/csv-import.tsx`:
  - Zona de upload (file picker, acepta `.csv`)
  - Integra parseo → validación → preview
  - Maneja estados: inicial → preview → procesando → resultado
- [ ] 3.5 Integrar `csv-import` en la página `import-export/page.tsx`

**Entregable**: Admin puede subir CSV y ver preview completo con validación y errores por fila.

---

### Iteración 4: Procesamiento — endpoint bulk y ejecución
**Objetivo**: Ejecutar las operaciones confirmadas contra la BD.

#### Tareas
- [ ] 4.1 Crear endpoint `POST /api/admin/bulk-products`:
  - Validación server-side del payload
  - Ejecución en orden: deletes (con cleanup de storage) → updates → creates
  - Retorna conteo y errores
- [ ] 4.2 Conectar botón "Aplicar válidas" en `csv-import.tsx` con el endpoint
- [ ] 4.3 Mostrar resultado final (X creados, Y actualizados, Z eliminados, errores si hay)
- [ ] 4.4 Conectar botón "Descargar errores" con `generateErrorsCsv()`

**Entregable**: Flujo completo funcional de importación end-to-end.

---

### Iteración 5: Pulido y edge cases
**Objetivo**: Manejar edge cases, mejorar UX y validar todo el flujo.

#### Tareas
- [ ] 5.1 Validar límite de 200 filas (cliente + servidor) con mensaje claro
- [ ] 5.2 Manejar CSV vacío, CSV sin headers, CSV con columnas extra
- [ ] 5.3 Manejar encoding UTF-8 con y sin BOM
- [ ] 5.4 Estado de loading/disabled en botones durante procesamiento
- [ ] 5.5 Prueba manual end-to-end de todos los flujos:
  - Crear productos nuevos desde CSV
  - Exportar → modificar → re-importar para actualizar
  - Marcar como vendidos masivamente
  - Eliminar productos con imágenes
  - CSV con mezcla de válidos e inválidos
  - Descargar errores, corregir y re-subir

**Entregable**: Feature completa, pulida y validada.

---

## Cronograma Estimado

| Iteración | Descripción |
|-----------|-------------|
| 1 | Fundación (tipos, CSV utils, nav) |
| 2 | Exportación |
| 3 | Importación (upload, preview) |
| 4 | Procesamiento (bulk endpoint) |
| 5 | Pulido y validación |

## Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Papa Parse no maneja bien UTF-8 BOM con caracteres especiales (ñ, tildes) | Datos corruptos en preview | Papa Parse soporta BOM nativamente; verificar con CSV real en español en iteración 5 |
| Timeout en operaciones bulk grandes (cerca de 200 filas) | Request falla | El endpoint ejecuta secuencialmente; si toma mucho tiempo, considerar reducir límite o chunking en futuro |
| Supabase no soporta transacciones multi-statement via JS client | Operación parcial si falla a mitad | Diseñado para reportar errores individuales sin fallar todo el lote; aceptable para este caso de uso |
| Usuario sube CSV generado en Excel con encoding Windows-1252 | Caracteres rotos | Papa Parse detecta encoding automáticamente; agregar nota en template sobre UTF-8 |
| Delete masivo sin confirmación suficiente | Pérdida de datos | Preview con filas de delete en naranja + conteo visible antes de confirmar |

---

**Próximo paso**: Revisión y aprobación → Fase 4 (Implementación).
