# Spec Funcional — Mobile Admin Nav + Horario de Recogida

**Versión**: 1.0
**Fecha**: 2026-03-21
**Estado**: Aprobada
**Fecha de aprobación**: 2026-03-21

---

## 1. Problema

### 1.1 Navegación admin en móvil
El menú de navegación del panel admin es una barra horizontal fija con 3 enlaces + botón de salir. En pantallas móviles, los elementos se desbordan horizontalmente, causando que el título "El Garaje de Vale" se apile verticalmente y los links se corten o requieran scroll horizontal. La experiencia en móvil es inutilizable.

### 1.2 Horario de recogida ausente
Actualmente la sección de recogida muestra dirección y mapa, pero no indica en qué horarios se puede recoger. El comprador no tiene forma de saber cuándo puede pasar a retirar su producto.

---

## 2. Solución

### 2.1 Menú hamburger para admin móvil
Reemplazar la navegación horizontal por un menú hamburger en pantallas menores a 768px (breakpoint `md` de Tailwind). El menú se despliega como dropdown vertical debajo del header al tocar el ícono ☰.

### 2.2 Horario de recogida estructurado
Agregar un sistema de horarios de recogida con bloques configurables (ej: "Lunes a Viernes: 9:00 - 17:00", "Sábados: 10:00 - 14:00"). El horario se configura globalmente en store_config y puede sobreescribirse por producto, siguiendo el mismo patrón de herencia que `pickup_address`.

---

## 3. Usuarios

- **Admin (vendedora)**: Configura horarios de recogida globales y por producto. Usa el panel admin desde el celular ocasionalmente.
- **Comprador (visitante)**: Ve los horarios de recogida en el detalle de producto y en el footer del catálogo.

---

## 4. Módulos

### Módulo A: Navegación Admin Responsive

**A.1 — Menú hamburger (< 768px)**
- El header muestra: nombre de la tienda (izquierda) + ícono hamburger (derecha)
- Al tocar el ícono, se despliega un dropdown vertical con los 3 enlaces de navegación + botón "Salir"
- El enlace activo se resalta con el mismo estilo actual (fondo brand-100, texto brand-800)
- Al seleccionar un enlace, el menú se cierra automáticamente
- Al tocar fuera del menú, se cierra

**A.2 — Menú desktop (≥ 768px)**
- Sin cambios. Se mantiene la barra horizontal actual.

### Módulo B: Horario de Recogida

**B.1 — Configuración global (admin)**
- En la sección "Entrega" del formulario de configuración, debajo del campo "URL Google Maps embed", agregar una sección "Horario de recogida"
- El admin puede agregar bloques de horario. Cada bloque tiene:
  - **Días**: texto libre (ej: "Lunes a Viernes", "Sábados", "Domingos y feriados")
  - **Hora inicio**: selector de hora (formato HH:MM)
  - **Hora fin**: selector de hora (formato HH:MM)
- Se pueden agregar múltiples bloques (botón "+ Agregar horario")
- Se pueden eliminar bloques individuales
- Los bloques se guardan ordenados según fueron ingresados

**B.2 — Horario por producto (admin)**
- En el formulario de producto, sección de entrega (cuando el método incluye recogida), agregar la misma interfaz de bloques de horario
- Por defecto, un producto hereda el horario global (no muestra bloques propios)
- El admin puede activar un override para definir horarios específicos del producto

**B.3 — Visualización en detalle de producto**
- En el modal de producto, debajo de la dirección de recogida y antes del mapa, mostrar los bloques de horario
- Se muestra con ícono de reloj (Clock) y formato: "Lun-Vie: 9:00 - 17:00"
- Si el producto tiene horario propio, se usa ese. Si no, se usa el global.

**B.4 — Visualización en footer**
- En la sección "Lugar de recogida" del footer, debajo de la dirección y antes del mapa, mostrar los bloques de horario del store_config
- Mismo formato que en el detalle de producto

---

## 5. Flujos Principales

### Flujo A: Admin usa menú en móvil
1. Admin abre el panel admin desde su celular
2. Ve el header con nombre de tienda y ícono ☰
3. Toca el ícono ☰
4. Se despliega dropdown con: Productos, Importar/Exportar, Configuración, Salir
5. Toca "Productos"
6. El menú se cierra y navega a la página de productos

### Flujo B: Admin configura horario global
1. Admin va a Configuración → sección Entrega
2. Ve la sección "Horario de recogida" (vacía o con bloques existentes)
3. Toca "+ Agregar horario"
4. Completa: Días = "Lunes a Viernes", Inicio = "09:00", Fin = "17:00"
5. Agrega otro bloque: Días = "Sábados", Inicio = "10:00", Fin = "14:00"
6. Guarda la configuración

### Flujo C: Comprador ve horario
1. Comprador abre un producto con método de recogida
2. En la sección de entrega ve:
   - "Recoger en lugar"
   - Dirección de recogida
   - Horario: "Lunes a Viernes: 9:00 - 17:00" / "Sábados: 10:00 - 14:00"
   - Mapa embebido

---

## 6. Reglas de Negocio

1. **Herencia de horario**: Si un producto no tiene horario propio (`pickup_schedule` es null o vacío), se usa el horario de `store_config`. Si tiene horario propio, se usa ese y se ignora el global.
2. **Visibilidad del horario**: El horario solo se muestra cuando el método de entrega incluye recogida (`pickup` o `both`).
3. **Horario vacío**: Si no hay bloques de horario configurados (ni global ni por producto), simplemente no se muestra la sección de horario. No hay error ni placeholder.
4. **Breakpoint del menú**: El hamburger se activa estrictamente por debajo de 768px. No hay estado intermedio.
5. **Bloques de horario**: Mínimo 0, sin máximo definido (en la práctica 2-4 bloques son suficientes). Los días son texto libre para máxima flexibilidad.

---

## 7. Criterios de Aceptación

### Navegación Admin Móvil
- [ ] En pantallas < 768px, el menú horizontal se reemplaza por un ícono hamburger
- [ ] Al tocar el ícono, se despliega un dropdown vertical con todos los enlaces + Salir
- [ ] El enlace activo se resalta visualmente
- [ ] Al seleccionar un enlace, el menú se cierra y navega correctamente
- [ ] Al tocar fuera del menú, se cierra
- [ ] En pantallas ≥ 768px, el menú se ve exactamente igual que antes (sin regresión)

### Horario de Recogida — Admin
- [ ] En Configuración → Entrega, se pueden agregar/eliminar bloques de horario
- [ ] Cada bloque tiene campos: días (texto), hora inicio, hora fin
- [ ] Los bloques se persisten correctamente en la base de datos
- [ ] En el formulario de producto, se puede sobreescribir el horario global
- [ ] Si el producto no tiene horario propio, hereda el global

### Horario de Recogida — Catálogo
- [ ] En el modal de producto, el horario se muestra debajo de la dirección de recogida
- [ ] En el footer, el horario se muestra debajo de la dirección
- [ ] Solo se muestra cuando el método de entrega incluye recogida
- [ ] Se respeta la herencia: producto > global

---

## 8. Fuera de Alcance

- Animaciones o transiciones elaboradas para el menú hamburger (un simple show/hide es suficiente)
- Validación de conflictos de horario (ej: bloques que se solapan)
- Horarios por día individual (se usa texto libre para los días)
- Zona horaria configurable (se asume hora local de Ecuador)
- Notificaciones o recordatorios de horario al comprador
- Cambios en la navegación del catálogo público (solo admin)

---

**Próximo paso**: Revisión y aprobación → Fase 2 (Spec Técnica).
