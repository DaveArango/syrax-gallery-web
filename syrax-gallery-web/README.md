# Syrax Gallery Web

Frontend en Angular de **Syrax Gallery**, un marketplace de arte donde los artistas (**Azantys**) venden obras (**Caraxes**) y ofrecen servicios artísticos por encargo (**Sunfyre**), y los compradores (**Zentys**) compran obras y reservan servicios (**Dohaeragon**). El pago de los servicios queda retenido en un depósito en garantía (**Kelitis**) hasta que el servicio se ejecuta y el comprador lo aprueba.

Proyecto de Programación Avanzada (01N), Universidad del Quindío. **Entrega 3: frontend conectado al backend.**

## Nicho

Marketplace de arte: obras físicas y servicios artísticos por encargo (arte en piel, murales, retratos y customización), con temática de Juego de Tronos y La Casa del Dragón.

## Integrantes

| Integrante | Parte principal |
|---|---|
| Valery Andrea Ortiz Mesa | Backend: Azantys, Sunfyre y Kelitis. Frontend: Bootstrap, catálogo, paneles del artista, detalle y diseño |
| Jhonatan David Vivas Arango | Backend: Zentys, Caraxes, configuración JWT, Swagger y manejo de errores. Frontend: login, guards, interceptor, avisos y carrito |

## Repositorios

- Frontend: https://github.com/DaveArango/syrax-gallery-web
- Backend: https://github.com/DaveArango/syrax-gallery

## Tecnologías

| Parte | Tecnologías |
|---|---|
| Frontend | Angular 21 (componentes standalone, signals, formularios reactivos), TypeScript, RxJS, Bootstrap 5, Font Awesome, Vitest |
| Backend | Java 21, Spring Boot, Spring Security con JWT (HS256), Spring Data JPA, Swagger / OpenAPI, Gradle |
| Base de datos | MariaDB en Docker (los datos persisten). H2 en memoria solo como alternativa rápida |
| Imágenes | Cloudinary (el backend solo guarda la URL) |

## Cómo ejecutar

Requisitos: Java 21, Node.js compatible con Angular 21 (compruébalo con `node -v`) y npm. Docker, para la base de datos MariaDB.

### 1. Base de datos (MariaDB en Docker)

El backend usa MariaDB en un contenedor de Docker, en el puerto **3307**, con la base `ecommercedb` y usuario `root` / contraseña `root`. Si ya tienes el contenedor creado, solo inícialo; si no, créalo:

```bash
# primera vez
docker run -d --name syrax-mariadb -p 3307:3306 \
  -e MARIADB_ROOT_PASSWORD=root -e MARIADB_DATABASE=ecommercedb mariadb:11

# las siguientes veces
docker start syrax-mariadb
```

Comprueba que esté corriendo con `docker ps`. Los datos quedan guardados: siguen ahí aunque se apague el backend o el contenedor.

### 2. Backend

Clona el repositorio del backend y, en su carpeta, arráncalo con el perfil `mariadb`:

```bash
./gradlew bootRun --args='--spring.profiles.active=mariadb'
```

Queda en http://localhost:8080.

- Swagger: http://localhost:8080/swagger-ui.html
- Pruebas: `./gradlew test`

El perfil `mariadb` (`application-mariadb.properties`) se conecta a `jdbc:mariadb://localhost:3307/ecommercedb`, crea o actualiza las tablas solas (`ddl-auto=update`) y no recarga los datos de ejemplo en cada arranque. Los usuarios de prueba se crean al iniciar.

> Alternativa rápida sin Docker: `./gradlew bootRun` (sin perfil) usa H2 en memoria con datos de ejemplo, que se reinician al apagar el backend (consola en http://localhost:8080/h2-console, JDBC URL `jdbc:h2:mem:syraxdb`, usuario `sa`, sin contraseña).

### 3. Frontend

En la carpeta de este repositorio:

```bash
npm install
ng serve
```

Abre http://localhost:4200. El backend permite ese origen por CORS. El frontend espera el backend en `http://localhost:8080`, así que **arranca primero MariaDB y el backend**.

Pruebas del frontend: `ng test`.

## Usuarios de prueba

| Correo | Contraseña | Rol |
|---|---|---|
| alicent.hightower@gmail.com | alicent123 | ZENTYS |
| aegon.targaryen@gmail.com | aegon123 | ZENTYS |
| helaena.targaryen@gmail.com | helaena123 | ZENTYS |
| rhaenyra@syraxgallery.com | rhaenyra123 | AZANTYS (identidad aprobada) |
| baela@syraxgallery.com | baela123 | AZANTYS (identidad aprobada) |
| daemon@syraxgallery.com | daemon123 | AZANTYS (sin verificar) |
| laena@syraxgallery.com | laena123 | AZANTYS (sin foto de perfil) |
| admin@syraxgallery.com | admin123 | ADMIN |

El rol ADMIN aprueba o rechaza la identidad de los artistas desde `/admin/verificaciones` (también se puede usar desde Swagger).

Las cuentas nuevas se crean en `/registro` y necesitan una contraseña de mínimo 8 caracteres con una mayúscula y un número.

## Pantallas

| Ruta | Acceso | Qué hace |
|---|---|---|
| `/` | Público | Inicio |
| `/login` | Sin sesión | Inicio de sesión con JWT |
| `/registro` | Sin sesión | Registro de Zentys y Azantys |
| `/catalogo/obras` | Público | Obras con búsqueda, filtro por tipo y paginación |
| `/catalogo/servicios` | Público | Servicios con filtros por tipo, ciudad y precio |
| `/obra/:id` | Público | Detalle de la obra, con comentarios y más obras del mismo tipo |
| `/servicio/:id` | Público | Detalle del servicio, con horas libres y reserva |
| `/comprar/:id` | Zentys | Compra de una obra |
| `/carrito` | Zentys | Carrito de compras |
| `/mis-compras` | Zentys | Compras realizadas y su estado |
| `/mis-servicios` | Zentys | Servicios reservados, sus pagos y aprobación del Kelitis |
| `/taller/obras` | Azantys | Crear, publicar y retirar sus obras |
| `/taller/servicios` | Azantys | Crear y gestionar sus servicios |
| `/taller/agenda` | Azantys | Agenda de sus servicios |
| `/taller/ventas` | Azantys | Ventas de sus obras |
| `/taller/perfil` | Azantys | Perfil del artista |
| `/admin/verificaciones` | Administrador | Aprobar o rechazar la identidad de los Azantys |

## Cómo cumple la Entrega 3

| Requisito | Dónde está |
|---|---|
| Conexión con el backend, cero datos quemados | Todas las pantallas piden sus datos a la API a través de servicios |
| Interfaces espejo de los DTO | `src/app/modelos/` |
| Un servicio por grupo de endpoints | `src/app/servicios/` (Auth, Caraxes, Sunfyre, Kelitis, Sindes, ...) |
| CORS | El backend permite `http://localhost:4200` (`SecurityConfig`) |
| Login real con JWT | `componentes/login` + `AuthService`: formulario reactivo con validaciones, token y roles en `localStorage`, menú según la sesión y cierre de sesión sin recargar |
| Interceptor | `interceptores/auth-interceptor.ts`: agrega `Authorization: Bearer <token>` y, ante un 401, cierra sesión, avisa y manda al login |
| Guards | `guards/auth-guard.ts`: `guestGuard` (saca de `/login` y `/registro` a quien ya tiene sesión) y `rolGuard` (exige sesión y rol; protege las rutas del comprador, del artista y del admin) |
| Catálogo paginado y con búsqueda | `componentes/catalogo-obras`: `page` y `size` y la búsqueda los resuelve el backend; sin obras retiradas; mensaje cuando no hay resultados |
| Operación de negocio con formulario | `componentes/comprar`: formulario reactivo, POST protegido, botón que se apaga mientras envía y códigos HTTP traducidos a mensajes |
| Avisos | `servicios/notificaciones.ts` + `componentes/notificaciones`: éxito, error e info que desaparecen a los 5 s |
| Maquetación con Bootstrap | Instalado en `angular.json`; navbar con menú hamburguesa, tarjetas en cuadrícula adaptable y formularios con clases de Bootstrap |
| Funcionalidad propia | **Kelitis** (depósito en garantía): el pago de un servicio queda retenido y el comprador lo libera al aprobar el servicio en `/mis-servicios` |

### Extras implementados

- Búsqueda reactiva con **Signals**: el catálogo busca mientras se escribe (debounce de 400 ms) y combina texto, tipo y página con señales.
- **Guard por rol**: rutas solo para Zentys, Azantys o Admin; el menú solo muestra las opciones del rol.
- **MariaDB en Docker**: el backend se conecta a MariaDB y los datos persisten tras reiniciar.
- **Imágenes en Cloudinary**: las imágenes se suben a un servicio externo y solo se guarda la URL.
- **Diseño propio**: paleta vino y crema, tipografías Cinzel y EB Garamond, temática de Westeros.
- Otras funcionalidades: carrito de compras, comentarios en las obras y reserva de servicios con horas libres.

## Flujo de prueba de punta a punta

1. Inicia sesión como `alicent.hightower@gmail.com` / `alicent123`.
2. Abre **Catálogo**, busca una obra por texto, cambia de página y filtra por tipo.
3. Agrega una obra al carrito o presiona **Comprar**, confirma y envía: aparece el aviso de éxito y pasas a **Mis compras**.
4. Prueba un error a propósito: en `/comprar/cx-999` el backend responde 404 y se ve "Esa obra no existe."
5. Con `aegon.targaryen@gmail.com` / `aegon123`, abre **Mis servicios** y usa **Aprobar y liberar pago** en la reserva completada.
6. Cierra sesión: el menú vuelve a "Iniciar sesión" sin recargar.
7. Sin sesión, escribe `/taller/obras` en la barra de direcciones: te manda al login.

> Los datos persisten en MariaDB: una obra comprada o un pago aprobado no se puede repetir. Para el paso 3 y el 5 usa una obra en venta sin comprar y una reserva completada con pago retenido.

## Organización del código

```
src/app/
├── componentes/   Pantallas y piezas reutilizables (paginación, avisos, header, footer)
├── servicios/     Un servicio por grupo de endpoints (AuthService, CaraxesService, ...)
├── modelos/       Interfaces espejo de los DTO de respuesta del backend
├── guards/        guestGuard (saca de /login a quien ya tiene sesión) y rolGuard (por rol)
├── interceptores/ authInterceptor: agrega el Bearer y maneja el 401
└── utilidades/    Traducción de errores HTTP a mensajes
```

## Lenguaje del dominio

| Término | Significado |
|---|---|
| Azantys | Artista (vendedor) |
| Zentys | Comprador |
| Caraxes | Obra física |
| Sunfyre | Servicio artístico por encargo |
| Dohaeragon | Reserva de un servicio |
| Kelitis | Depósito en garantía del pago de un servicio |
| Sindes | Compra de una obra |
| Kanez | Estado de publicación: BORRADOR, EXHIBICION, EN_VENTA, VENDIDO, RETIRADO |

El glosario completo está en el repositorio del backend (`docs/glosario-lenguaje-ubicuo.md`).

## Git

Una rama por funcionalidad (`feature/...`, `fix/...`, `refactor/...`, `docs/...`) y todo entra a `main` por Pull Request, con commits de los dos integrantes.