# Spec Funcional — Modo Mantenimiento

**Versión**: 1.0
**Fecha**: 2026-03-21
**Estado**: Aprobada
**Fecha de aprobación**: 2026-03-21

---

## 1. Problema

Actualmente no existe forma de poner el catálogo público fuera de servicio temporalmente. Cuando se necesita hacer cambios importantes (migraciones, ajustes de datos, rediseño), los usuarios siguen viendo el sitio en un estado potencialmente inconsistente.

## 2. Solución

Agregar un modo mantenimiento controlado desde el admin panel que, al activarse, reemplaza todo el catálogo público con una página de mantenimiento. El mensaje mostrado es configurable. El admin panel permanece accesible para gestionar el sitio y desactivar el modo cuando sea necesario.

## 3. Usuarios

- **Administrador**: Activa/desactiva el modo mantenimiento y configura el mensaje desde el panel de administración.
- **Visitante**: Ve la página de mantenimiento en lugar del catálogo cuando el modo está activo.

## 4. Módulos

### 4.1 Página de mantenimiento (público)

- Página estática que se muestra cuando el modo mantenimiento está activo.
- Muestra un icono representativo coherente con el look & feel de la marca (paleta nude/pastel).
- Muestra el mensaje de mantenimiento configurado por el administrador.
- Reemplaza todas las rutas públicas del catálogo (`/`, `/cualquier-ruta` excepto `/admin/*`).
- Las API routes públicas (`/api/*`) **no** se bloquean.

### 4.2 Configuración en admin panel

- Toggle (switch) en la sección de configuración existente del admin para activar/desactivar el modo mantenimiento.
- Campo de texto para personalizar el mensaje de mantenimiento.
- Mensaje por defecto: *"Estamos realizando mejoras. Volvemos pronto."*
- Confirmación antes de activar o desactivar el modo (diálogo tipo "¿Estás seguro?").

## 5. Flujos Principales

### 5.1 Activar modo mantenimiento

1. El administrador va a la sección de configuración en el admin panel.
2. Activa el toggle de "Modo Mantenimiento".
3. Se muestra un diálogo de confirmación: *"¿Estás seguro de activar el modo mantenimiento? Los visitantes no podrán ver el catálogo."*
4. El administrador confirma.
5. Se guarda el estado en `store_config`.
6. A partir de ese momento, cualquier visitante que acceda al catálogo ve la página de mantenimiento.

### 5.2 Desactivar modo mantenimiento

1. El administrador va a la sección de configuración en el admin panel.
2. Desactiva el toggle de "Modo Mantenimiento".
3. Se muestra un diálogo de confirmación: *"¿Estás seguro de desactivar el modo mantenimiento? El catálogo volverá a ser visible."*
4. El administrador confirma.
5. Se guarda el estado en `store_config`.
6. El catálogo vuelve a estar disponible para los visitantes.

### 5.3 Editar mensaje de mantenimiento

1. El administrador modifica el texto del mensaje en el campo correspondiente.
2. Guarda los cambios (puede hacerlo con el modo activo o inactivo).
3. Si el modo está activo, los visitantes ven el mensaje actualizado inmediatamente.

### 5.4 Visitante accede durante mantenimiento

1. El visitante accede a cualquier ruta pública del catálogo.
2. El middleware detecta que el modo mantenimiento está activo en `store_config`.
3. Se renderiza la página de mantenimiento con el icono y el mensaje configurado.
4. El visitante no puede navegar a ninguna otra sección del catálogo.

## 6. Reglas de Negocio

- **RN-01**: El modo mantenimiento solo afecta las rutas públicas del catálogo. El admin panel (`/admin/*`) y las API routes (`/api/*`) no se bloquean.
- **RN-02**: El mensaje por defecto es *"Estamos realizando mejoras. Volvemos pronto."* y se usa cuando el administrador no ha configurado un mensaje personalizado.
- **RN-03**: Activar y desactivar el modo requiere confirmación explícita del administrador.
- **RN-04**: El estado de mantenimiento se persiste en la tabla `store_config` de Supabase, consistente con el patrón existente de configuración centralizada.
- **RN-05**: El estado por defecto al crear la configuración es **desactivado** (el sitio funciona normalmente).

## 7. Criterios de Aceptación

- [ ] **CA-01**: Al activar el modo mantenimiento, todas las rutas públicas del catálogo muestran la página de mantenimiento.
- [ ] **CA-02**: La página de mantenimiento muestra un icono y el mensaje configurado, con el estilo visual de la marca.
- [ ] **CA-03**: El admin panel es accesible y funcional durante el modo mantenimiento.
- [ ] **CA-04**: Las API routes públicas responden normalmente durante el modo mantenimiento.
- [ ] **CA-05**: El toggle en el admin muestra el estado actual del modo mantenimiento.
- [ ] **CA-06**: Al hacer toggle se muestra un diálogo de confirmación antes de aplicar el cambio.
- [ ] **CA-07**: El mensaje de mantenimiento es editable desde el admin y tiene un valor por defecto.
- [ ] **CA-08**: Los cambios de estado y mensaje se reflejan inmediatamente para los visitantes.

## 8. Fuera de Alcance

- Programar activación/desactivación automática por horario.
- Permitir acceso al catálogo a ciertos usuarios durante el mantenimiento (whitelist/bypass).
- Bloquear API routes durante el mantenimiento.
- Notificaciones por email o WhatsApp cuando se activa/desactiva.
- Página de mantenimiento personalizable más allá del mensaje (HTML custom, imágenes, etc.).

---

**Próximo paso**: Revisión y aprobación → Fase 2 (Spec Técnica).
