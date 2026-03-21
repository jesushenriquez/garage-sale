# Spec Técnica — Footer y Configuración: Mejoras

**Versión**: 1.0
**Fecha**: 2026-03-21
**Estado**: Aprobada
**Fecha de aprobación**: 2026-03-21
**Spec Funcional**: [01-spec-funcional.md](./01-spec-funcional.md)

---

## 1. Stack Tecnológico

Sin cambios al stack existente. Se usa lo que ya tiene el proyecto:
- Next.js 15 (App Router)
- Supabase (PostgreSQL + Auth)
- Tailwind CSS 4
- TypeScript

## 2. Arquitectura

Sigue el patrón existente:
- Nuevos campos en `store_config` → se exponen vía `/api/config` (GET público) y se actualizan vía `/api/admin/config` (PUT autenticado).
- Nuevos campos en `products` → se exponen en las queries existentes de productos y se actualizan vía `/api/admin/products/[id]` (PUT autenticado).
- El footer y el product-modal consumen los datos desde server-side props (ya existente).

No se crean nuevos endpoints ni rutas.

## 3. Modelo de Datos

### 3.1 Migración: `store_config` — nuevos campos

```sql
-- 003_footer_config_mejoras.sql

-- Datos de transferencia
ALTER TABLE store_config ADD COLUMN document_type VARCHAR(20) DEFAULT NULL
  CHECK (document_type IN ('cedula', 'ruc', 'pasaporte'));
ALTER TABLE store_config ADD COLUMN document_number VARCHAR(50) DEFAULT NULL;
ALTER TABLE store_config ADD COLUMN contact_email VARCHAR(150) DEFAULT NULL;

-- Sección de contacto del footer
ALTER TABLE store_config ADD COLUMN footer_contact_text TEXT DEFAULT NULL;
ALTER TABLE store_config ADD COLUMN footer_show_whatsapp BOOLEAN DEFAULT false;
```

### 3.2 Migración: `products` — campos de recogida personalizada

```sql
-- En la misma migración 003

ALTER TABLE products ADD COLUMN pickup_address TEXT DEFAULT NULL;
ALTER TABLE products ADD COLUMN pickup_map_url TEXT DEFAULT NULL;
```

### 3.3 Tipos TypeScript actualizados

```typescript
// Nuevo tipo
type DocumentType = "cedula" | "ruc" | "pasaporte";

// StoreConfig — agregar campos
interface StoreConfig {
  // ... campos existentes ...
  document_type: DocumentType | null;
  document_number: string | null;
  contact_email: string | null;
  footer_contact_text: string | null;
  footer_show_whatsapp: boolean;
}

// Product — agregar campos
interface Product {
  // ... campos existentes ...
  pickup_address: string | null;
  pickup_map_url: string | null;
}
```

### 3.4 Constantes nuevas

```typescript
const DOCUMENT_TYPES = {
  cedula: "Cédula de Identidad",
  ruc: "RUC",
  pasaporte: "Pasaporte",
};
```

### 3.5 Fix de constante existente

```typescript
// Antes
both: "Domicilio o recoger en lugar"
// Después
both: "A domicilio o recoger en lugar"
```

## 4. API / Endpoints

No se crean endpoints nuevos. Se modifican los existentes:

### PUT `/api/admin/config`
Agregar los nuevos campos al body aceptado y al UPDATE:
- `document_type`, `document_number`, `contact_email`
- `footer_contact_text`, `footer_show_whatsapp`

**Validación server-side**: Si `document_number` tiene valor pero `document_type` es null → error 400.

### GET `/api/config`
Sin cambios en código — ya retorna `SELECT *` de `store_config`, los campos nuevos se incluyen automáticamente.

### PUT `/api/admin/products/[id]`
Agregar los nuevos campos al body aceptado y al UPDATE:
- `pickup_address`, `pickup_map_url`

### GET `/api/products` y queries de productos
Sin cambios en código — ya retornan todos los campos del producto.

## 5. Componentes

### 5.1 `footer.tsx` — Modificaciones

**Sección "Datos para transferencia"** (renombrar de "Datos bancarios"):
- Agregar renderizado condicional de: tipo + número de documento, correo electrónico.
- Mantener datos bancarios existentes en la misma sección.

**Sección "Contacto"**:
- Reemplazar texto hardcodeado por `config.footer_contact_text`.
- Si `footer_show_whatsapp` es true, renderizar botón/enlace de WhatsApp que redirige a `wa.me/{config.whatsapp_number}`.
- Si no hay texto ni WhatsApp habilitado, ocultar la sección.

### 5.2 `config-form.tsx` — Modificaciones

**Sección "Datos bancarios"** → renombrar a **"Datos para transferencia"**:
- Agregar: select de tipo de documento, input de número de documento, input de correo electrónico.
- Validación client-side: si hay número de documento, tipo de documento es requerido.

**Nueva sección "Contacto en footer"** (o agregar a sección existente):
- Textarea para `footer_contact_text`.
- Checkbox/toggle para `footer_show_whatsapp` con label "Mostrar botón de WhatsApp".

### 5.3 `product-modal.tsx` — Modificaciones

En la sección de entrega/recogida:
- Si el producto tiene `pickup_address` propio, usar ese en vez de `config.pickup_address`.
- Si el producto tiene `pickup_map_url` propio, usar ese en vez de `config.pickup_map_url`.

### 5.4 Formulario de producto (admin) — Modificaciones

- Agregar campos condicionales (visibles cuando delivery_method incluye pickup):
  - `pickup_address` (textarea)
  - `pickup_map_url` (input con preview de iframe)

## 6. Seguridad

- Los nuevos campos siguen las mismas políticas RLS existentes: lectura pública, escritura solo autenticado.
- El correo electrónico se muestra públicamente en el footer (decisión del admin al configurarlo).
- El número de WhatsApp NO se muestra en texto en el footer; solo se usa para el enlace `wa.me`.
- No se almacenan datos sensibles adicionales.

## 7. Variables de Entorno

Sin cambios. No se requieren nuevas variables de entorno.

---

**Próximo paso**: Revisión y aprobación → Fase 3 (Plan de Implementación).
