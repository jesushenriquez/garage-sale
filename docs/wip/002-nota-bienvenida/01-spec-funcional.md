# Spec Funcional — Nota de Bienvenida

**Versión**: 1.0
**Fecha**: 2026-03-21
**Estado**: Aprobada
**Fecha de aprobación**: 2026-03-21

---

## 1. Problema

Los visitantes llegan directamente al catálogo de productos sin contexto personal. No saben quién es Vale, por qué está vendiendo sus cosas, ni la historia detrás de la venta. Esto hace que la experiencia se sienta impersonal, como una tienda genérica en lugar de una venta de garaje con alma.

## 2. Solución

Un modal de bienvenida a pantalla completa que aparece **la primera vez** que un visitante entra al sitio. Contiene un mensaje personal de Vale (título, texto e imagen opcional) con un botón para continuar al catálogo. Después de cerrarlo, un ícono discreto en el header permite volver a leerlo en cualquier momento.

El contenido es **editable desde el admin**, para que Vale pueda actualizar su mensaje cuando quiera.

## 3. Usuarios

| Rol | Acción |
|-----|--------|
| **Visitante** | Ve la nota de bienvenida en su primera visita. Puede volver a verla desde el ícono en el header. |
| **Admin (Vale)** | Edita el título, mensaje e imágenes de la nota desde el panel de administración. |

## 4. Módulos

### 4.1 Modal de Bienvenida (público)

- Overlay a pantalla completa sobre el catálogo
- Contenido centrado con scroll si es largo
- Muestra: título, mensaje de texto, imagen(es) opcional(es)
- Botón "Ver productos" o "Continuar" para cerrar
- Diseño cálido y sentimental, acorde a la paleta brand (nude/pastel)
- Animación sutil de entrada (fade in)

### 4.2 Ícono de acceso en Header (público)

- Ícono de sobre con corazón (💌 o SVG equivalente) en el header
- Al hacer clic, abre el modal de bienvenida nuevamente
- Tooltip o aria-label: "Nota de Vale"
- Solo visible si hay contenido configurado (título o mensaje no vacíos)

### 4.3 Configuración en Admin

- Nueva sección en la página de configuración existente (`/admin/config`)
- Campos:
  - **Título** (texto corto, ej: "Hola, soy Vale 👋")
  - **Mensaje** (textarea largo, el cuerpo de la nota)
  - **Imágenes** (upload de una o varias imágenes, reutilizando el patrón de Supabase Storage existente)
- Preview opcional del contenido

## 5. Flujos Principales

### Flujo 1: Primera visita

1. Visitante entra a `/`
2. El catálogo carga normalmente (server-side)
3. El componente client-side verifica `localStorage` → no existe flag `welcome_seen`
4. Se verifica que haya contenido de bienvenida configurado (título o mensaje no vacíos)
5. Se muestra el modal de bienvenida a pantalla completa
6. Visitante lee el mensaje y hace clic en "Ver productos"
7. El modal se cierra con animación de salida
8. Se guarda `welcome_seen = true` en `localStorage`
9. El catálogo queda visible y funcional

### Flujo 2: Visita recurrente

1. Visitante entra a `/`
2. `localStorage` tiene `welcome_seen = true`
3. El modal **no** se muestra
4. El catálogo carga normalmente
5. El ícono 💌 es visible en el header

### Flujo 3: Re-leer la nota

1. Visitante hace clic en el ícono 💌 del header
2. Se abre el modal de bienvenida (mismo contenido)
3. Visitante lo cierra con el botón o haciendo clic fuera
4. No se modifica el flag de `localStorage`

### Flujo 4: Admin edita la nota

1. Vale entra a `/admin/config`
2. Ve la nueva sección "Nota de Bienvenida"
3. Edita título, mensaje y/o sube imágenes
4. Hace clic en guardar
5. Los cambios se reflejan inmediatamente para nuevos visitantes

## 6. Reglas de Negocio

| # | Regla |
|---|-------|
| RN1 | El modal solo aparece automáticamente una vez por navegador (controlado por `localStorage`). |
| RN2 | Si no hay contenido configurado (título y mensaje ambos vacíos), el modal no se muestra y el ícono del header se oculta. |
| RN3 | Las imágenes son opcionales. La nota puede funcionar solo con texto. |
| RN4 | El ícono del header siempre está disponible (mientras haya contenido) independientemente de si el usuario ya vio el modal. |
| RN5 | Limpiar `localStorage` o entrar desde otro dispositivo/navegador reinicia el comportamiento de "primera visita". |
| RN6 | El contenido de la nota se obtiene de `store_config` (misma tabla singleton existente). |

## 7. Criterios de Aceptación

- [ ] **CA1**: En la primera visita, se muestra un modal a pantalla completa con el mensaje de Vale antes de interactuar con el catálogo.
- [ ] **CA2**: Al hacer clic en "Ver productos", el modal se cierra y no vuelve a aparecer automáticamente en visitas posteriores.
- [ ] **CA3**: Un ícono de sobre con corazón en el header permite reabrir la nota en cualquier momento.
- [ ] **CA4**: Si no hay contenido configurado, el modal no aparece y el ícono se oculta.
- [ ] **CA5**: Desde `/admin/config`, Vale puede editar el título, mensaje e imágenes de la nota.
- [ ] **CA6**: Los cambios guardados en admin se reflejan inmediatamente en el sitio público.
- [ ] **CA7**: El diseño del modal es coherente con la paleta brand (nude/pastel), se siente cálido y personal.
- [ ] **CA8**: El modal es responsive y se ve bien en móvil y desktop.

## 8. Fuera de Alcance

- Formateo rich text (markdown/HTML) en el mensaje — por ahora es texto plano
- Animaciones complejas o transiciones de página
- Soporte multi-idioma
- Analytics de cuántos visitantes leyeron la nota
- Personalización del botón CTA (texto fijo: "Ver productos")

---

**Próximo paso**: Revisión y aprobación → Fase 2 (Spec Técnica).
