# Spec Técnica — El Garaje de Vale

**Versión**: 1.0
**Fecha**: 2026-03-21
**Estado**: Aprobada
**Fecha de aprobación**: 2026-03-21
**Spec Funcional**: [01-spec-funcional.md](./01-spec-funcional.md) (Aprobada 2026-03-21)

---

## 1. Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| **Framework** | Next.js 15 (App Router) | Fullstack, SSR/SSG, deploy nativo en Vercel |
| **Lenguaje** | TypeScript | Type safety, menos bugs |
| **UI** | Tailwind CSS + shadcn/ui | Componentes customizables, rápido de estilizar |
| **Base de datos** | PostgreSQL (Supabase) | Relacional, robusto, gratis en tier free |
| **Auth** | Supabase Auth | Email/password, session management built-in |
| **Storage** | Supabase Storage | Imágenes de productos, integrado con la DB |
| **Hosting** | Vercel | Deploy automático, dominio custom, edge network |
| **ORM** | Supabase Client (JS SDK) | Queries tipadas, realtime opcional, zero config |

## 2. Arquitectura

```
┌─────────────────────────────────────────────────┐
│                    Vercel                         │
│  ┌─────────────────────────────────────────────┐ │
│  │            Next.js 15 (App Router)          │ │
│  │                                             │ │
│  │  /              → Catálogo público (SSR)    │ │
│  │  /admin         → Panel admin (CSR + Auth)  │ │
│  │  /api/*         → API Routes (Server)       │ │
│  └──────────────────┬──────────────────────────┘ │
└─────────────────────┼───────────────────────────┘
                      │ HTTPS
         ┌────────────▼────────────────┐
         │         Supabase            │
         │                             │
         │  ┌───────────┐ ┌─────────┐  │
         │  │ PostgreSQL │ │  Auth   │  │
         │  └───────────┘ └─────────┘  │
         │  ┌───────────┐              │
         │  │  Storage   │              │
         │  │ (imágenes) │              │
         │  └───────────┘              │
         └─────────────────────────────┘
```

### Rendering Strategy

| Ruta | Estrategia | Razón |
|------|-----------|-------|
| `/` (catálogo) | SSR (Server Components) | SEO no importa (noindex) pero queremos datos frescos |
| `/admin` | CSR (Client Components) | Interactividad completa, protegido por auth |
| `/admin/login` | CSR | Formulario de login |

## 3. Modelo de Datos

### 3.1 Tabla: `products`

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Identificador único |
| `name` | `varchar(100)` | NOT NULL | Nombre del producto |
| `description` | `text` | NOT NULL | Descripción completa |
| `price` | `decimal(10,2)` | NOT NULL, CHECK > 0 | Precio en USD |
| `category` | `varchar(50)` | NOT NULL | Categoría predefinida |
| `item_condition` | `varchar(20)` | NOT NULL | `new`, `like_new`, `used` |
| `sale_status` | `varchar(20)` | NOT NULL, DEFAULT `available` | `available`, `sold` |
| `delivery_method` | `varchar(20)` | NULL | `delivery`, `pickup`, `both`, NULL = hereda de tienda |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Fecha de creación |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Fecha de actualización |

**Índices**:
- `idx_products_category` en `category`
- `idx_products_sale_status` en `sale_status`
- `idx_products_price` en `price`

### 3.2 Tabla: `product_images`

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Identificador único |
| `product_id` | `uuid` | FK → products.id, ON DELETE CASCADE | Producto al que pertenece |
| `storage_path` | `text` | NOT NULL | Path en Supabase Storage |
| `url` | `text` | NOT NULL | URL pública de la imagen |
| `position` | `integer` | NOT NULL, DEFAULT 0 | Orden de la imagen (0 = principal) |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Fecha de creación |

**Índices**:
- `idx_product_images_product_id` en `product_id`

### 3.3 Tabla: `store_config`

Tabla de configuración clave-valor. Un solo registro (singleton).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `integer` | PK, DEFAULT 1, CHECK = 1 | Siempre 1 (singleton) |
| `store_name` | `varchar(100)` | NOT NULL, DEFAULT `'El Garaje de Vale'` | Nombre de la tienda |
| `whatsapp_number` | `varchar(20)` | NOT NULL | Número con código de país |
| `bank_name` | `varchar(100)` | | Nombre del banco |
| `bank_account_holder` | `varchar(100)` | | Titular de la cuenta |
| `bank_account_number` | `varchar(50)` | | Número de cuenta |
| `bank_account_type` | `varchar(20)` | | `savings`, `checking` |
| `delivery_method` | `varchar(20)` | NOT NULL, DEFAULT `'both'` | `delivery`, `pickup`, `both` |
| `pickup_address` | `text` | | Dirección/zona de recogida |
| `pickup_map_url` | `text` | | URL de Google Maps embed |
| `whatsapp_message_general` | `text` | | Mensaje genérico del FAB |
| `whatsapp_message_product` | `text` | | Template: `{nombre}`, `{precio}` |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Última actualización |

## 4. Supabase Storage

### Bucket: `product-images`

- **Acceso**: público (las imágenes del catálogo deben ser accesibles sin auth).
- **Políticas RLS**:
  - SELECT: público (cualquiera puede ver).
  - INSERT/UPDATE/DELETE: solo usuarios autenticados.
- **Formato**: aceptar `image/jpeg`, `image/png`, `image/webp`.
- **Tamaño máximo**: 5MB por imagen.
- **Naming**: `{product_id}/{uuid}.{ext}` para organizar por producto.

## 5. Autenticación

- **Proveedor**: Supabase Auth con email/password.
- **Único usuario admin**: se crea manualmente en Supabase Dashboard o via seed script.
- **Protección de rutas**:
  - Middleware de Next.js verifica sesión en todas las rutas `/admin/*`.
  - Si no hay sesión → redirect a `/admin/login`.
  - Las API routes de admin verifican sesión server-side.
- **Sesión**: manejada por `@supabase/ssr` con cookies httpOnly.

## 6. API Routes (Server Actions / Route Handlers)

### Productos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/products` | No | Lista productos con filtros (categoría, estado) |
| GET | `/api/products/[id]` | No | Detalle de un producto con imágenes |
| POST | `/api/admin/products` | Sí | Crear producto |
| PUT | `/api/admin/products/[id]` | Sí | Editar producto |
| DELETE | `/api/admin/products/[id]` | Sí | Eliminar producto |
| PATCH | `/api/admin/products/[id]/status` | Sí | Cambiar estado de venta |

### Imágenes

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/admin/products/[id]/images` | Sí | Subir imagen(es) |
| DELETE | `/api/admin/images/[id]` | Sí | Eliminar imagen |
| PATCH | `/api/admin/products/[id]/images/reorder` | Sí | Reordenar imágenes |

### Configuración

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/config` | No | Obtener config de la tienda (datos públicos) |
| PUT | `/api/admin/config` | Sí | Actualizar configuración |

### Auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Login con email/password |
| POST | `/api/auth/logout` | Sí | Cerrar sesión |

## 7. Estructura del Proyecto

```
garage-sale/
├── docs/                          # Specs y documentación
├── public/                        # Assets estáticos
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Layout raíz (meta noindex)
│   │   ├── page.tsx               # Catálogo público (SSR)
│   │   ├── admin/
│   │   │   ├── layout.tsx         # Layout admin (auth check)
│   │   │   ├── login/
│   │   │   │   └── page.tsx       # Login page
│   │   │   ├── products/
│   │   │   │   ├── page.tsx       # Lista de productos
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx   # Crear producto
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx # Editar producto
│   │   │   └── config/
│   │   │       └── page.tsx       # Configuración de tienda
│   │   └── api/
│   │       ├── products/
│   │       ├── admin/
│   │       ├── config/
│   │       └── auth/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── catalog/
│   │   │   ├── product-grid.tsx   # Grid de productos
│   │   │   ├── product-card.tsx   # Card individual
│   │   │   ├── product-modal.tsx  # Modal de detalle
│   │   │   ├── category-filter.tsx # Filtro de categorías
│   │   │   └── image-carousel.tsx # Carrusel de imágenes
│   │   ├── layout/
│   │   │   ├── header.tsx         # Header
│   │   │   ├── footer.tsx         # Footer con banco + mapa
│   │   │   └── whatsapp-fab.tsx   # Botón flotante WhatsApp
│   │   └── admin/
│   │       ├── product-form.tsx   # Formulario crear/editar
│   │       ├── product-table.tsx  # Tabla de productos
│   │       ├── image-upload.tsx   # Upload de imágenes
│   │       └── config-form.tsx    # Formulario de config
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Supabase browser client
│   │   │   ├── server.ts          # Supabase server client
│   │   │   └── middleware.ts      # Auth middleware helper
│   │   ├── types.ts               # Tipos TypeScript
│   │   └── constants.ts           # Categorías, enums
│   └── middleware.ts              # Next.js middleware (auth)
├── supabase/
│   └── migrations/                # SQL migrations
│       └── 001_initial_schema.sql
├── .env.local                     # Variables de entorno (local)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 8. Seguridad

### Row Level Security (RLS) — Supabase

```sql
-- products: lectura pública, escritura solo auth
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON products FOR SELECT USING (true);
CREATE POLICY "Admin write" ON products FOR ALL USING (auth.role() = 'authenticated');

-- product_images: misma política
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON product_images FOR SELECT USING (true);
CREATE POLICY "Admin write" ON product_images FOR ALL USING (auth.role() = 'authenticated');

-- store_config: lectura pública, escritura solo auth
ALTER TABLE store_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON store_config FOR SELECT USING (true);
CREATE POLICY "Admin write" ON store_config FOR ALL USING (auth.role() = 'authenticated');
```

### Headers de seguridad (Next.js)

```typescript
// next.config.ts
headers: [
  {
    source: '/(.*)',
    headers: [
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
    ],
  },
]
```

### Meta tags

```html
<meta name="robots" content="noindex, nofollow" />
```

## 9. Variables de Entorno

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Solo server-side, nunca exponer

# App
NEXT_PUBLIC_APP_URL=https://elagarajedevale.com
```

## 10. Paleta de Colores y Diseño

### Colores (Nude/Pastel)

```css
/* tailwind.config.ts - custom colors */
colors: {
  brand: {
    50:  '#FDF8F5',  /* Fondo principal - crema muy claro */
    100: '#F9EDE5',  /* Fondo cards */
    200: '#F0D9CC',  /* Bordes suaves */
    300: '#E5BFA8',  /* Acentos secundarios */
    400: '#D4A088',  /* Hover states */
    500: '#C4836A',  /* Acentos principales */
    600: '#A8644E',  /* Texto destacado */
    700: '#8B4F3B',  /* Texto principal oscuro */
    800: '#6E3C2D',  /* Headers */
    900: '#512A1F',  /* Texto máximo contraste */
  }
}
```

### Tipografía

- **Headings**: `Inter` o `Poppins` (clean, moderna).
- **Body**: `Inter` (legible, neutra).
- Importar via `next/font/google`.

### Diseño General

- Layout max-width: `1280px`, centrado.
- Grid de productos: 2 columnas mobile, 3 tablet, 4 desktop.
- Espaciado generoso (padding/gaps amplios).
- Bordes redondeados (`rounded-xl`).
- Sombras suaves (`shadow-sm`).
- Transiciones suaves en hover.

## 11. Google Maps Embed

```html
<!-- Formato del iframe (gratuito, sin API key) -->
<iframe
  src="https://www.google.com/maps/embed?pb=!1m18!..."
  width="100%"
  height="300"
  style="border:0;"
  allowfullscreen=""
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade">
</iframe>
```

- El admin pega la URL completa del embed de Google Maps.
- Se renderiza como iframe en footer y modal.

## 12. Deploy y Dominio

### Vercel

1. Conectar repo de GitHub a Vercel.
2. Configurar variables de entorno en Vercel Dashboard.
3. Deploy automático en cada push a `main`.

### Dominio

1. Comprar `elagarajedevale.com` (Namecheap, GoDaddy, Google Domains, etc.).
2. Configurar DNS apuntando a Vercel.
3. Vercel gestiona SSL automáticamente.

## 13. Dependencias Principales

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "tailwindcss": "^4.x",
    "class-variance-authority": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "lucide-react": "^0.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^19.x",
    "@types/node": "^22.x"
  }
}
```

---

**Próximo paso**: Revisión y aprobación → Fase 3 (Plan de Implementación).
