# Spec Técnica — Importar/Exportar CSV

**Versión**: 1.0
**Fecha**: 2026-03-21
**Estado**: Aprobada
**Fecha de aprobación**: 2026-03-21
**Spec Funcional**: [01-spec-funcional.md](./01-spec-funcional.md)

---

## 1. Stack Tecnológico

| Componente | Tecnología | Justificación |
|------------|-----------|---------------|
| Parseo CSV (cliente) | [Papa Parse](https://www.papaparse.com/) | Librería estándar para CSV en JS. Parseo en browser, soporta UTF-8/BOM, streaming, detección de delimitadores. ~7KB gzipped. |
| Generación CSV (cliente) | Papa Parse (`unparse`) | Misma librería para exportar (genera string CSV desde array de objetos). |
| Descarga de archivos | Blob + URL.createObjectURL | Nativo del browser, sin dependencias. |
| API | Next.js Route Handlers | Consistente con endpoints existentes en `/api/admin/*`. |
| BD | Supabase (PostgreSQL) | Mismo stack existente. Transacciones vía `rpc` para operaciones atómicas. |
| Storage cleanup | Supabase Storage API | Mismo patrón que delete de productos existente. |

**Dependencia nueva**: `papaparse` + `@types/papaparse` (dev).

## 2. Arquitectura

### Flujo general

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────┐
│  CSV File    │────▶│  Papa Parse   │────▶│  Preview +      │────▶│  API     │
│  (browser)   │     │  (client)     │     │  Validation     │     │  Server  │
│              │     │              │     │  (client)       │     │          │
└─────────────┘     └──────────────┘     └─────────────────┘     └──────────┘
                                                                       │
                                                                       ▼
                                                                 ┌──────────┐
                                                                 │ Supabase │
                                                                 │ DB +     │
                                                                 │ Storage  │
                                                                 └──────────┘
```

### Responsabilidades cliente vs servidor

**Cliente (browser)**:
- Parseo del CSV (Papa Parse)
- Validación de formato: columnas requeridas, tipos de datos, valores permitidos
- Validación de referencia: verificar que `id`s existen (llamada ligera al API)
- Generar preview con estado por fila
- Generar CSV de template, exportación y errores
- Enviar lote de filas válidas al servidor

**Servidor (API)**:
- Autenticación (patrón existente: `supabase.auth.getUser()`)
- Validación server-side (segunda capa, no confiar solo en cliente)
- Ejecución de operaciones en transacción (create/update/delete)
- Cleanup de imágenes en storage para deletes
- Retornar resultado por operación

### Decisión: parseo en cliente

El CSV se parsea completamente en el browser. Esto permite mostrar preview instantáneo sin round-trip al servidor, y evita enviar archivos potencialmente inválidos. Solo se envían las filas válidas confirmadas.

## 3. Modelo de Datos

No se requieren cambios al esquema de BD. Las operaciones usan las tablas existentes:

- `products` — insert, update, delete
- `product_images` — select (para cleanup en delete), delete via CASCADE

### Estructura de datos en cliente

```typescript
// Fila parseada del CSV
interface CsvRow {
  action: "create" | "update" | "delete";
  id?: string;
  name?: string;
  description?: string;
  price?: string; // string del CSV, se convierte a number
  category?: string;
  item_condition?: string;
  sale_status?: string;
  delivery_method?: string;
  pickup_address?: string;
  pickup_map_url?: string;
}

// Fila validada con estado
interface ValidatedRow {
  rowNumber: number;
  raw: CsvRow;
  action: "create" | "update" | "delete";
  isValid: boolean;
  errors: string[]; // mensajes de error específicos
  // Datos parseados (solo si válida)
  parsed?: {
    id?: string;
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    item_condition?: string;
    sale_status?: string;
    delivery_method?: string | null;
    pickup_address?: string | null;
    pickup_map_url?: string | null;
  };
}

// Resumen del preview
interface ImportSummary {
  total: number;
  toCreate: number;
  toUpdate: number;
  toDelete: number;
  errors: number;
  rows: ValidatedRow[];
}

// Payload enviado al servidor
interface BulkOperationPayload {
  creates: Omit<Product, "id" | "created_at" | "updated_at" | "images">[];
  updates: { id: string; fields: Partial<Omit<Product, "id" | "created_at" | "updated_at" | "images">> }[];
  deletes: string[]; // array de IDs
}

// Respuesta del servidor
interface BulkOperationResult {
  created: number;
  updated: number;
  deleted: number;
  errors: { action: string; id?: string; error: string }[];
}
```

## 4. API / Endpoints

### POST `/api/admin/bulk-products`

Endpoint único para operaciones masivas. Recibe las tres operaciones en un solo request.

**Request:**
```json
{
  "creates": [
    {
      "name": "Silla de oficina",
      "description": "Silla ergonómica...",
      "price": 45.00,
      "category": "Muebles",
      "item_condition": "like_new",
      "sale_status": "available",
      "delivery_method": null,
      "pickup_address": null,
      "pickup_map_url": null
    }
  ],
  "updates": [
    {
      "id": "uuid-123",
      "fields": {
        "price": 35.00,
        "sale_status": "sold"
      }
    }
  ],
  "deletes": ["uuid-456", "uuid-789"]
}
```

**Response (200):**
```json
{
  "created": 5,
  "updated": 3,
  "deleted": 2,
  "errors": []
}
```

**Response con errores parciales (200):**
```json
{
  "created": 4,
  "updated": 3,
  "deleted": 1,
  "errors": [
    { "action": "create", "error": "Duplicate name: Silla de oficina" },
    { "action": "delete", "id": "uuid-789", "error": "Product not found" }
  ]
}
```

**Response (401):**
```json
{ "error": "Unauthorized" }
```

**Lógica del endpoint:**

1. Verificar auth (`supabase.auth.getUser()`)
2. Validar payload server-side (segunda capa)
3. Ejecutar operaciones en orden: **deletes → updates → creates**
   - Deletes primero: limpiar storage de imágenes, luego delete en BD
   - Updates: solo campos con valor (campos omitidos no se tocan)
   - Creates: insert con defaults (sale_status = "available" si vacío)
4. Retornar conteo y errores

> **Nota sobre transaccionalidad**: Supabase JS client no soporta transacciones multi-statement nativas. Se ejecutan las operaciones secuencialmente. Si una falla, se reporta en `errors` pero las demás continúan. Esto es preferible a fallar todo el lote por un solo error.

### GET `/api/admin/bulk-products/validate-ids`

Endpoint ligero para validar existencia de IDs antes de enviar el lote completo.

**Request:**
```
GET /api/admin/bulk-products/validate-ids?ids=uuid-1,uuid-2,uuid-3
```

**Response (200):**
```json
{
  "existing": ["uuid-1", "uuid-3"],
  "missing": ["uuid-2"]
}
```

Usado por el cliente durante la fase de validación del preview, para verificar que los IDs de `update` y `delete` existen en la BD.

### GET `/api/admin/bulk-products/export`

Endpoint para exportar productos como CSV.

**Query params:**
- `sale_status` (opcional): `available`, `sold`, o vacío para todos
- `category` (opcional): nombre exacto de categoría, o vacío para todas

**Response**: JSON con array de productos (el CSV se genera en el cliente con Papa Parse `unparse` para consistencia).

```json
{
  "products": [
    {
      "id": "uuid-123",
      "name": "Silla",
      "description": "...",
      "price": 45.00,
      "category": "Muebles",
      "item_condition": "like_new",
      "sale_status": "available",
      "delivery_method": null,
      "pickup_address": null,
      "pickup_map_url": null
    }
  ]
}
```

## 5. Componentes

### Estructura de archivos

```
src/
├── app/admin/import-export/
│   └── page.tsx                          # Página principal (client component)
├── components/admin/
│   ├── csv-import.tsx                    # Sección de importación (upload + preview)
│   ├── csv-export.tsx                    # Sección de exportación (filtros + descarga)
│   ├── csv-preview-table.tsx             # Tabla de preview con filas validadas
│   └── csv-preview-summary.tsx           # Resumen (X crear, Y actualizar, Z eliminar, W errores)
└── lib/
    └── csv/
        ├── parser.ts                     # Parseo y validación de CSV
        ├── generator.ts                  # Generación de CSV (template, export, errores)
        └── types.ts                      # Tipos de CsvRow, ValidatedRow, ImportSummary, etc.
```

### Componentes detallados

#### `page.tsx` — Página Importar/Exportar
- Dos secciones con cards: "Importar" y "Exportar"
- Botón "Descargar template" en la sección de importar

#### `csv-import.tsx` — Importación
- **Estado inicial**: zona de drop / botón de file picker (acepta `.csv`)
- **Estado preview**: muestra `csv-preview-summary` + `csv-preview-table`
- **Estado procesando**: loading spinner con texto "Procesando..."
- **Estado resultado**: resumen de operaciones completadas
- Maneja el flujo completo: upload → parse → validate → preview → confirm → send → result

#### `csv-export.tsx` — Exportación
- Selectores de filtro: estado de venta (dropdown) y categoría (dropdown)
- Botón "Exportar CSV"
- Llama al endpoint de export, genera CSV con Papa Parse `unparse`, dispara descarga

#### `csv-preview-table.tsx` — Tabla de Preview
- Tabla con columnas: #, Acción, Nombre, Estado (✓/✗), Errores
- Código de colores por acción (create=verde, update=azul, delete=naranja, error=rojo)
- Scroll vertical si hay muchas filas (max-height con overflow)

#### `csv-preview-summary.tsx` — Resumen
- Badges con conteos: crear, actualizar, eliminar, errores
- Botones de acción: "Aplicar válidas", "Cancelar", "Descargar errores"

### Navegación

Agregar item al `navItems` en `admin-nav.tsx`:

```typescript
{ href: "/admin/import-export", label: "Importar / Exportar", icon: FileSpreadsheet }
```

Icono: `FileSpreadsheet` de `lucide-react`.

## 6. Seguridad

- **Autenticación**: el endpoint `POST /api/admin/bulk-products` verifica `supabase.auth.getUser()` (mismo patrón que todos los endpoints admin).
- **Validación server-side**: el servidor re-valida todos los datos aunque el cliente ya haya validado. No confiar en validación client-only.
- **Límite de filas**: máximo 200 filas por request (validado en cliente y servidor).
- **Parseo en cliente**: el archivo CSV nunca se envía completo al servidor. Solo se envía el JSON con las operaciones válidas confirmadas.
- **No file upload al servidor**: elimina riesgo de archivos maliciosos en el server.
- **IDs validados**: antes de enviar updates/deletes, se validan los IDs contra la BD.
- **RLS**: las políticas existentes de Supabase aplican (authenticated write).

## 7. Variables de Entorno

No se requieren variables de entorno nuevas. Se usan las existentes:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

**Próximo paso**: Revisión y aprobación → Fase 3 (Plan de Implementación).
