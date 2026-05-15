# PRD: E-commerce Funcional Milan Bicicletas

## Problem Statement

Se necesita un e-commerce funcional para Milan Bicicletas que permita a los usuarios explorar un catálogo de ~13,500 productos de bicicletas y accesorios almacenados en una base de datos PostgreSQL (Odoo), buscar productos, ver detalles con recomendaciones, gestionar un carrito de compras y autenticarse con un login básico por email. El foco es 100% funcionalidad — sin diseño visual, sin estilos elaborados. Debe funcionar sin fallos y persistir el estado entre recargas.

## Solution

Un e-commerce construido con Next.js 15 (App Router) que consume productos directamente desde PostgreSQL vía MCP (read-only) y gestiona estado de usuarios/carrito en SQLite local vía Prisma. La arquitectura es "deep module": cada módulo (productos, carrito, auth) encapsula complejidad significativa detrás de una interfaz simple y testeable.

### Arquitectura de datos
- **Productos**: PostgreSQL (vía MCP `postgres-local`) — tabla `product_template`, campo `name->>'es_CO'` para nombres, `list_price` para precios en COP
- **Usuarios y Carrito**: SQLite local (vía Prisma) — tablas `User` y `CartItem`
- **Sesión**: Cookie HTTP con email del usuario
- **Carrito anónimo**: `localStorage` del navegador

## User Stories

1. Como usuario, quiero ver los últimos 50 productos publicados al entrar a la página principal, para descubrir productos recientes.
2. Como usuario, quiero un buscador en el header, para encontrar productos por nombre.
3. Como usuario, quiero buscar "bicicleta bmx" y que me traiga productos que contengan ambas palabras en el nombre, para encontrar exactamente lo que busco.
4. Como usuario, quiero que la búsqueda filtre la vista principal (misma URL con query param `?q=`), para no perder contexto de navegación.
5. Como usuario, quiero hacer clic en un producto del listado y ver su vista individual con nombre y precio, para conocer sus detalles.
6. Como usuario, quiero ver una lista de productos recomendados en la vista individual, basados en similitud de nombre con el producto actual, para descubrir productos relacionados.
7. Como usuario, quiero un botón "Agregar al carrito" en la vista individual del producto, que agregue el producto sin pedir cantidad, para una experiencia de compra rápida.
8. Como usuario, quiero ver los productos en mi carrito con la cantidad agregada de cada uno, para saber qué estoy comprando.
9. Como usuario, quiero un botón "Seguir comprando" en el carrito que me redireccione a la vista principal, para continuar explorando productos.
10. Como usuario, quiero iniciar sesión ingresando solo mi email (formato abc@cdf.com), sin contraseña, para una autenticación rápida y simple.
11. Como usuario sin sesión, quiero que mi carrito se guarde en el navegador, para no perder mis productos al recargar la página.
12. Como usuario sin sesión, quiero que al iniciar sesión mis productos del carrito se mantengan, para no perder lo que ya seleccioné.
13. Como usuario con sesión, quiero que al iniciar sesión se haga merge de mi carrito local con cualquier carrito previo en mi cuenta, sumando cantidades de productos duplicados.
14. Como usuario con sesión, quiero que mi carrito y sesión persistan al recargar la página, para no perder mi progreso.
15. Como usuario, quiero que los precios se muestren en formato colombiano ($310.820), para entender los valores fácilmente.
16. Como usuario, quiero que la vista principal muestre los productos más recientes primero (por fecha de creación), para ver las novedades.

## Implementation Decisions

### Módulos Deep

**1. Módulo de Productos (`lib/products.ts`)**
- Interfaz: `getLatestProducts(limit)`, `searchProducts(query)`, `getProductById(id)`, `getRecommendations(productId, limit)`
- Internamente ejecuta queries SQL contra PostgreSQL vía MCP
- Nombres extraídos de JSONB: `name->>'es_CO'`
- Búsqueda: cada palabra del query se busca con `ILIKE` combinadas con `AND`
- Recomendaciones: extrae 2-3 palabras clave significativas del nombre del producto (excluyendo "PARA", "DE", "EN", "LA", "EL", "CON", "Y") y busca productos que contengan al menos una, excluyendo el producto actual, limitado a 5
- Precios formateados como COP con separador de miles ($310.820)

**2. Módulo de Carrito (`lib/cart.ts`)**
- Interfaz: `getCart(userId?)`, `addToCart(productId, userId?)`, `mergeCart(localItems, userId)`
- Sin sesión: operaciones vía `localStorage` (client-side)
- Con sesión: operaciones vía Prisma contra SQLite (server-side)
- Merge al login: combina localStorage + DB, suma cantidades en duplicados, limpia localStorage
- CartItem almacena `userId`, `productId`, `quantity`

**3. Módulo de Autenticación (`lib/auth.ts`)**
- Interfaz: `login(email)`, `logout()`, `getSession()`
- Validación de formato email: regex para `abc@cdf.com`
- Sesión almacenada en cookie HTTP
- Al login: crea usuario en SQLite si no existe, luego merge del carrito
- Sin contraseña, sin tokens, sin expiración compleja

### Decisiones técnicas
- URL de producto: `/product/[id]` usando el `id` numérico de PostgreSQL
- Resultados de búsqueda en la misma vista principal: `/?q=bicicleta`
- Últimos 50 productos ordenados por `create_date DESC`
- Solo productos activos y vendibles (`active = true AND sale_ok = true`)
- Server Components por defecto; `'use client'` solo para carrito y buscador
- Server Actions en `app/actions/` para login, logout y operaciones de carrito con sesión
- Sin estilos elaborados — HTML semántico funcional

## Testing Decisions

- Los tests deben verificar comportamiento externo, no detalles de implementación
- **Módulo de carrito**: testear merge de carritos, adición de productos, persistencia
- **Módulo de auth**: testear validación de email, creación de sesión
- **Smoke tests**: verificar que las rutas cargan sin errores
- Tests existentes en `tests/` como referencia de patrón (vitest + jsdom)

## Out of Scope

- Diseño visual, estilos, CSS elaborado, responsive design
- Proceso de checkout/pago
- Gestión de inventario
- Registro de usuarios (solo login por email)
- Contraseñas o autenticación segura
- Imágenes de productos
- Paginación avanzada (solo los últimos 50)
- Filtros por categoría o precio
- Ordenamiento de resultados
- Edición de cantidades en el carrito (solo agregar)
- Eliminar productos del carrito
- Panel de administración

## Further Notes

- La base de datos PostgreSQL contiene ~13,500 productos activos vendibles, mayormente en categoría "Artículos" sin subcategorías útiles
- Los nombres de productos están en JSONB con claves `es_CO` y `en_US`; se usa `es_CO`
- Los precios están en COP como decimal (ej: 310820.0), no en centavos
- La arquitectura deep module permite que cada módulo sea testeable en aislamiento con una interfaz mínima
- Commits atómicos con prefijos convencionales (feat:, fix:, test:, etc.)
