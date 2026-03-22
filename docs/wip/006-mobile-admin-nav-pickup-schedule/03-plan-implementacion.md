# Plan de Implementación — Mobile Admin Nav + Horario de Recogida

**Versión**: 1.0
**Fecha**: 2026-03-21
**Estado**: Aprobada
**Fecha de aprobación**: 2026-03-21

---

## Iteraciones

### Iteración 1: Admin Nav Responsive
**Objetivo**: Hacer que el menú admin sea usable en móvil con hamburger menu.

#### Tareas
- [ ] 1.1 Modificar `admin-nav.tsx`: agregar estado `isOpen`, botón hamburger con ícono `Menu`/`X`
- [ ] 1.2 Desktop: envolver nav items existentes en `hidden md:flex`, envolver botón Salir en `hidden md:flex`
- [ ] 1.3 Mobile: agregar dropdown condicional (`md:hidden`) con nav items apilados + Salir
- [ ] 1.4 Cerrar menú al hacer click en enlace o fuera del dropdown
- [ ] 1.5 Verificar que desktop no tiene regresión visual

**Entregable**: Admin nav funcional en móvil y sin cambios en desktop.

---

### Iteración 2: Modelo de Datos + Tipo
**Objetivo**: Agregar soporte de `pickup_schedule` en DB y tipos TypeScript.

#### Tareas
- [ ] 2.1 Crear migración `005_pickup_schedule.sql` con columnas JSONB en `store_config` y `products`
- [ ] 2.2 Agregar tipo `PickupScheduleBlock` e incluir `pickup_schedule` en interfaces `StoreConfig` y `Product` en `types.ts`

**Entregable**: Schema actualizado, tipos TypeScript listos.

---

### Iteración 3: Componentes Reutilizables
**Objetivo**: Crear los componentes de edición y visualización de horarios.

#### Tareas
- [ ] 3.1 Crear `pickup-schedule-editor.tsx`: componente admin para agregar/eliminar bloques (días texto, hora inicio, hora fin)
- [ ] 3.2 Crear `pickup-schedule-display.tsx`: componente de display con ícono Clock y formato "Días: HH:MM - HH:MM"

**Entregable**: Componentes reutilizables listos para integrar.

---

### Iteración 4: Integración Admin
**Objetivo**: Integrar horarios en los formularios de configuración y producto.

#### Tareas
- [ ] 4.1 Integrar `PickupScheduleEditor` en `config-form.tsx` (sección Entrega, debajo del mapa)
- [ ] 4.2 Integrar `PickupScheduleEditor` en `product-form.tsx` (sección recogida personalizada)
- [ ] 4.3 Actualizar API `PUT /api/admin/config` para persistir `pickup_schedule`
- [ ] 4.4 Actualizar API `POST /api/admin/products` para persistir `pickup_schedule`
- [ ] 4.5 Actualizar API `PUT /api/admin/products/[id]` para persistir `pickup_schedule`

**Entregable**: Admin puede configurar horarios globales y por producto.

---

### Iteración 5: Integración Catálogo Público
**Objetivo**: Mostrar horarios en el frontend público.

#### Tareas
- [ ] 5.1 Integrar `PickupScheduleDisplay` en `product-modal.tsx` (debajo de dirección, antes del mapa)
- [ ] 5.2 Integrar `PickupScheduleDisplay` en `footer.tsx` (debajo de dirección, antes del mapa)
- [ ] 5.3 Implementar lógica de herencia: `product.pickup_schedule ?? config.pickup_schedule`

**Entregable**: Horarios visibles para compradores con herencia correcta.

---

### Iteración 6: Verificación
**Objetivo**: Validar todos los criterios de aceptación.

#### Tareas
- [ ] 6.1 Verificar admin nav en mobile (hamburger, dropdown, cierre automático)
- [ ] 6.2 Verificar admin nav en desktop (sin regresión)
- [ ] 6.3 Verificar CRUD de horarios en config y producto
- [ ] 6.4 Verificar display en modal y footer
- [ ] 6.5 Verificar herencia (producto sin horario usa global)
- [ ] 6.6 Ejecutar `npm run build` sin errores
- [ ] 6.7 Ejecutar `npm run lint` sin errores

**Entregable**: Feature completa y verificada.

---

## Cronograma Estimado

| Iteración | Descripción |
|---|---|
| 1 | Admin Nav Responsive |
| 2 | Modelo de Datos + Tipo |
| 3 | Componentes Reutilizables |
| 4 | Integración Admin |
| 5 | Integración Catálogo |
| 6 | Verificación |

Todas las iteraciones se ejecutan secuencialmente en una sola sesión.

---

## Riesgos y Mitigaciones

| Riesgo | Mitigación |
|---|---|
| Migración JSONB requiere ejecución manual en Supabase | El archivo SQL queda documentado para aplicar en producción |
| El menú hamburger podría requerir ajustes de z-index con otros elementos | Usar `z-50` y probar con scroll |
| Inputs `type="time"` pueden variar entre navegadores móviles | El formato HH:MM es estándar y soportado en todos los browsers modernos |

---

**Próximo paso**: Revisión y aprobación → Fase 4 (Implementación).
