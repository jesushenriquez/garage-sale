# Spec Técnica — Nota de Bienvenida

**Versión**: 1.0
**Fecha**: 2026-03-21
**Estado**: Aprobada
**Fecha de aprobación**: 2026-03-21
**Spec Funcional**: [01-spec-funcional.md](./01-spec-funcional.md)

---

## 1. Stack Tecnológico

Sin cambios al stack existente. Se reutilizan las mismas herramientas:

- **Next.js 15** (App Router) — Server Components + Client Components
- **Supabase** — PostgreSQL, Storage (bucket `product-images` reutilizado con prefijo `welcome/`), Auth
- **Tailwind CSS 4** — paleta brand existente
- **Lucide React** — iconografía (ya incluida en el proyecto)
- **localStorage** — persistencia del flag `welcome_seen` en el navegador

## 2. Arquitectura

### Flujo de datos

```
┌─────────────────────────────────────────────────────────┐
│ page.tsx (Server Component)                             │
│  ├── Fetch store_config (incluye welcome_*)             │
│  ├── Fetch welcome_images                               │
│  └── Pasa datos como props                              │
│       ├── Header ← welcomeTitle, welcomeMessage,        │
│       │            welcomeImages, hasWelcome             │
│       └── WelcomeModal ← title, message, images         │
│            (client: lee localStorage, decide si mostrar) │
└─────────────────────────────────────────────────────────┘
```

### Decisiones clave

| Decisión | Elección | Razón |
|----------|----------|-------|
| Almacenamiento de imágenes | Tabla `welcome_images` + bucket `product-images` con prefijo `welcome/` | Consistente con el patrón de `product_images`. Reutilizar el bucket evita configurar uno nuevo en Supabase. |
| Campos de texto | Columnas en `store_config` | Es parte de la configuración de la tienda, no una entidad separada. |
| Visibilidad del modal | `localStorage` | Suficiente para el caso de uso. No requiere auth ni backend. |
| Datos al modal | Server-side fetch → props | El contenido se obtiene en el server y se pasa como props. El client solo decide si mostrar o no. |

## 3. Modelo de Datos

### 3.1 Migración: Nuevas columnas en `store_config`

```sql
-- supabase/migrations/002_welcome_note.sql

ALTER TABLE store_config
  ADD COLUMN welcome_title VARCHAR(200),
  ADD COLUMN welcome_message TEXT;
```

### 3.2 Nueva tabla: `welcome_images`

```sql
CREATE TABLE welcome_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: public read, authenticated write
ALTER TABLE welcome_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read welcome_images" ON welcome_images
  FOR SELECT USING (true);
CREATE POLICY "Auth insert welcome_images" ON welcome_images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update welcome_images" ON welcome_images
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete welcome_images" ON welcome_images
  FOR DELETE USING (auth.role() = 'authenticated');
```

### 3.3 Tipos TypeScript

```typescript
// Agregar a StoreConfig en lib/types.ts
export interface StoreConfig {
  // ... campos existentes ...
  welcome_title: string | null;
  welcome_message: string | null;
}

// Nueva interfaz
export interface WelcomeImage {
  id: string;
  storage_path: string;
  url: string;
  position: number;
  created_at: string;
}
```

## 4. API / Endpoints

### 4.1 Endpoints existentes modificados

**`PUT /api/admin/config`** — Agregar `welcome_title` y `welcome_message` al body y al update query. Sin cambios en autenticación ni estructura.

### 4.2 Endpoints nuevos

**`POST /api/admin/welcome-images`** — Upload de imágenes de bienvenida

- Auth: `supabase.auth.getUser()` requerido
- Body: `FormData` con campo `files` (múltiples archivos)
- Storage path: `welcome/{uuid}.{ext}` en bucket `product-images`
- Inserta registros en `welcome_images` con position incremental
- Response: `201` con array de registros creados

**`DELETE /api/admin/welcome-images/[id]`** — Eliminar imagen de bienvenida

- Auth: `supabase.auth.getUser()` requerido
- Elimina archivo de Storage + registro de tabla
- Response: `200` con `{ success: true }`

### 4.3 Endpoint público existente

**`GET /api/config`** — Ya retorna `store_config`. Las nuevas columnas se incluyen automáticamente por el `select("*")` existente. No requiere cambios.

## 5. Componentes

### 5.1 Nuevos componentes

**`src/components/catalog/welcome-modal.tsx`** (client component)
- Props: `title`, `message`, `images: WelcomeImage[]`
- Estado: `visible` (boolean, basado en localStorage)
- Al montar: verifica `localStorage.getItem("welcome_seen")`
  - Si no existe y hay contenido → muestra modal
  - Si existe → no muestra
- Render: overlay full-screen con fondo semi-transparente brand
- Contenido centrado: imagen(es), título, mensaje, botón "Ver productos"
- Al cerrar: `localStorage.setItem("welcome_seen", "true")`, animación fade out
- Accesibilidad: `role="dialog"`, `aria-modal="true"`, focus trap

**`src/components/admin/welcome-image-upload.tsx`** (client component)
- Similar a `ImageUpload` existente pero para welcome images
- Usa endpoints `POST /api/admin/welcome-images` y `DELETE /api/admin/welcome-images/[id]`
- Acepta JPG, PNG, WebP. Máximo 5MB por imagen.

### 5.2 Componentes modificados

**`src/components/layout/header.tsx`**
- Agregar prop: `welcomeConfig?: { title, message, images }`
- Si hay contenido de bienvenida → mostrar ícono de sobre con corazón (Lucide: `MailHeart` o `Heart` + `Mail`)
- Al click → abre WelcomeModal (estado compartido o render condicional)
- El Header pasa de ser server component a client component (necesita useState para toggle del modal), o se extrae el ícono como un componente client separado.

**`src/components/admin/config-form.tsx`**
- Agregar sección "Nota de Bienvenida" con campos: título (input), mensaje (textarea)
- Incluir componente `WelcomeImageUpload` debajo de los campos de texto

**`src/app/page.tsx`**
- Agregar fetch de `welcome_images` en el Promise.all existente
- Pasar `welcomeConfig` al Header y renderizar WelcomeModal con los datos

**`src/lib/types.ts`**
- Agregar campos `welcome_title`, `welcome_message` a `StoreConfig`
- Agregar interfaz `WelcomeImage`

### 5.3 Estructura del modal (diseño)

```
┌──────────────────────────────────────────┐
│  (overlay semi-transparente brand-900/60)│
│                                          │
│  ┌────────────────────────────────────┐  │
│  │                                    │  │
│  │    [Imagen(es) de Vale]            │  │
│  │                                    │  │
│  │    ─────────────────────           │  │
│  │                                    │  │
│  │    Hola, soy Vale 👋              │  │
│  │                                    │  │
│  │    Mensaje personal de Vale...     │  │
│  │    ...varias líneas posibles...    │  │
│  │                                    │  │
│  │    ┌──────────────────────────┐    │  │
│  │    │     Ver productos  →     │    │  │
│  │    └──────────────────────────┘    │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘
```

- Fondo: `bg-brand-900/60` con `backdrop-blur-sm`
- Card: `bg-brand-50` con `rounded-2xl`, padding generoso
- Título: `text-brand-800`, font bold, tamaño grande
- Mensaje: `text-brand-700`, line-height relajado, whitespace pre-line (para respetar saltos de línea)
- Botón: `bg-brand-600 hover:bg-brand-700 text-white`, rounded, con icono de flecha
- Imágenes: rounded, aspect ratio auto, max-height controlado
- Animaciones: fade-in al aparecer, fade-out al cerrar (CSS transitions o Tailwind animate)

## 6. Seguridad

- **Admin endpoints**: Todos verifican `supabase.auth.getUser()` antes de proceder (patrón existente).
- **RLS**: `welcome_images` con public read + authenticated write (idéntico a `product_images`).
- **Storage**: Archivos en bucket `product-images` con path `welcome/`. El bucket ya tiene política pública de lectura.
- **localStorage**: Solo guarda un flag booleano, no datos sensibles.
- **XSS**: El mensaje se renderiza como texto plano (no `dangerouslySetInnerHTML`). Los saltos de línea se manejan con `whitespace-pre-line`.

## 7. Variables de Entorno

Sin nuevas variables de entorno. Se reutilizan las existentes:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

**Próximo paso**: Revisión y aprobación → Fase 3 (Plan de Implementación).
