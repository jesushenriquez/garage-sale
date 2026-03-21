# Spec Funcional — Importar/Exportar CSV

**Versión**: 1.0
**Fecha**: 2026-03-21
**Estado**: Aprobada
**Fecha de aprobación**: 2026-03-21

---

## 1. Problema

Actualmente, el admin solo puede crear y editar productos uno por uno. Cuando hay muchos productos que cargar, actualizar o marcar como vendidos, el proceso es lento y tedioso. No existe forma de hacer operaciones masivas ni de exportar el catálogo existente.

## 2. Solución

Nueva sección "Importar / Exportar" en el panel admin que permita:
- **Exportar** los productos actuales a CSV (con filtros opcionales).
- **Importar** un CSV para crear, actualizar o eliminar productos de forma masiva.
- **Preview** antes de aplicar cambios, con validación y resumen de errores.
- **Template descargable** con las columnas correctas y valores de ejemplo.

## 3. Usuarios

| Rol | Descripción |
|-----|-------------|
| Admin | Único usuario. Gestiona el catálogo completo desde el panel admin. |

## 4. Módulos

### 4.1 Exportar Productos

- Botón "Exportar CSV" que descarga los productos existentes.
- **Filtros opcionales** antes de exportar:
  - Por estado de venta (`available`, `sold`, o todos)
  - Por categoría (una, varias, o todas)
- El CSV exportado incluye todas las columnas del producto (excepto imágenes) y un campo `id` para facilitar re-importación.
- Formato: UTF-8 con BOM para compatibilidad con Excel.

### 4.2 Template CSV

- Botón "Descargar template" que genera un CSV vacío con:
  - Headers correctos
  - Una fila de ejemplo con valores válidos
  - Comentarios o notas indicando valores permitidos por columna
- Columnas del template:

| Columna | Requerida | Valores permitidos | Notas |
|---------|-----------|-------------------|-------|
| `action` | Sí | `create`, `update`, `delete` | Operación a realizar |
| `id` | Solo para `update`/`delete` | UUID existente | Se ignora en `create` |
| `name` | Sí para `create`/`update` | Texto libre | Nombre del producto |
| `description` | Sí para `create` | Texto libre | Descripción del producto |
| `price` | Sí para `create`/`update` | Número positivo | Precio en USD |
| `category` | Sí para `create`/`update` | Ver lista de categorías | Debe coincidir exactamente |
| `item_condition` | Sí para `create` | `new`, `like_new`, `used` | Condición del artículo |
| `sale_status` | No | `available`, `sold` | Default: `available` |
| `delivery_method` | No | `delivery`, `pickup`, `both`, vacío | Vacío = hereda de store config |
| `pickup_address` | No | Texto libre | Solo si delivery_method incluye pickup |
| `pickup_map_url` | No | URL válida | Solo si delivery_method incluye pickup |

### 4.3 Importar CSV

- Botón "Importar CSV" que abre un file picker (acepta solo `.csv`).
- Al seleccionar archivo, se parsea en el **cliente** (no se envía al servidor aún).
- Se muestra el **preview** (ver sección 4.4) antes de aplicar.

### 4.4 Preview y Confirmación

El preview muestra una tabla con todas las filas del CSV y su estado de validación:

- **Resumen superior**:
  - `X productos a crear`
  - `X productos a actualizar`
  - `X productos a eliminar`
  - `X filas con errores`

- **Tabla de filas** con columnas:
  - Número de fila
  - Acción (create/update/delete)
  - Nombre del producto
  - Estado: ✓ válida / ✗ error (con mensaje de error específico)

- **Código de colores**:
  - Verde: filas válidas (create)
  - Azul: filas válidas (update)
  - Rojo: filas con errores
  - Naranja: filas de eliminación (delete)

- **Acciones disponibles**:
  - **"Aplicar válidas"**: procesa solo las filas sin errores. Deshabilitado si no hay filas válidas.
  - **"Cancelar"**: descarta todo y vuelve a la pantalla principal.
  - **"Descargar errores"**: descarga un CSV con solo las filas que tuvieron error, para corregir y re-subir. Solo visible si hay errores.

### 4.5 Procesamiento

- Al confirmar, se envían las filas válidas al servidor vía API.
- Se procesan en una sola transacción (todo o nada por lote enviado).
- Se muestra progreso y resultado final:
  - `X productos creados`
  - `X productos actualizados`
  - `X productos eliminados`
  - Errores del servidor (si los hay)

## 5. Flujos Principales

### Flujo 1: Carga masiva de productos nuevos

1. Admin abre sección "Importar / Exportar".
2. Descarga el template CSV.
3. Llena el template con productos nuevos (action: `create`).
4. Sube el CSV.
5. Ve el preview: 15 productos a crear, 0 errores.
6. Hace clic en "Aplicar válidas".
7. Ve resultado: 15 productos creados exitosamente.

### Flujo 2: Actualización masiva (ej: marcar como vendidos)

1. Admin exporta productos actuales con filtro "disponibles".
2. Abre el CSV en Excel/Sheets.
3. Cambia `action` a `update` y `sale_status` a `sold` en los productos vendidos.
4. Sube el CSV modificado.
5. Ve preview: 8 productos a actualizar.
6. Confirma y se aplican los cambios.

### Flujo 3: Carga con errores

1. Admin sube un CSV con 20 filas.
2. Preview muestra: 17 válidas, 3 con errores (ej: categoría inválida, precio negativo, id inexistente).
3. Admin decide "Aplicar válidas" → se procesan las 17.
4. Descarga CSV de errores (3 filas).
5. Corrige las 3 filas y re-sube.

### Flujo 4: Eliminación masiva

1. Admin exporta todos los productos.
2. Marca con action `delete` los que quiere eliminar.
3. Sube el CSV.
4. Preview muestra: 5 productos a eliminar (en naranja).
5. Confirma y se eliminan (incluyendo sus imágenes en storage).

## 6. Reglas de Negocio

1. **Validación de `action`**: cada fila debe tener `create`, `update` o `delete`. Cualquier otro valor es error.
2. **`create` requiere**: `name`, `description`, `price`, `category`, `item_condition`. Se ignora el campo `id`.
3. **`update` requiere**: `id` válido (existente en BD). Solo se actualizan los campos con valor; campos vacíos no sobrescriben valores existentes.
4. **`delete` requiere**: `id` válido (existente en BD). Se eliminan también las imágenes asociadas del storage.
5. **Categorías**: deben coincidir exactamente con las definidas en `CATEGORIES` (case-sensitive).
6. **`item_condition`**: debe ser `new`, `like_new` o `used`.
7. **`sale_status`**: debe ser `available` o `sold`. Si está vacío, default `available` para `create`.
8. **`delivery_method`**: debe ser `delivery`, `pickup`, `both` o vacío (null = hereda de store config).
9. **`price`**: debe ser un número positivo.
10. **Imágenes**: no se manejan por CSV. Los productos creados por CSV quedan sin imágenes; se agregan después desde el admin individual.
11. **Límite de filas**: máximo 200 filas por archivo CSV para evitar timeouts.
12. **Encoding**: el parser debe soportar UTF-8 (con y sin BOM).
13. **Eliminación en cascada**: al eliminar un producto, sus `product_images` se eliminan por FK CASCADE y los archivos del storage se eliminan explícitamente.

## 7. Criterios de Aceptación

- [ ] Existe la sección "Importar / Exportar" en el menú admin.
- [ ] Se puede descargar un template CSV con headers, ejemplo y notas.
- [ ] Se puede exportar productos a CSV con filtros por estado y categoría.
- [ ] El CSV exportado se abre correctamente en Excel (UTF-8 BOM).
- [ ] Se puede importar un CSV y ver el preview antes de aplicar.
- [ ] El preview muestra resumen (crear/actualizar/eliminar/errores) y tabla con estado por fila.
- [ ] Se pueden aplicar solo las filas válidas.
- [ ] Se puede descargar un CSV con las filas que tuvieron error.
- [ ] Las acciones `create`, `update` y `delete` funcionan correctamente.
- [ ] `update` con campos vacíos no sobrescribe valores existentes.
- [ ] `delete` elimina el producto, sus imágenes de BD y los archivos del storage.
- [ ] Se muestran errores de validación claros por fila (categoría inválida, campo requerido faltante, etc.).
- [ ] El procesamiento se hace en transacción (si falla el lote, no se aplica parcialmente).
- [ ] Archivos de más de 200 filas son rechazados con mensaje claro.

## 8. Fuera de Alcance

- Carga de imágenes por CSV (se hará en una feature futura).
- Edición inline de filas en el preview.
- Importar/exportar en formatos distintos a CSV (Excel, JSON, etc.).
- Historial de importaciones anteriores.
- Undo/rollback de una importación aplicada.
- Scheduling o importaciones automáticas.

---

**Próximo paso**: Revisión y aprobación → Fase 2 (Spec Técnica).
