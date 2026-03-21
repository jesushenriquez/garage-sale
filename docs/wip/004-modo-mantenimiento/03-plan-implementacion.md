# Plan de Implementación — Modo Mantenimiento

**Versión**: 1.0
**Fecha**: 2026-03-21
**Estado**: Aprobada
**Fecha de aprobación**: 2026-03-21

---

## Iteraciones

### Iteración 1: Base de datos y tipos
**Objetivo**: Agregar los campos de mantenimiento al modelo de datos.

#### Tareas
- [ ] 1.1 Crear migración `supabase/migrations/004_maintenance_mode.sql` con `maintenance_mode` (BOOLEAN, default false) y `maintenance_message` (TEXT, con mensaje por defecto)
- [ ] 1.2 Actualizar `StoreConfig` en `lib/types.ts` con los nuevos campos
- [ ] 1.3 Actualizar `PUT /api/admin/config` para incluir `maintenance_mode` y `maintenance_message` en el update

**Entregable**: Los nuevos campos existen en BD, tipos y API.

### Iteración 2: Página de mantenimiento
**Objetivo**: Crear la página visual que verán los visitantes.

#### Tareas
- [ ] 2.1 Crear `src/app/maintenance/page.tsx` — Server Component que lee `store_config` y renderiza el mensaje con icono y estilo brand

**Entregable**: Página de mantenimiento accesible en `/maintenance`.

### Iteración 3: Middleware
**Objetivo**: Interceptar rutas públicas cuando el modo mantenimiento está activo.

#### Tareas
- [ ] 3.1 Ampliar el matcher en `src/middleware.ts` para cubrir todas las rutas (excepto `_next`, estáticos, `api`)
- [ ] 3.2 Agregar lógica condicional: si ruta es pública y `maintenance_mode` es true, hacer rewrite a `/maintenance`
- [ ] 3.3 Mantener la lógica existente de auth para rutas `/admin/*` sin cambios

**Entregable**: Visitantes ven la página de mantenimiento cuando el modo está activo.

### Iteración 4: Admin — Toggle y configuración
**Objetivo**: Permitir al administrador activar/desactivar el modo y editar el mensaje.

#### Tareas
- [ ] 4.1 Agregar sección "Modo Mantenimiento" al `ConfigForm` con toggle switch y campo de mensaje
- [ ] 4.2 Implementar diálogo de confirmación al cambiar el toggle (activar/desactivar)
- [ ] 4.3 Incluir los nuevos campos en el `handleSubmit` del formulario

**Entregable**: El administrador puede controlar el modo mantenimiento desde el admin panel.

## Cronograma Estimado

| Iteración | Descripción | Estimación |
|-----------|-------------|------------|
| 1 | Base de datos y tipos | Rápido |
| 2 | Página de mantenimiento | Moderado |
| 3 | Middleware | Moderado |
| 4 | Admin toggle | Moderado |

## Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Loop en middleware: `/maintenance` pasa por el middleware y vuelve a reescribir | Excluir `/maintenance` del chequeo de mantenimiento en el middleware |
| Latencia en middleware por consulta a Supabase en cada request | La consulta es un SELECT de 1 fila en una tabla singleton — impacto mínimo para el volumen de este sitio |
| Admin se queda bloqueado fuera del sitio | Las rutas `/admin/*` están excluidas del chequeo de mantenimiento |

---

**Próximo paso**: Revisión y aprobación → Fase 4 (Implementación).
