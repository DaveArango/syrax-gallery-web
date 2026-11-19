# Syrax Gallery Web

Frontend en Angular de **Syrax Gallery**, un marketplace de arte donde los artistas (**Azantys**) venden obras (**Caraxes**) y ofrecen servicios artísticos por encargo (**Sunfyre**), y los compradores (**Zentys**) compran obras y reservan servicios (**Dohaeragon**). El pago de los servicios queda retenido en un depósito en garantía (**Kelitis**) hasta que el servicio se ejecuta.

Proyecto de Programación Avanzada (01N), Universidad del Quindío. **Entrega 3: frontend conectado al backend.**

## Nicho

Marketplace de arte: obras físicas y servicios artísticos por encargo, con temática de Juego de Tronos y La Casa del Dragón.

## Integrantes

| Integrante | Parte principal |
|---|---|
| Valery Andrea Ortiz Mesa | <completar: por ejemplo, Bootstrap, catálogo, paneles, detalle y diseño> |
| Jhonatan David Vivas Arango | <completar: por ejemplo, guards, avisos y carrito> |

## Repositorios

- Frontend: https://github.com/DaveArango/syrax-gallery-web
- Backend: <enlace al repositorio del backend>

## Cómo ejecutar

Requisitos: Java 21, Node.js (la versión que pida Angular 21; compruébala con `node -v`) y npm.

**1. Backend** (en la carpeta del backend):

```bash
./gradlew bootRun
```

Queda en http://localhost:8080 (Swagger: http://localhost:8080/swagger-ui.html). La base de datos es H2 en memoria, así que los datos se reinician cada vez que se apaga el backend.

**2. Frontend** (en esta carpeta):

```bash
npm install
ng serve
```

Abre http://localhost:4200. El backend permite ese origen por CORS.

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

El administrador (`admin@syraxgallery.com`) solo se usa desde Swagger; el frontend no tiene pantallas para ese rol.

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
| `/mis-servicios` | Zentys | Servicios reservados y sus pagos |
| `/taller/obras` | Azantys | Crear, publicar y retirar sus obras |
| `/taller/servicios` | Azantys | Crear y gestionar sus servicios |
| `/taller/agenda` | Azantys | Agenda de sus servicios |
| `/taller/ventas` | Azantys | Ventas de sus obras |
| `/admin/verificaciones` | Administrador | Aprobar o rechazar la identidad de los Azantys |

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

## Git

Una rama por funcionalidad (`feature/...`, `fix/...`, `refactor/...`, `docs/...`) y todo entra a `main` por Pull Request.