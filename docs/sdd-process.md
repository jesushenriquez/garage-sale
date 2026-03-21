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

## Flujo de aprobación

```
Fase 1 → [Aprobación] → Fase 2 → [Aprobación] → Fase 3 → [Aprobación] → Fase 4 → Fase 5
```

- Cada spec debe incluir **estado** (`Pendiente`, `En revisión`, `Aprobada`) y **fecha de aprobación**.
- No se avanza a la siguiente fase sin aprobación explícita.
- Si durante la implementación se detectan cambios necesarios, se actualiza la spec correspondiente.

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
- **Movimiento**: Una vez implementada y verificada, se mueve la carpeta completa de `wip/` a `done/`.

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
