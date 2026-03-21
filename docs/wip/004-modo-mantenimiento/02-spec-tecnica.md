# Spec Técnica — Modo Mantenimiento

**Versión**: 1.0
**Fecha**: 2026-03-21
**Estado**: Aprobada
**Fecha de aprobación**: 2026-03-21
**Spec Funcional**: [01-spec-funcional.md](./01-spec-funcional.md)

---

## 1. Stack Tecnológico

Sin dependencias nuevas. Se reutiliza el stack existente:
- Next.js 15 (App Router, middleware)
- Supabase (PostgreSQL, RLS)
- Tailwind CSS 4 (paleta brand existente)

## 2. Arquitectura

### Flujo de detección del modo mantenimiento

```
Visitante → Request a ruta pública
  → Middleware (matcher ampliado)
    → Consulta store_config.maintenance_mode en Supabase
    → Si activo: rewrite a /maintenance (página estática con mensaje)
    → Si inactivo: continúa flujo normal
```

### Decisiones de diseño

1. **Middleware como punto de intercepción**: Se amplía el matcher del middleware actual para cubrir también las rutas públicas. Esto garantiza que cualquier ruta pública (actual o futura) sea interceptada sin necesidad de agregar lógica en cada page.

2. **Rewrite, no redirect**: Se usa `NextResponse.rewrite()` hacia `/maintenance` en lugar de redirect. Así el visitante ve la URL original y no una URL `/maintenance` que podría ser confusa.

3. **Consulta directa a Supabase**: La tabla `store_config` es singleton (1 fila). La consulta es mínima y Supabase tiene connection pooling. Para el volumen de tráfico de este sitio, no se necesita caché adicional.

4. **Rutas excluidas del chequeo de mantenimiento**:
   - `/admin/*` — el admin panel siempre accesible
   - `/api/*` — las API routes no se bloquean
   - `/_next/*`, archivos estáticos — recursos del framework

## 3. Modelo de Datos

### Migración: `store_config`

Agregar dos columnas a la tabla existente:

```sql
ALTER TABLE store_config
  ADD COLUMN maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN maintenance_message TEXT DEFAULT 'Estamos realizando mejoras. Volvemos pronto.';
```

**Archivo**: `supabase/migrations/004_maintenance_mode.sql`

No se requieren cambios en RLS (las políticas existentes ya permiten lectura pública y escritura autenticada).

### Tipo TypeScript actualizado

Agregar a `StoreConfig` en `lib/types.ts`:

```typescript
maintenance_mode: boolean;
maintenance_message: string | null;
```

## 4. API / Endpoints

### `PUT /api/admin/config`

Agregar los nuevos campos al update existente:

```typescript
maintenance_mode: body.maintenance_mode ?? false,
maintenance_message: body.maintenance_message,
```

No se crean endpoints nuevos. La API de config existente ya maneja la lectura (`GET /api/config`) y escritura (`PUT /api/admin/config`) del singleton.

## 5. Componentes

### 5.1 Página de mantenimiento

**Ruta**: `src/app/maintenance/page.tsx` (Server Component)

- Consulta `store_config` para obtener el mensaje de mantenimiento.
- Renderiza una página centrada con:
  - Icono de herramientas/construcción (Lucide React, ya disponible en el proyecto como dependencia de shadcn).
  - Mensaje de mantenimiento del config.
  - Estilo coherente con la paleta brand (fondo `brand-50`, texto `brand-800`, icono `brand-400`).
- No incluye header, footer, ni navegación.

### 5.2 Middleware actualizado

**Archivo**: `src/middleware.ts`

Cambios:
- Ampliar el matcher para incluir todas las rutas (excluyendo `_next`, archivos estáticos, `api`).
- Antes de la lógica de admin auth, verificar si la ruta es pública.
- Si es pública, consultar `maintenance_mode` en `store_config`.
- Si está activo, hacer rewrite a `/maintenance`.

```typescript
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

Lógica condicional:
- Si la ruta empieza con `/admin` → flujo existente (auth).
- Si la ruta empieza con `/api` → pasar sin chequeo.
- Si la ruta es `/maintenance` → pasar sin chequeo (evitar loop).
- Cualquier otra ruta → consultar `maintenance_mode` → rewrite si activo.

### 5.3 Toggle en admin config

**Archivo**: Componente `ConfigForm` existente.

Agregar una sección "Modo Mantenimiento" con:
- Toggle/switch para `maintenance_mode`.
- Campo de texto para `maintenance_message` (visible solo cuando el toggle está desactivado o siempre visible, para poder editar antes de activar).
- Al cambiar el toggle, mostrar diálogo de confirmación antes de hacer el PUT.

El diálogo de confirmación será un modal simple (se puede usar el patrón de confirm dialog que ya exista en el proyecto, o un `window.confirm` como primera implementación).

## 6. Seguridad

- **Sin cambios en RLS**: Las políticas existentes de `store_config` ya cubren lectura pública y escritura autenticada.
- **Middleware**: La consulta de `maintenance_mode` usa el cliente anónimo de Supabase (lectura pública permitida por RLS).
- **Admin API**: La protección existente (`getUser()` check) ya cubre los nuevos campos.
- **Sin bypass**: No hay forma de evadir el modo mantenimiento en rutas públicas (todo pasa por middleware).

## 7. Variables de Entorno

No se requieren variables de entorno nuevas.

---

**Próximo paso**: Revisión y aprobación → Fase 3 (Plan de Implementación).
