# Plan de Implementación — El Garaje de Vale

**Versión**: 1.0
**Fecha**: 2026-03-21
**Estado**: Aprobada
**Fecha de aprobación**: 2026-03-21
**Objetivo**: MVP funcional en 2 días

---

## Iteraciones

El plan se divide en 4 iteraciones secuenciales. Cada una produce un entregable funcional.

---

## Iteración 1: Fundación (Base del proyecto)

**Objetivo**: Proyecto corriendo localmente con DB lista y auth funcional.

### Tarea 1.1 — Scaffolding del proyecto
- Inicializar Next.js 15 con App Router + TypeScript.
- Instalar dependencias: Supabase SDK, Tailwind CSS, shadcn/ui, lucide-react, zod.
- Configurar `tailwind.config.ts` con la paleta de colores nude/pastel.
- Configurar `next.config.ts` con headers de seguridad (noindex, X-Frame-Options, etc.).
- Configurar tipografía (Inter via `next/font/google`).
- Crear estructura de carpetas según spec técnica.
- **Entregable**: `npm run dev` funciona, página en blanco con estilos aplicados.

### Tarea 1.2 — Supabase: proyecto y esquema de DB
- Crear proyecto en Supabase (o usar existente).
- Crear migration `001_initial_schema.sql`:
  - Tabla `products` con índices.
  - Tabla `product_images` con FK y índices.
  - Tabla `store_config` (singleton).
  - Políticas RLS para las 3 tablas.
  - Insert del registro inicial de `store_config` con valores default.
- Crear bucket `product-images` en Supabase Storage con políticas.
- Configurar `.env.local` con credenciales de Supabase.
- **Entregable**: DB con tablas creadas, RLS activo, storage listo.

### Tarea 1.3 — Supabase clients + Auth
- Crear `lib/supabase/client.ts` (browser client).
- Crear `lib/supabase/server.ts` (server client con cookies).
- Crear `middleware.ts` de Next.js para proteger rutas `/admin/*`.
- Crear página `/admin/login` con formulario email/password.
- Crear usuario admin manualmente en Supabase Dashboard (o via seed).
- Implementar login/logout con Supabase Auth.
- **Entregable**: Login funcional, rutas admin protegidas.

### Tarea 1.4 — Tipos y constantes
- Crear `lib/types.ts`: tipos de Product, ProductImage, StoreConfig.
- Crear `lib/constants.ts`: categorías predefinidas, estados, métodos de entrega.
- **Entregable**: Tipos TypeScript listos para usar en toda la app.

**Dependencias**: Ninguna (primera iteración).

---

## Iteración 2: Panel Administrativo

**Objetivo**: Admin puede gestionar productos y configuración.

### Tarea 2.1 — Layout del admin
- Crear `admin/layout.tsx` con sidebar/navbar simple.
- Navegación: Productos, Configuración, Cerrar sesión.
- Estilo limpio, funcional (no necesita la paleta pastel, puede ser neutro).
- **Entregable**: Layout admin navegable.

### Tarea 2.2 — CRUD de productos (sin imágenes)
- **Lista de productos** (`admin/products/page.tsx`):
  - Tabla con columnas: nombre, precio, categoría, estado de venta, método de entrega, fecha.
  - Acción rápida: toggle estado vendido/disponible.
  - Botones: editar, eliminar (con confirmación).
- **Crear producto** (`admin/products/new/page.tsx`):
  - Formulario con validación (zod): nombre, descripción, precio, categoría, estado artículo, estado venta, método entrega.
  - Guardar en DB via Server Action o API route.
- **Editar producto** (`admin/products/[id]/edit/page.tsx`):
  - Mismo formulario pre-llenado con datos existentes.
- **Eliminar producto**: dialog de confirmación → delete cascade (imágenes incluidas).
- API routes: POST, PUT, DELETE, PATCH (status).
- **Entregable**: CRUD completo de productos sin imágenes.

### Tarea 2.3 — Upload y gestión de imágenes
- Componente `image-upload.tsx`:
  - Drag & drop o click para seleccionar.
  - Preview de imágenes antes de subir.
  - Subida a Supabase Storage.
  - Reordenar imágenes (drag para cambiar posición, primera = principal).
  - Eliminar imagen individual.
- Integrar en formulario de crear/editar producto.
- API routes para imágenes.
- **Entregable**: Productos con imágenes funcional.

### Tarea 2.4 — Configuración de la tienda
- Página `admin/config/page.tsx`:
  - Formulario con todos los campos de `store_config`.
  - Validación con zod.
  - Preview del mapa de Google Maps al pegar URL.
- API route PUT para actualizar config.
- **Entregable**: Configuración editable y persistente.

**Dependencias**: Iteración 1 completada.

---

## Iteración 3: Catálogo Público

**Objetivo**: Visitantes pueden ver productos y contactar por WhatsApp.

### Tarea 3.1 — Layout público
- `app/layout.tsx`: meta tags noindex, tipografía, colores.
- `components/layout/header.tsx`: nombre de la tienda (desde config), espacio para logo futuro.
- `components/layout/footer.tsx`:
  - Datos bancarios (desde config).
  - Dirección de recogida.
  - Mapa de Google Maps embebido.
  - Texto "Coordinamos la entrega por WhatsApp".
- `components/layout/whatsapp-fab.tsx`: botón flotante con link wa.me.
- **Entregable**: Layout completo con header, footer y FAB.

### Tarea 3.2 — Grid de productos
- `app/page.tsx`: Server Component que trae productos de Supabase.
- `components/catalog/product-grid.tsx`: grid responsive (2/3/4 cols).
- `components/catalog/product-card.tsx`:
  - Imagen principal, nombre, precio, badge categoría.
  - Badge "VENDIDO" con opacidad si aplica.
  - Hover effect suave.
- `components/catalog/category-filter.tsx`: filtro por categoría (tabs o select).
- Filtro por estado: toggle "Disponibles" / "Todos".
- Orden por precio ascendente.
- **Entregable**: Catálogo navegable con filtros.

### Tarea 3.3 — Modal de detalle
- `components/catalog/product-modal.tsx`:
  - Se abre al hacer clic en card.
  - Carrusel de imágenes (`image-carousel.tsx`).
  - Info completa: nombre, descripción, precio, categoría, estado artículo, estado venta.
  - Método de entrega con icono/badge.
  - Mapa de Google Maps (si incluye recogida).
  - Botón "Preguntar por este producto" → link wa.me con mensaje pre-llenado.
  - Botón oculto si producto vendido.
  - Cerrar con X, clic fuera, o Escape.
- **Entregable**: Modal funcional con toda la info.

### Tarea 3.4 — Responsive y polish
- Verificar responsive en mobile, tablet, desktop.
- Ajustar espaciados, tipografía, colores.
- Transiciones y animaciones suaves (modal open/close, hover).
- Loading states (skeleton loaders).
- Empty states (sin productos, sin productos en categoría).
- **Entregable**: UI pulida y responsive.

**Dependencias**: Iteración 1 + Iteración 2 (necesitamos productos para mostrar).

---

## Iteración 4: Deploy y Datos Iniciales

**Objetivo**: App en producción con dominio.

### Tarea 4.1 — Preparar para producción
- Verificar todas las variables de entorno.
- Verificar RLS policies en Supabase.
- Optimizar imágenes (next/image con Supabase URLs).
- Verificar meta noindex en todas las páginas.
- Verificar headers de seguridad.
- **Entregable**: Checklist de producción completo.

### Tarea 4.2 — Deploy en Vercel
- Crear repo en GitHub (privado).
- Conectar a Vercel.
- Configurar variables de entorno en Vercel.
- Deploy inicial.
- **Entregable**: App corriendo en URL de Vercel.

### Tarea 4.3 — Dominio y DNS
- Configurar dominio custom en Vercel.
- Configurar DNS.
- Verificar SSL.
- **Entregable**: App accesible en `elagarajedevale.com`.

### Tarea 4.4 — Datos iniciales
- Crear usuario admin en Supabase.
- Configurar datos de la tienda (banco, WhatsApp, dirección, mapa).
- Subir primeros productos de prueba.
- Test E2E manual: flujo completo visitante + admin.
- **Entregable**: MVP listo para compartir el link.

**Dependencias**: Iteraciones 1-3 completadas.

---

## Cronograma Estimado (2 días)

| Día | Iteraciones | Foco |
|-----|-------------|------|
| **Día 1** | Iteración 1 + Iteración 2 | Fundación + Admin completo |
| **Día 2** | Iteración 3 + Iteración 4 | Catálogo público + Deploy |

---

## Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Supabase Storage lento para imágenes | Usar `next/image` con optimización automática |
| Tiempo insuficiente para polish UI | Priorizar funcionalidad sobre estética, iterar después |
| Dominio no propagado a tiempo | Usar URL temporal de Vercel mientras propaga |
| Google Maps embed no funciona | Fallback a link externo "Ver en Google Maps" |

---

**Próximo paso**: Revisión y aprobación → Fase 4 (Implementación).
