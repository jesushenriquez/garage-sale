# Spec-Driven Development (SDD)

Este proyecto utiliza Spec-Driven Development como metodología para planificar, documentar y ejecutar features de forma ordenada.

---

## ¿Qué es SDD?

Es un proceso donde cada feature pasa por fases secuenciales de especificación antes de escribir código. Cada fase produce un documento que debe ser **aprobado** antes de avanzar a la siguiente.

## Fases

### Fase 1 — Spec Funcional
Define **qué** se va a construir desde la perspectiva del usuario.

**Output**: `01-spec-funcional.md`
- Problema y solución
- Usuarios y roles
- Módulos y funcionalidades
- Flujos principales
- Reglas de negocio
- Criterios de aceptación
- Fuera de alcance

### Fase 2 — Spec Técnica
Define **cómo** se va a construir desde la perspectiva técnica.

**Output**: `02-spec-tecnica.md`
- Stack tecnológico
- Arquitectura
- Modelo de datos
- API routes / endpoints
- Estructura del proyecto
- Seguridad
- Dependencias

### Fase 3 — Plan de Implementación
Define **en qué orden** se va a construir.

**Output**: `03-plan-implementacion.md`
- Iteraciones con tareas ordenadas
- Dependencias entre tareas
- Entregables por iteración
- Cronograma estimado
- Riesgos y mitigaciones

### Fase 4 — Implementación
Se escribe el código siguiendo el plan.

**Output**: Código funcional en el repositorio.

### Fase 5 — Pruebas
Se valida que los criterios de aceptación se cumplan.

**Output**: Tests y/o validación manual documentada.

## Cómo iniciar una feature

El proceso SDD se activa cuando el usuario indica que quiere desarrollar un nuevo feature. Se siguen estos pasos en orden:

### Paso 0 — Preparar el branch
1. Validar en qué branch estamos actualmente.
2. Si no estamos en `main`, cambiar a `main` (o pedir confirmación si hay cambios sin commitear).
3. Hacer `git pull origin main` para asegurarnos de tener la última versión.
4. Preguntar al usuario cuál es el feature que quiere desarrollar (descripción general).
5. A partir de la descripción, definir el nombre y número de la feature.
6. Crear un nuevo branch con el patrón `feature/{NNN}-{nombre-feature}` (ej: `feature/002-busqueda-productos`).

> **Nota**: La rama base es `main`. En el futuro puede cambiar a `develop` si se adopta un flujo gitflow.

### Paso 1 — Scaffolding
1. Crear la carpeta `docs/wip/{NNN}-{nombre-feature}/` con los 3 archivos template.
2. Hacer commit inicial del scaffolding en el branch de feature.

### Paso 2 — Proceso de descubrimiento
1. Iniciar la Fase 1 (Spec Funcional) con preguntas al usuario.
2. Seguir el flujo completo: Spec Funcional → Spec Técnica → Plan → Implementación → Pruebas.

## Proceso de descubrimiento

Antes de redactar cada spec, se debe hacer un proceso de preguntas y respuestas para entender y afinar los requerimientos. **No se escribe la spec de golpe.**

### Cómo funciona

1. El usuario describe la idea o feature de forma general.
2. Claude hace preguntas específicas para clarificar alcance, casos de uso, reglas de negocio y decisiones de diseño.
3. El usuario responde y puede agregar ideas o restricciones adicionales.
4. Se pueden hacer varias rondas de preguntas según la complejidad.
5. Una vez que ambos tienen claro el alcance, Claude redacta la spec completa.
6. El usuario revisa, pide ajustes si es necesario, y aprueba.

### Qué preguntar en cada fase

**Fase 1 (Funcional)**: ¿Qué problema resuelve? ¿Quiénes son los usuarios? ¿Qué funcionalidades necesita? ¿Qué flujos debe soportar? ¿Qué queda fuera del alcance?

**Fase 2 (Técnica)**: ¿Hay restricciones de stack? ¿Cómo se integra con lo existente? ¿Qué modelo de datos necesita? ¿Hay consideraciones de seguridad o performance?

**Fase 3 (Plan)**: ¿Hay prioridades o dependencias? ¿Cuánto tiempo se quiere invertir? ¿Hay restricciones de orden?

### Principio clave

El objetivo es que Claude ayude al usuario a pensar y refinar la idea, no solo a documentarla. Las preguntas deben ser concretas, ofrecer opciones cuando sea útil, y evitar asumir decisiones sin validar.

## Flujo de aprobación

> **IMPORTANTE**: Nunca se debe avanzar a la siguiente fase sin aprobación explícita del usuario. Claude debe pedir aprobación activamente antes de continuar.

```
Fase 1 → [Aprobación] → Fase 2 → [Aprobación] → Fase 3 → [Aprobación] → Fase 4 → Fase 5
```

### Protocolo de aprobación

1. Al terminar de redactar una spec, Claude pide aprobación explícita al usuario.
2. El usuario puede: aprobar, pedir ajustes, o rechazar.
3. **Al aprobar**, Claude actualiza el archivo de la spec con:
   - `**Estado**: Aprobada`
   - `**Fecha de aprobación**: {YYYY-MM-DD}`
4. Solo después de actualizar el estado se puede iniciar la siguiente fase.
5. Si durante la implementación se detectan cambios necesarios, se actualiza la spec correspondiente y se re-aprueba.

## Organización de archivos

```
docs/
├── sdd-process.md              # Este documento
├── wip/                         # Features en progreso
│   └── {NNN}-{nombre-feature}/
│       ├── 01-spec-funcional.md
│       ├── 02-spec-tecnica.md
│       └── 03-plan-implementacion.md
└── done/                        # Features completadas
    └── {NNN}-{nombre-feature}/
        ├── 01-spec-funcional.md
        ├── 02-spec-tecnica.md
        └── 03-plan-implementacion.md
```

### Convenciones

- **Numeración**: `{NNN}` es secuencial y global (001, 002, 003...). No se reinicia entre `wip/` y `done/`.
- **Nombre**: kebab-case descriptivo (ej: `001-catalogo-mvp`, `002-busqueda-productos`).
- **Scaffolding**: Al iniciar una feature, se crea la carpeta con los 3 archivos usando los templates base (con secciones vacías listas para llenar).
- **Movimiento**: Ver sección "Cierre de feature" más abajo.

## Cierre de feature

### Mover specs a `done/`

Una vez completada la implementación y las pruebas, se mueve la carpeta de specs de `wip/` a `done/` como **último commit en el feature branch**, antes de crear el PR. Así el move queda incluido en el PR y al mergearse todo queda atómico.

**Flujo**:
1. Implementación y pruebas completadas en el feature branch.
2. Mover `docs/wip/{NNN}-{nombre}/ → docs/done/{NNN}-{nombre}/`.
3. Commit: `docs: move {NNN}-{nombre} specs from wip to done`.
4. Crear el PR (que incluye código + move de specs).
5. Al mergear el PR, las specs quedan automáticamente en `done/`.

### Correcciones post-move

Si después de mover a `done/` se detecta que algo hay que cambiar (durante el PR review o pruebas adicionales):

- **Cambio menor**: Hacer el fix y editar las specs directamente en `docs/done/` dentro del mismo feature branch. No hace falta moverlas de vuelta a `wip/`.
- **Cambio mayor que invalida la spec**: Mover de vuelta a `docs/wip/`, re-hacer el proceso de aprobación, y volver a mover a `done/` cuando esté listo. Este caso debería ser excepcional.

## Templates

Los templates base para cada spec se encuentran a continuación. Al crear una nueva feature, se copian estos templates con las secciones vacías.

### Template: 01-spec-funcional.md
```markdown
# Spec Funcional — {Nombre de la Feature}

**Versión**: 1.0
**Fecha**: {YYYY-MM-DD}
**Estado**: Pendiente

---

## 1. Problema

## 2. Solución

## 3. Usuarios

## 4. Módulos

## 5. Flujos Principales

## 6. Reglas de Negocio

## 7. Criterios de Aceptación

## 8. Fuera de Alcance

---

**Próximo paso**: Revisión y aprobación → Fase 2 (Spec Técnica).
```

### Template: 02-spec-tecnica.md
```markdown
# Spec Técnica — {Nombre de la Feature}

**Versión**: 1.0
**Fecha**: {YYYY-MM-DD}
**Estado**: Pendiente
**Spec Funcional**: [01-spec-funcional.md](./01-spec-funcional.md)

---

## 1. Stack Tecnológico

## 2. Arquitectura

## 3. Modelo de Datos

## 4. API / Endpoints

## 5. Componentes

## 6. Seguridad

## 7. Variables de Entorno

---

**Próximo paso**: Revisión y aprobación → Fase 3 (Plan de Implementación).
```

### Template: 03-plan-implementacion.md
```markdown
# Plan de Implementación — {Nombre de la Feature}

**Versión**: 1.0
**Fecha**: {YYYY-MM-DD}
**Estado**: Pendiente

---

## Iteraciones

### Iteración 1: {Nombre}
**Objetivo**:

#### Tareas
- [ ] Tarea 1.1
- [ ] Tarea 1.2

**Entregable**:

## Cronograma Estimado

## Riesgos y Mitigaciones

---

**Próximo paso**: Revisión y aprobación → Fase 4 (Implementación).
```
