# Plan de Implementación — Nota de Bienvenida

**Versión**: 1.0
**Fecha**: 2026-03-21
**Estado**: Aprobada
**Fecha de aprobación**: 2026-03-21

---

## Iteraciones

### Iteración 1: Base de datos y tipos
**Objetivo**: Preparar el modelo de datos para soportar la nota de bienvenida.

#### Tareas
- [ ] 1.1 Crear migración `supabase/migrations/002_welcome_note.sql` (ALTER store_config + CREATE welcome_images + RLS)
- [ ] 1.2 Ejecutar migración en Supabase
- [ ] 1.3 Actualizar `StoreConfig` en `lib/types.ts` (agregar `welcome_title`, `welcome_message`)
- [ ] 1.4 Agregar interfaz `WelcomeImage` en `lib/types.ts`

**Entregable**: Schema actualizado, tipos TypeScript alineados.

---

### Iteración 2: API endpoints
**Objetivo**: Exponer los endpoints necesarios para CRUD de la nota de bienvenida.

#### Tareas
- [ ] 2.1 Modificar `PUT /api/admin/config` para incluir `welcome_title` y `welcome_message` en el update
- [ ] 2.2 Crear `POST /api/admin/welcome-images/route.ts` (upload de imágenes a Storage + insert en welcome_images)
- [ ] 2.3 Crear `DELETE /api/admin/welcome-images/[id]/route.ts` (eliminar de Storage + tabla)

**Entregable**: Endpoints funcionales, probados manualmente.

**Dependencia**: Iteración 1.

---

### Iteración 3: Admin — Sección de configuración
**Objetivo**: Permitir a Vale editar la nota desde el panel de admin.

#### Tareas
- [ ] 3.1 Crear componente `WelcomeImageUpload` en `components/admin/` (basado en `ImageUpload` existente, adaptado para welcome-images endpoints)
- [ ] 3.2 Agregar sección "Nota de Bienvenida" en `ConfigForm` con campos título (input) y mensaje (textarea)
- [ ] 3.3 Integrar `WelcomeImageUpload` dentro de la sección de nota en ConfigForm
- [ ] 3.4 Pasar `welcomeImages` desde la página `/admin/config` al ConfigForm (fetch welcome_images server-side)

**Entregable**: Vale puede crear/editar/eliminar contenido de la nota desde admin.

**Dependencia**: Iteración 2.

---

### Iteración 4: Público — Modal de bienvenida
**Objetivo**: Mostrar la nota de Vale a los visitantes.

#### Tareas
- [ ] 4.1 Crear componente `WelcomeModal` en `components/catalog/` (client component con lógica de localStorage)
- [ ] 4.2 Modificar `page.tsx` para fetch de `welcome_images` y pasar datos al modal
- [ ] 4.3 Diseñar el modal: overlay, card, tipografía, imágenes, botón CTA, animaciones fade-in/out
- [ ] 4.4 Manejar caso sin contenido (no renderizar modal si título y mensaje están vacíos)

**Entregable**: Modal funcional en primera visita, no reaparece en visitas posteriores.

**Dependencia**: Iteración 1 (datos), Iteración 3 para tener contenido de prueba.

---

### Iteración 5: Público — Ícono en header
**Objetivo**: Permitir re-leer la nota desde el header.

#### Tareas
- [ ] 5.1 Modificar `Header` para recibir datos de bienvenida y mostrar ícono 💌 (Lucide `MailHeart` o similar)
- [ ] 5.2 Extraer lógica del ícono como componente client (el Header puede seguir como server component)
- [ ] 5.3 Al click del ícono, abrir WelcomeModal (comunicación entre componentes via estado en page o render condicional)
- [ ] 5.4 Ocultar ícono si no hay contenido configurado

**Entregable**: Ícono visible en header que reabre la nota.

**Dependencia**: Iteración 4.

---

### Iteración 6: Polish y responsive
**Objetivo**: Asegurar calidad visual y experiencia en todos los dispositivos.

#### Tareas
- [ ] 6.1 Probar modal en móvil (scroll, tamaño de fuente, imágenes)
- [ ] 6.2 Probar modal en desktop (ancho máximo, centrado)
- [ ] 6.3 Verificar animaciones de entrada y salida
- [ ] 6.4 Verificar accesibilidad (aria-modal, focus trap, escape para cerrar)
- [ ] 6.5 Probar flujo completo: primera visita → cerrar → revisitar → ícono header → reabrir

**Entregable**: Feature lista para producción.

**Dependencia**: Iteraciones 4 y 5.

---

## Cronograma Estimado

| Iteración | Descripción | Complejidad |
|-----------|-------------|-------------|
| 1 | Base de datos y tipos | Baja |
| 2 | API endpoints | Baja-Media |
| 3 | Admin config | Media |
| 4 | Modal público | Media |
| 5 | Ícono header | Baja |
| 6 | Polish y responsive | Baja |

## Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| El bucket `product-images` no acepta archivos en path `welcome/` | Imágenes no se suben | Verificar políticas del bucket. Si falla, crear bucket `welcome-images` dedicado. |
| Header se complica al mezclar server/client para el ícono | Refactoring innecesario | Extraer ícono como componente client independiente, mantener Header como server component. |
| Modal bloquea interacción con el catálogo en mobile | UX degradada | Asegurar z-index correcto y scroll interno en el modal. |

---

**Próximo paso**: Revisión y aprobación → Fase 4 (Implementación).
