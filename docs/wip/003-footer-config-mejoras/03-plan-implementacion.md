# Plan de Implementación — Footer y Configuración: Mejoras

**Versión**: 1.0
**Fecha**: 2026-03-21
**Estado**: Aprobada
**Fecha de aprobación**: 2026-03-21

---

## Iteraciones

### Iteración 1: Base de datos, tipos y constantes
**Objetivo**: Preparar la base — migración SQL, tipos TypeScript y fix de label.

#### Tareas
- [ ] 1.1 Crear migración `003_footer_config_mejoras.sql` con ALTER TABLEs para `store_config` y `products`
- [ ] 1.2 Actualizar `lib/types.ts`: agregar `DocumentType`, nuevos campos en `StoreConfig` y `Product`
- [ ] 1.3 Actualizar `lib/constants.ts`: agregar `DOCUMENT_TYPES`, fix label `both` → "A domicilio o recoger en lugar"

**Entregable**: Esquema actualizado, tipos y constantes listos.

### Iteración 2: API y validación server-side
**Objetivo**: Los endpoints aceptan y persisten los nuevos campos.

#### Tareas
- [ ] 2.1 Actualizar `PUT /api/admin/config` para aceptar los 5 campos nuevos de `store_config`, con validación de `document_number` requiere `document_type`
- [ ] 2.2 Actualizar `PUT /api/admin/products/[id]` para aceptar `pickup_address` y `pickup_map_url`

**Entregable**: APIs listas para recibir datos nuevos.

### Iteración 3: Admin — formularios
**Objetivo**: El admin puede configurar los nuevos campos.

#### Tareas
- [ ] 3.1 Actualizar `config-form.tsx`: renombrar sección a "Datos para transferencia", agregar campos de documento y correo
- [ ] 3.2 Actualizar `config-form.tsx`: agregar sección "Contacto" con textarea y toggle de WhatsApp
- [ ] 3.3 Actualizar formulario de producto (admin): agregar campos condicionales de recogida personalizada con preview de mapa

**Entregable**: Admin puede gestionar todos los campos nuevos.

### Iteración 4: Frontend público — footer y product modal
**Objetivo**: Los visitantes ven los datos nuevos.

#### Tareas
- [ ] 4.1 Actualizar `footer.tsx`: sección "Datos para transferencia" con documento y correo
- [ ] 4.2 Actualizar `footer.tsx`: sección "Contacto" con texto configurable y botón WhatsApp
- [ ] 4.3 Actualizar `product-modal.tsx`: usar pickup del producto si existe, sino el global

**Entregable**: Frontend público refleja toda la configuración nueva.

### Iteración 5: Verificación
**Objetivo**: Validar todos los criterios de aceptación.

#### Tareas
- [ ] 5.1 Verificar CA1-CA8 manualmente
- [ ] 5.2 Verificar que campos vacíos no rompen el renderizado
- [ ] 5.3 Build limpio sin errores (`npm run build`)

**Entregable**: Feature completo y verificado.

## Dependencias

```
Iteración 1 → Iteración 2 → Iteración 3 → Iteración 4 → Iteración 5
```

Cada iteración depende de la anterior. No se pueden paralelizar.

## Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Migración SQL falla en Supabase remoto | Probar migración localmente primero; usar ALTER TABLE que son safe |
| Campos nuevos rompen queries existentes | Los campos son nullable con defaults, no afectan queries existentes |
| Footer se descuadra con datos nuevos | Mantener layout responsive actual, probar con diferentes combinaciones de datos |

---

**Próximo paso**: Revisión y aprobación → Fase 4 (Implementación).
