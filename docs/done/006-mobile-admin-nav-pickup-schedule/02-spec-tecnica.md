# Spec Técnica — Mobile Admin Nav + Horario de Recogida

**Versión**: 1.0
**Fecha**: 2026-03-21
**Estado**: Aprobada
**Fecha de aprobación**: 2026-03-21
**Spec Funcional**: [01-spec-funcional.md](./01-spec-funcional.md)

---

## 1. Stack Tecnológico

Sin cambios al stack existente. Se usan las mismas tecnologías:
- **Next.js 15** (App Router)
- **Tailwind CSS 4** con palette brand
- **Supabase** (PostgreSQL + Auth)
- **Lucide React** para íconos (se agrega `Menu`, `X`, `Clock`)
- **React state** para el toggle del menú hamburger

No se agregan dependencias nuevas.

---

## 2. Arquitectura

### 2.1 Menú Admin Responsive

Cambio contenido en un solo componente:

- **`src/components/admin/admin-nav.tsx`** — Se modifica para:
  - Agregar estado `isOpen` para controlar el menú móvil
  - En `< md`: mostrar botón hamburger (ícono `Menu`) a la derecha del nombre de la tienda. Al abrir, renderizar un dropdown absoluto debajo del header con los nav items apilados verticalmente + botón Salir.
  - En `≥ md`: mantener layout horizontal actual sin cambios (usando clases `hidden md:flex` / `md:hidden`).
  - Cerrar menú al: hacer click en un enlace, hacer click fuera (click handler en overlay), o navegar.

### 2.2 Horario de Recogida

#### Flujo de datos

```
DB (JSONB) → API → StoreConfig/Product type → Componentes de display
                                              → Componentes de admin (edición)
```

#### Componentes afectados

| Componente | Cambio |
|---|---|
| `src/lib/types.ts` | Agregar tipo `PickupScheduleBlock`, agregar campo `pickup_schedule` a `StoreConfig` y `Product` |
| `src/components/admin/config-form.tsx` | Agregar sección de horarios en bloque Entrega |
| `src/components/admin/product-form.tsx` | Agregar sección de horarios en bloque recogida personalizada |
| `src/components/admin/pickup-schedule-editor.tsx` | **Nuevo**: componente reutilizable para editar bloques de horario |
| `src/components/catalog/pickup-schedule-display.tsx` | **Nuevo**: componente reutilizable para mostrar bloques de horario |
| `src/components/catalog/product-modal.tsx` | Usar `pickup-schedule-display` debajo de la dirección |
| `src/components/layout/footer.tsx` | Usar `pickup-schedule-display` debajo de la dirección |
| `src/app/api/admin/config/route.ts` | Agregar `pickup_schedule` al update |
| `src/app/api/admin/products/route.ts` | Agregar `pickup_schedule` al insert |
| `src/app/api/admin/products/[id]/route.ts` | Agregar `pickup_schedule` al update |

---

## 3. Modelo de Datos

### 3.1 Migración: `005_pickup_schedule.sql`

```sql
-- Agregar columna pickup_schedule a store_config
ALTER TABLE store_config
  ADD COLUMN pickup_schedule JSONB DEFAULT '[]';

-- Agregar columna pickup_schedule a products
ALTER TABLE products
  ADD COLUMN pickup_schedule JSONB;
```

**Decisión de diseño**: Se usa `JSONB` en lugar de una tabla separada porque:
- Los bloques de horario son pocos (2-4 típicamente)
- Siempre se leen/escriben completos (no hay queries parciales)
- Simplifica el CRUD (no hay JOINs adicionales)
- Sigue el mismo patrón que los campos existentes que se guardan como parte del objeto config/product

### 3.2 Estructura del JSONB

```typescript
// Tipo TypeScript
interface PickupScheduleBlock {
  days: string;       // Texto libre: "Lunes a Viernes", "Sábados"
  start_time: string; // Formato "HH:MM" (24h): "09:00"
  end_time: string;   // Formato "HH:MM" (24h): "17:00"
}
```

Ejemplo de valor en DB:
```json
[
  { "days": "Lunes a Viernes", "start_time": "09:00", "end_time": "17:00" },
  { "days": "Sábados", "start_time": "10:00", "end_time": "14:00" }
]
```

### 3.3 Herencia

- `store_config.pickup_schedule`: `JSONB DEFAULT '[]'` — siempre existe, array vacío por defecto
- `products.pickup_schedule`: `JSONB` nullable — `null` = hereda del store_config, `[]` vacío o con bloques = override

Lógica en frontend:
```typescript
const pickupSchedule = product.pickup_schedule ?? config.pickup_schedule;
```

---

## 4. API / Endpoints

### 4.1 PUT `/api/admin/config`

Agregar al body y al update de Supabase:
```typescript
pickup_schedule: body.pickup_schedule ?? [],
```

### 4.2 POST `/api/admin/products`

Agregar al insert:
```typescript
pickup_schedule: body.pickup_schedule ?? null,
```

### 4.3 PUT `/api/admin/products/[id]`

Agregar al update:
```typescript
pickup_schedule: body.pickup_schedule ?? null,
```

No se requieren nuevos endpoints. Los endpoints existentes de lectura (`/api/products`, `/api/config`) ya retornan todos los campos de la tabla, así que `pickup_schedule` se incluirá automáticamente.

---

## 5. Componentes

### 5.1 `AdminNav` (modificado)

```tsx
// Pseudo-estructura
<nav>
  <div className="flex items-center justify-between">
    <Link>El Garaje de Vale</Link>

    {/* Desktop nav - hidden en mobile */}
    <div className="hidden md:flex items-center gap-1">
      {navItems...}
    </div>
    <button className="hidden md:flex">{Salir}</button>

    {/* Mobile hamburger button */}
    <button className="md:hidden" onClick={toggle}>
      {isOpen ? <X /> : <Menu />}
    </button>
  </div>

  {/* Mobile dropdown */}
  {isOpen && (
    <div className="md:hidden border-t mt-3 pt-3 space-y-1">
      {navItems apilados verticalmente...}
      {Salir}
    </div>
  )}
</nav>
```

### 5.2 `PickupScheduleEditor` (nuevo)

Componente `"use client"` reutilizable para admin.

**Props**:
```typescript
interface PickupScheduleEditorProps {
  value: PickupScheduleBlock[];
  onChange: (blocks: PickupScheduleBlock[]) => void;
}
```

**UI**:
- Lista de bloques existentes, cada uno con: input días (text), input hora inicio (time), input hora fin (time), botón eliminar (Trash2 icon)
- Botón "+ Agregar horario" debajo de la lista
- Se usa en `config-form.tsx` y `product-form.tsx`

### 5.3 `PickupScheduleDisplay` (nuevo)

Componente server-compatible para mostrar horarios.

**Props**:
```typescript
interface PickupScheduleDisplayProps {
  schedule: PickupScheduleBlock[];
}
```

**UI**:
- Ícono `Clock` + lista de bloques formateados: "Lunes a Viernes: 9:00 - 17:00"
- Se usa en `footer.tsx` y `product-modal.tsx`
- No renderiza nada si el array está vacío

---

## 6. Seguridad

- Sin cambios en el modelo de seguridad existente.
- Los endpoints admin siguen protegidos por `supabase.auth.getUser()`.
- RLS existente aplica automáticamente a la nueva columna JSONB.
- El campo `pickup_schedule` es un JSONB con estructura simple. No se almacena HTML ni contenido ejecutable.
- Los inputs de hora usan `<input type="time">` que limita el formato del lado del navegador.

---

## 7. Variables de Entorno

Sin cambios. No se requieren nuevas variables de entorno.

---

**Próximo paso**: Revisión y aprobación → Fase 3 (Plan de Implementación).
