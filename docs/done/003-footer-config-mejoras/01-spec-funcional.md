# Spec Funcional — Footer y Configuración: Mejoras

**Versión**: 1.0
**Fecha**: 2026-03-21
**Estado**: Aprobada
**Fecha de aprobación**: 2026-03-21

---

## 1. Problema

El footer actual tiene limitaciones:
- **Datos de transferencia**: Solo muestra información bancaria, pero falta identificación del titular (cédula/RUC/pasaporte) y correo electrónico.
- **Lugar de recogida**: Es global pero no se puede personalizar por producto. Si un producto se recoge en otro lugar, no hay forma de indicarlo.
- **Contacto**: El texto es fijo en código ("Coordinamos la entrega por WhatsApp...") y no se puede editar desde el admin.
- **Label incorrecto**: El método de entrega "Domicilio o recoger en lugar" debería decir "A domicilio o recoger en lugar".

## 2. Solución

Extender la configuración de la tienda y del producto para cubrir estos casos:

1. **Datos de transferencia**: Agregar tipo de documento, número de documento y correo electrónico como campos opcionales en `store_config`.
2. **Lugar de recogida por producto**: Permitir que cada producto tenga opcionalmente su propia dirección y mapa embebido que sobreescriba el global.
3. **Contacto configurable**: Agregar un campo de texto libre para la sección de contacto del footer, editable desde el admin, con opción de incluir un botón/enlace de WhatsApp (redirige a `wa.me`, sin mostrar el número).
4. **Fix de label**: Corregir el texto del método de entrega "both".

## 3. Usuarios

- **Visitante (público)**: Ve los datos actualizados en el footer y el lugar de recogida correcto en el detalle del producto.
- **Admin**: Configura los nuevos campos desde el panel de administración.

## 4. Módulos

### 4.1 Datos de transferencia (footer)
- Tipo de documento: selector con opciones — Cédula de Identidad, RUC, Pasaporte.
- Número de documento: campo de texto.
- Correo electrónico: campo de texto.
- Los tres campos son opcionales. Si no están configurados, no se muestran en el footer.
- Se muestran en la sección "Datos para transferencia" del footer, junto a los datos bancarios existentes.

### 4.2 Lugar de recogida por producto
- Campos opcionales en el producto: dirección de recogida y URL de mapa embebido (Google Maps).
- Si el producto tiene estos campos configurados, se muestran en el detalle del producto en lugar de los globales.
- Si no tiene, se heredan los globales de `store_config` (comportamiento actual).
- En el admin de producto, estos campos solo se muestran si el método de entrega del producto incluye recogida (pickup o both).

### 4.3 Contacto configurable (footer)
- Campo de texto libre en `store_config` para la sección de contacto del footer.
- Texto plano con soporte de saltos de línea.
- Checkbox o toggle para mostrar un botón/enlace de WhatsApp en esta sección.
- El botón de WhatsApp redirige a `wa.me/{número}` usando el número ya configurado en la tienda. No se muestra el número en texto visible.
- Si el campo de texto está vacío y el botón de WhatsApp está desactivado, la sección de contacto no se muestra.

### 4.4 Fix label método de entrega
- Cambiar "Domicilio o recoger en lugar" → "A domicilio o recoger en lugar" en las constantes.

## 5. Flujos Principales

### Flujo 1: Admin configura datos de transferencia
1. Admin va a Configuración de la tienda.
2. En la sección "Datos bancarios" (o nueva sección "Datos para transferencia"), ve los nuevos campos: tipo de documento, número de documento, correo.
3. Llena los campos deseados y guarda.
4. El footer muestra los datos nuevos junto a los bancarios.

### Flujo 2: Admin configura lugar de recogida por producto
1. Admin edita un producto.
2. Si el método de entrega incluye recogida, ve campos opcionales: dirección de recogida y URL de mapa.
3. Si los llena, el detalle del producto muestra esa dirección y mapa en vez del global.
4. Si los deja vacíos, se usa el global.

### Flujo 3: Admin configura sección de contacto
1. Admin va a Configuración de la tienda.
2. Ve un nuevo campo "Texto de contacto" (textarea) y un toggle "Mostrar botón de WhatsApp".
3. Escribe el texto deseado y activa/desactiva el botón.
4. El footer muestra la sección de contacto con el texto y opcionalmente el botón de WhatsApp.

### Flujo 4: Visitante ve detalle de producto con recogida personalizada
1. Visitante abre un producto que tiene lugar de recogida personalizado.
2. En la sección de entrega del modal, ve la dirección y mapa del producto, no el global.

## 6. Reglas de Negocio

- **RN1**: Tipo de documento, número de documento y correo son opcionales e independientes entre sí. Sin embargo, si se pone número de documento, debe haber tipo de documento seleccionado.
- **RN2**: Los campos de recogida por producto (`pickup_address`, `pickup_map_url`) son opcionales. `null` = heredar del global.
- **RN3**: El botón de WhatsApp en la sección de contacto usa el mismo `whatsapp_number` configurado en la tienda. No se configura un número aparte.
- **RN4**: El texto de contacto es texto plano. Los saltos de línea se respetan al renderizar.
- **RN5**: Si una sección del footer no tiene datos configurados, no se renderiza (comportamiento actual para banco y recogida, nuevo para contacto).

## 7. Criterios de Aceptación

- [ ] **CA1**: En el admin, se pueden configurar tipo de documento (Cédula/RUC/Pasaporte), número de documento y correo electrónico.
- [ ] **CA2**: En el footer, se muestran los datos de identificación y correo si están configurados.
- [ ] **CA3**: En el admin de producto, si el delivery_method incluye recogida, se muestran campos opcionales de dirección y mapa.
- [ ] **CA4**: En el detalle del producto, si tiene recogida personalizada, se muestra su dirección/mapa en vez del global.
- [ ] **CA5**: En el admin, se puede editar el texto de la sección de contacto del footer y activar/desactivar el botón de WhatsApp.
- [ ] **CA6**: En el footer, la sección de contacto muestra el texto configurado y opcionalmente un botón de WhatsApp que redirige a `wa.me`.
- [ ] **CA7**: El label "Domicilio o recoger en lugar" se muestra como "A domicilio o recoger en lugar" en toda la aplicación.
- [ ] **CA8**: Si los campos nuevos no están configurados, las secciones correspondientes no aparecen (no se rompe nada).

## 8. Fuera de Alcance

- Validación de formato de cédula/RUC (solo se almacena como texto).
- Múltiples correos electrónicos.
- Texto enriquecido (HTML/markdown) en la sección de contacto.
- Múltiples lugares de recogida por producto (solo uno).
- Mostrar el número de WhatsApp en texto visible en el footer.

---

**Próximo paso**: Revisión y aprobación → Fase 2 (Spec Técnica).
