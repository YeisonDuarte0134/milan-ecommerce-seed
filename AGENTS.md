# AGENTS.md — Milán Ecommerce

> Este archivo orienta a Claude Code sobre cómo trabajar en este repositorio.
> Mantén cada sección **corta y operativa** — el AGENTS.md es contexto que Claude lee cada vez, no documentación general.

---

## Stack del proyecto

- **Next.js 15.5** (App Router) + **TypeScript 5.9** con strict mode
- **React 19** — Server Components por defecto; Client Components solo cuando hay interactividad real
- **Prisma 5.22** + **SQLite** local para los modelos `User` y `CartItem`
- **Tailwind CSS 3.4** para estilos — sin CSS modules ni styled-components
- **Vitest 2.1** + jsdom para tests unitarios y de componentes
- **pnpm 9.15** como gestor de paquetes (pinneado; no usar npm ni yarn)
- **Husky 9** para hooks de pre-commit (deshabilitado en Fase A, se activa en Fase B)
- En la **Fase B**, el catálogo de productos se consulta exclusivamente desde el **MCP de Odoo** (no se persiste en SQLite)

---

## Por qué Next.js 15 con App Router

- **Server Components por defecto**: las páginas no envían JS al cliente a menos que sea necesario, lo que reduce el bundle y mejora el rendimiento en e-commerce
- **Async params**: Next.js 15 requiere `await params` en rutas dinámicas (`Promise<{ slug: string }>`); siempre respetar este patrón
- **Server Actions**: mutaciones (agregar al carrito, login) deben implementarse como Server Actions con `'use server'`, no como rutas API ad-hoc
- **Layouts anidados**: el `app/layout.tsx` define el shell HTML global (header, main, navegación); cada sección puede tener su propio layout sin duplicar el shell

---

## Principios de diseño

1. **SQLite para estado de usuario, Odoo (MCP) para catálogo** — `User` y `CartItem` viven en Prisma/SQLite; los productos se leen solo desde el MCP. Nunca sincronizar ni cachear productos en SQLite.
2. **Módulos de `/lib/` exponen interfaces sin tipos de Prisma ni de MCP** — las capas superiores (pages, actions) no importan `PrismaClient` directamente; solo consumen funciones de `/lib/`. El cliente Prisma singleton vive únicamente en `lib/prisma.ts`.
3. **Precios siempre en centavos (`priceCents: Int`)** — la conversión a COP legible ocurre solo en la UI, nunca en la base de datos ni en el MCP.
4. **Server Components por defecto** — añadir `'use client'` solo cuando se necesite estado local (`useState`/`useEffect`) o event handlers del navegador. Los formularios con Server Actions no requieren Client Components.
5. **Sin lógica de negocio en componentes** — los componentes solo renderizan; las queries a Prisma y las llamadas al MCP van en funciones de `/lib/` o en Server Actions.

---

## Convenciones de código

- **Server vs Client Components**: todo componente en `app/` es Server Component a menos que tenga `'use client'` explícito en la primera línea. El default es Server.
- **Server Actions**: viven en `app/actions/` (un archivo por dominio, ej. `cart.ts`, `auth.ts`) y exportan funciones marcadas con `'use server'`.
- **Archivos de test**: en `tests/` con el patrón `tests/**/*.test.{ts,tsx}`. Nombres descriptivos: `tests/cart.test.ts`, `tests/ProductCard.test.tsx`.
- **Alias de importación**: usar `@/` para importar desde la raíz del proyecto (ej. `@/lib/prisma`, `@/app/actions/cart`).
- **Tamaño máximo de componente**: si un componente supera ~80 líneas, dividirlo en subcomponentes dentro de la misma carpeta.
- **Naming de archivos**: componentes en PascalCase (`ProductCard.tsx`), utilidades y módulos en camelCase (`prisma.ts`, `formatPrice.ts`).
- **Estilos**: solo clases de Tailwind en los JSX. Sin estilos inline ni archivos `.module.css`.

---

## Cómo correr el proyecto

```bash
pnpm install
pnpm db:setup       # genera cliente Prisma, corre migraciones, seed de 20 bicicletas
pnpm dev            # http://localhost:3000
```

> El `.env` debe tener `DATABASE_URL="file:./dev.db"` (no PostgreSQL).

---

## Cómo correr los tests

```bash
pnpm test           # ejecución única
pnpm test:watch     # modo watch
```

---

## Flujo de trabajo esperado

1. **PRD antes de implementar** features no triviales — usar el skill `/write-a-prd` y guardar el PRD en `docs/prds/`.
2. **Test primero** para lógica de negocio (carrito, login, queries): escribir el test que falla, luego implementar.
3. **Conectar capas de afuera hacia adentro**: primero definir la interfaz pública de la función en `/lib/`, luego implementar el cuerpo, luego conectar al componente o action.
4. **Commits atómicos y en inglés** con prefijo convencional: `feat:`, `fix:`, `test:`, `refactor:`, `chore:`. Ejemplo: `feat: add cart item server action`.
5. **Activar Husky en Fase B**: descomentar `pnpm lint` y `pnpm test` en `.husky/pre-commit`. Los commits se bloquean si lint o tests fallan.
6. **No modificar `prisma/schema.prisma`** para almacenar productos — el catálogo viene del MCP de Odoo.

---

## Estructura de rutas

| Ruta | Archivo | Fase | Descripción |
|------|---------|------|-------------|
| `/` | `app/page.tsx` | A/B | Home — grid de productos |
| `/product/[slug]` | `app/product/[slug]/page.tsx` | A/B | Detalle de producto |
| `/cart` | `app/cart/page.tsx` | A/B | Carrito del usuario |
| `/login` | `app/login/page.tsx` | B | Login mock por email |

---

## Modelos de datos (Prisma/SQLite)

```prisma
User       { id, email, createdAt, cartItems[] }
CartItem   { id, userId, productId, quantity, createdAt }
           @@unique([userId, productId])
Product    { id, slug, name, description, priceCents, category, imageUrl?, createdAt }
```

> `Product` existe en el schema local solo como referencia FK de `CartItem`. En Fase B, los datos reales de producto vienen del MCP de Odoo.

---

## MCP disponibles

### MCP de Odoo (`mcp__claude_ai_Odoo_MCP__query`)

- **Cómo se invoca**: tool `mcp__claude_ai_Odoo_MCP__query` con una query en lenguaje natural o SQL sobre los datos de Odoo
- **Qué expone**: catálogo de productos (nombre, precio, descripción, categoría, slug, imágenes), inventario
- **Cuándo usarlo**: en Fase B para todas las lecturas de productos — home, detalle de producto, buscador
- **Restricciones**: solo lectura; no ejecutar queries que modifiquen datos en Odoo; respetar la estructura multicompañía si aplica
- **Log**: el wrapper en `.logs/mcp-postgres-wrapper.py` registra las queries; útil para debugging

---

## Fases del proyecto

| Fase | Alcance |
|------|---------|
| **A** | Estructura de rutas, 1 producto hardcoded, botón "Agregar al carrito", tests smoke |
| **B** | MCP de Odoo para catálogo, grid + buscador server-side, carrito persistido, login mock, Husky activo |
| **C** | Reflexión final en `docs/reflexion.md` |
