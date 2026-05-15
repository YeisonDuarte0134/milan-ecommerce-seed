# AGENTS.md — Milán Ecommerce

> Este archivo orienta a Claude Code sobre cómo trabajar en este repositorio.
> Cada sección tiene preguntas guía. Reemplaza las preguntas (en HTML comments) por tus respuestas concretas durante el ejercicio.
> Mantén cada sección **corta y operativa** — el AGENTS.md es contexto que Claude lee cada vez, no documentación general.

## Stack del proyecto

- Next.js 15 (App Router) + TypeScript
- Prisma + SQLite local para User y CartItem
- En la Fase B, el catálogo de productos se consulta desde el **MCP de Odoo** (Ejercicio 1)
- Tests con Vitest, pre-commit con Husky

## Principios de diseño

<!-- Define entre 3 y 5 principios que Claude debe seguir al escribir código aquí.
     Piensa en:
     - ¿Qué decisiones recurrentes quiero que Claude tome igual cada vez?
     - ¿Cómo deberían verse los módulos de /lib/ en cuanto a su interfaz pública?
     - ¿Qué tipos pueden cruzar fronteras entre capas y cuáles no?
     - ¿Qué tan acoplada debe ser la UI a Prisma o al MCP de Odoo? -->

## Convenciones de código

<!-- Lista al menos 3 reglas operativas concretas. Algunas dimensiones a considerar:
     - Server Components vs Client Components: ¿cuál es el default?
     - ¿Dónde viven las server actions?
     - ¿Cómo se nombran los archivos de test?
     - ¿Qué tamaño máximo tiene un componente o módulo antes de dividirse? -->

## Cómo correr el proyecto

```bash
npm install
npm run db:setup
npm run dev
```

## Cómo correr los tests

```bash
npm test
npm run test:watch
```

## Flujo de trabajo esperado

<!-- Describe el ciclo de trabajo que Claude debe seguir al implementar features.
     Pistas: ¿cuándo escribes el test? ¿cuándo escribes un PRD? ¿cuándo haces commit?
     ¿Qué viene primero, conectar capas o profundizar en una?
     ¿Cómo se nombran los commits? -->

## MCP disponibles

<!-- Lista los MCPs que Claude puede usar en este proyecto.
     Para cada uno, anota: cómo se invoca, qué tools expone, en qué casos usarlo.
     ¿Hay restricciones? (ej. solo lectura, no usar SQL crudo, respetar multicompañía). -->
