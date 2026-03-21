# Spec Funcional — El Garaje de Vale

**Versión**: 1.0
**Fecha**: 2026-03-21
**Estado**: Aprobada
**Fecha de aprobación**: 2026-03-21

---

## 1. Problema

Se necesita vender artículos usados del hogar a un círculo cercano de conocidos en Ecuador. Actualmente no existe un canal centralizado para mostrar los productos con fotos, precios y estado de disponibilidad. La comunicación de venta se hace de forma desordenada.

## 2. Solución

Aplicación web tipo catálogo (MVP) donde se publican los productos usados en venta. Los compradores interesados contactan por WhatsApp. No hay carrito de compras, pagos en línea ni registro de usuarios compradores.

**Modelo de negocio**: El comprador ve el catálogo → contacta por WhatsApp → coordina pago por transferencia bancaria → se entrega el producto (a domicilio o recoger en lugar).

## 3. Usuarios

| Rol | Descripción |
|-----|-------------|
| **Visitante** | Persona que recibe el link y navega el catálogo. No requiere login. |
| **Administrador** | Único usuario que gestiona productos y configuración. Requiere autenticación. |

## 4. Módulos

### 4.1 Catálogo Público

La página principal visible para los visitantes.

#### 4.1.1 Vista de Cuadrícula (Grid)

- Los productos se muestran en formato grid responsive (cards).
- Cada card muestra:
  - Imagen principal del producto (la primera foto subida).
  - Nombre del producto.
  - Precio en USD.
  - Badge de categoría.
  - **Badge "VENDIDO"** sobre la imagen con opacidad reducida cuando el producto está vendido.
- **Orden por defecto**: precio de menor a mayor.
- **Filtros**:
  - Por categoría (selector o tabs).
  - Por estado: "Disponibles" / "Todos" (por defecto muestra todos).
- La página NO es indexable por buscadores (meta robots noindex, nofollow).

#### 4.1.2 Detalle del Producto (Modal)

Al hacer clic en un producto se abre un **modal overlay** con:

- Carrusel de imágenes (todas las fotos del producto).
- Nombre del producto.
- Descripción completa.
- Precio en USD.
- Categoría.
- Estado del artículo (Nuevo, Como nuevo, Usado).
- Estado de venta (Disponible / Vendido).
- **Método de entrega del producto**:
  - Icono/badge indicando: "Entrega a domicilio", "Recoger en lugar" o "Domicilio o recoger en lugar".
  - Si el método incluye "Recoger en lugar": mostrar dirección/zona configurada y mapa de Google Maps embebido.
- Botón **"Preguntar por este producto"** → abre WhatsApp con mensaje pre-llenado:
  - Formato: `Hola, me interesa el producto: {nombre del producto} (${precio})`.
  - Usa link `https://wa.me/{numero}?text={mensaje}`.
  - **No se muestra** si el producto está vendido.

#### 4.1.3 Footer

Visible en todas las páginas públicas. Contiene:

- **Datos bancarios** para transferencia (configurables desde admin):
  - Banco.
  - Nombre del titular.
  - Número de cuenta.
  - Tipo de cuenta.
- **Zona/Dirección de recogida** con mapa de Google Maps embebido (configurable desde admin).
- Texto: "Coordinamos la entrega por WhatsApp".
- Nombre de la tienda: "El Garaje de Vale".

#### 4.1.4 Botón Flotante de WhatsApp

- Botón flotante (FAB) fijo en esquina inferior derecha.
- Siempre visible durante el scroll.
- Al hacer clic abre WhatsApp con mensaje genérico:
  - Formato: `Hola, vi el catálogo de El Garaje de Vale y estoy interesado/a`.
- El número de WhatsApp es configurable desde el admin.

### 4.2 Panel Administrativo

Accesible vía `/admin`. Requiere autenticación (usuario y contraseña únicos para MVP).

#### 4.2.1 Gestión de Productos (CRUD)

- **Listar productos**: tabla o grid con nombre, precio, categoría, estado de venta, método de entrega, fecha de creación.
- **Crear producto**:
  - Nombre (obligatorio, texto, máx 100 caracteres).
  - Descripción (obligatorio, texto largo).
  - Precio en USD (obligatorio, numérico, mayor a 0).
  - Categoría (obligatorio, seleccionar de lista predefinida).
  - Estado del artículo (obligatorio): Nuevo / Como nuevo / Usado.
  - Estado de venta: Disponible (default) / Vendido.
  - Método de entrega: Usa el de la tienda (default) / Solo domicilio / Solo recoger en lugar / Ambos.
  - Imágenes: subir una o más imágenes. La primera es la imagen principal.
- **Editar producto**: mismos campos que crear.
- **Eliminar producto**: con confirmación.
- **Cambiar estado de venta**: acción rápida para marcar como "Vendido" o volver a "Disponible" sin abrir el formulario completo.

#### 4.2.2 Configuración de la Tienda

Formulario para editar:

- **Nombre de la tienda** (pre-llenado: "El Garaje de Vale").
- **Número de WhatsApp** (con código de país, ej: `593981234567`).
- **Datos bancarios**:
  - Banco.
  - Nombre del titular.
  - Número de cuenta.
  - Tipo de cuenta (Ahorros / Corriente).
- **Método de entrega general**: Domicilio / Recoger en lugar / Ambos.
- **Dirección/zona de recogida**: texto libre + URL de Google Maps para embeber.
- **Mensaje de WhatsApp genérico** (el del botón flotante).
- **Mensaje de WhatsApp por producto** (template con variables `{nombre}` y `{precio}`).

## 5. Categorías Predefinidas

| Categoría |
|-----------|
| Electrónica |
| Muebles |
| Ropa y Accesorios |
| Hogar y Cocina |
| Deportes |
| Libros |
| Juguetes |
| Otros |

## 6. Entrega

### Configuración a dos niveles

| Nivel | Descripción |
|-------|-------------|
| **Tienda** | Método de entrega por defecto para todos los productos. Configurado en el admin. |
| **Producto** | Puede sobreescribir el método de la tienda. Ej: un mueble grande → solo "Recoger en lugar". Si no se sobreescribe, hereda el de la tienda. |

### Métodos de entrega

| Método | Descripción |
|--------|-------------|
| **Entrega a domicilio** | Se coordina dirección y costo adicional por WhatsApp. |
| **Recoger en lugar** | El comprador recoge en la dirección/zona configurada. Se muestra mapa. |
| **Ambos** | El comprador puede elegir cualquiera de las dos opciones. |

### Mapa de Google Maps

- Se embebe usando un iframe de Google Maps Embed (gratuito).
- La URL del mapa se configura desde el admin.
- Se muestra en:
  - **Footer**: siempre visible como referencia general.
  - **Modal del producto**: solo cuando el método de entrega incluye "Recoger en lugar".

## 7. Flujos Principales

### Flujo 1: Visitante explora y contacta

```
1. Visitante recibe link del catálogo.
2. Abre la página → ve grid de productos.
3. Filtra por categoría si desea.
4. Hace clic en producto → se abre modal con detalle.
5. Ve método de entrega y mapa si aplica.
6. Hace clic en "Preguntar por este producto".
7. Se abre WhatsApp con mensaje pre-llenado.
8. Coordina compra, pago y entrega por chat.
9. Transfiere a la cuenta del footer.
10. Recibe producto (domicilio o recogida).
```

### Flujo 2: Admin publica un producto

```
1. Admin accede a /admin.
2. Ingresa credenciales.
3. Va a sección de productos → clic en "Nuevo producto".
4. Llena formulario, sube fotos, define método de entrega (o deja el default).
5. Guarda → producto visible en catálogo público.
```

### Flujo 3: Admin marca producto como vendido

```
1. Admin va a lista de productos.
2. Clic en acción rápida "Marcar como vendido".
3. Producto aparece en catálogo con badge "VENDIDO" y opacidad reducida.
```

### Flujo 4: Admin configura la tienda

```
1. Admin va a sección de configuración.
2. Edita datos bancarios, WhatsApp, método de entrega, dirección y mapa.
3. Guarda → cambios reflejados inmediatamente en el catálogo público.
```

## 8. Reglas de Negocio

| # | Regla |
|---|-------|
| RN-01 | Todo producto debe tener al menos una imagen. |
| RN-02 | El precio debe ser mayor a 0 USD. |
| RN-03 | Los productos vendidos siguen visibles en el catálogo pero con badge "VENDIDO" y opacidad reducida. |
| RN-04 | El botón "Preguntar por este producto" NO se muestra en productos vendidos. |
| RN-05 | La página no debe ser indexable por motores de búsqueda. |
| RN-06 | Solo existe un usuario administrador (MVP). |
| RN-07 | Los datos bancarios, WhatsApp y método de entrega son configurables desde el admin. |
| RN-08 | Si un producto no define método de entrega propio, hereda el de la tienda. |
| RN-09 | El mapa de Google Maps se muestra en el modal solo si el método de entrega incluye recogida. |
| RN-10 | El mapa se muestra siempre en el footer como referencia general. |

## 9. Criterios de Aceptación

### CA-01: Catálogo visible
- **Dado** que un visitante abre el link del catálogo,
- **Cuando** la página carga,
- **Entonces** ve los productos en grid ordenados por precio (menor a mayor).

### CA-02: Filtro por categoría
- **Dado** que hay productos de múltiples categorías,
- **Cuando** el visitante selecciona una categoría,
- **Entonces** solo se muestran productos de esa categoría.

### CA-03: Detalle en modal
- **Dado** que el visitante hace clic en un producto,
- **Cuando** se abre el modal,
- **Entonces** ve todas las imágenes, nombre, descripción, precio, categoría, estado y método de entrega.

### CA-04: WhatsApp por producto
- **Dado** que un producto está disponible,
- **Cuando** el visitante hace clic en "Preguntar por este producto",
- **Entonces** se abre WhatsApp con el mensaje pre-llenado incluyendo nombre y precio.

### CA-05: Producto vendido
- **Dado** que un producto fue marcado como vendido,
- **Cuando** el visitante ve el catálogo,
- **Entonces** el producto aparece con badge "VENDIDO", opacidad reducida y sin botón de WhatsApp en el modal.

### CA-06: No indexable
- **Dado** que la página está publicada,
- **Cuando** un buscador intenta indexarla,
- **Entonces** encuentra meta tags `noindex, nofollow` y no hay sitemap.

### CA-07: Admin CRUD productos
- **Dado** que el admin está autenticado,
- **Cuando** crea, edita o elimina un producto,
- **Entonces** los cambios se reflejan inmediatamente en el catálogo público.

### CA-08: Admin configuración
- **Dado** que el admin edita la configuración,
- **Cuando** cambia datos bancarios, WhatsApp, método de entrega o dirección,
- **Entonces** el footer, mapa y botones de WhatsApp se actualizan.

### CA-09: Autenticación admin
- **Dado** que alguien accede a `/admin`,
- **Cuando** no está autenticado,
- **Entonces** ve formulario de login y no puede acceder al panel.

### CA-10: Mapa en modal
- **Dado** que un producto tiene método de entrega que incluye recogida,
- **Cuando** se abre el modal del producto,
- **Entonces** se muestra la dirección y el mapa de Google Maps embebido.

### CA-11: Mapa en footer
- **Dado** que la tienda tiene dirección de recogida configurada,
- **Cuando** el visitante ve cualquier página del catálogo,
- **Entonces** el footer muestra la dirección y el mapa embebido.

### CA-12: Método de entrega heredado
- **Dado** que un producto no tiene método de entrega propio,
- **Cuando** se muestra en el catálogo,
- **Entonces** muestra el método de entrega configurado a nivel de tienda.

## 10. Diseño y Branding

| Aspecto | Definición |
|---------|------------|
| **Nombre** | El Garaje de Vale |
| **Paleta de colores** | Tonos nude y pasteles — suaves, acogedores, no abrumadores. |
| **Logo** | Pendiente. Espacio reservado para cuando esté disponible. |
| **Tipografía** | Limpia y moderna (definir en spec técnica). |
| **Idioma** | Español. |
| **Moneda** | USD (Dólares estadounidenses). |
| **País objetivo** | Ecuador. |

## 11. Fuera de Alcance (MVP)

- Carrito de compras.
- Pasarela de pagos.
- Registro de compradores.
- Notificaciones push o email.
- Múltiples administradores.
- Búsqueda por texto libre (post-MVP).
- Logo (se agregará después).
- Internacionalización (solo español).
- Valoraciones o comentarios.
- Categorías dinámicas desde admin (post-MVP).

---

**Próximo paso**: Revisión y aprobación → Fase 2 (Spec Técnica).
