# ReportFraud AI — Backend

<p align="center">
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
  </a>
</p>

## Descripción

**ReportFraud AI** es un proyecto orientado al registro, consulta y gestión de reportes relacionados con posibles fraudes digitales.

Este repositorio contiene el **backend del sistema**, desarrollado con NestJS y TypeScript, que proporciona una API REST para la autenticación de usuarios, administración de reportes y control de acceso mediante roles.

La información se almacena en una base de datos MySQL.

## Tecnologías utilizadas

- **Node.js:** entorno de ejecución.
- **NestJS:** framework para el desarrollo del backend.
- **TypeScript:** lenguaje de programación.
- **MySQL:** base de datos relacional.
- **mysql2/promise:** conexión y consultas a MySQL.
- **JWT:** autenticación mediante tokens.
- **class-validator:** validación de los datos recibidos por la API.

## Requisitos previos

Para ejecutar el proyecto se necesita:

- Node.js y npm instalados.
- MySQL Server instalado y en ejecución.
- Base de datos `ReportFraudAI` con el esquema correspondiente.
- Credenciales válidas de acceso a MySQL.

## Instalación

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd <CARPETA_DEL_PROYECTO>
```

Sustituir los valores entre los signos de menor y mayor por la URL y el nombre correspondientes.

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar la base de datos

El backend utiliza el archivo `src/database/database.module.ts` para administrar la conexión a MySQL mediante un pool de conexiones.

La configuración local contempla:

| Parámetro | Valor |
|---|---|
| Servidor | localhost |
| Puerto | 3306 |
| Base de datos | ReportFraudAI |
| Motor | MySQL |

Es necesario contar con las tablas y relaciones de la base de datos del proyecto.

## Ejecución del backend

Para iniciar el servidor en modo desarrollo:

```bash
npm run start:dev
```

Otros comandos disponibles:

```bash
# Ejecución normal
npm run start

# Ejecución en modo producción
npm run start:prod
```


## Funcionalidades del backend

### Autenticación

El sistema cuenta con mecanismos de autenticación mediante JWT, que permiten:

- Iniciar sesión.
- Generar tokens de acceso y actualización.
- Verificar la autenticidad de las solicitudes.
- Identificar el rol asociado al usuario.

### Control de acceso por roles

El backend contempla tres roles principales:

| Rol | Permisos |
|---|---|
| Usuario reportante | Crear reportes, consultar reportes y modificar o eliminar los propios. |
| Administrador | Consultar, modificar y eliminar reportes. |
| Policía cibernética | Consultar reportes. |

La autorización se implementa mediante `AuthGuard`, `RolesGuard` y el decorador `@Roles()`.

### Gestión de reportes

El backend permite realizar operaciones de creación, consulta, actualización y eliminación de reportes.

Los reportes incluyen información relacionada con el incidente, como:

- Descripción.
- Plataforma involucrada.
- Entidad reportada.
- Subcategoría.
- Estado del reporte.
- Opción de publicación anónima.

La publicación anónima está destinada a ocultar la identidad del autor ante otros usuarios, sin convertir el reporte en privado. La implementación completa de esta protección está pendiente de revisión.

## Endpoints principales

### Reportes

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/reportes` | Bearer | Crear un reporte. |
| GET | `/reportes` | Bearer | Consultar reportes del usuario autenticado. |
| GET | `/reportes/:id` | Bearer | Consultar un reporte por su identificador. |
| PATCH | `/reportes/:id` | Bearer | Actualizar un reporte según los permisos. |
| DELETE | `/reportes/:id` | Bearer | Eliminar un reporte según los permisos. |

Las rutas protegidas requieren el encabezado:

`Authorization: Bearer <accessToken>`

Sin un token válido responden con `401 Unauthorized`.

Las rutas de reportes están protegidas mediante autenticación JWT.

### Autenticación

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/register` | Registrar un nuevo usuario. |
| POST | `/auth/login` | Iniciar sesión y obtener `accessToken` y `refreshToken`. |
| POST | `/auth/refresh` | Generar un nuevo `accessToken` a partir del `refreshToken`. |

## Estructura principal del proyecto

```text
src/
├── auth/
│   ├── dto/
│   ├── entities/
│   ├── auth.service.ts
│   ├── auth.guard.ts
│   ├── roles.decorator.ts
│   └── roles.guard.ts
│
├── database/
│   └── database.module.ts
│
├── reportes/
│   ├── dto/
│   ├── entities/
│   ├── reportes.controller.ts
│   ├── reportes.module.ts
│   ├── reportes.repository.ts
│   └── reportes.service.ts
│
├── app.module.ts
└── main.ts
```

## Seguridad

El backend incorpora los siguientes mecanismos:

- Autenticación mediante JWT.
- Protección de endpoints mediante guards.
- Control de acceso basado en roles.
- Verificación de propiedad para modificar y eliminar reportes.
- Validación de datos mediante DTO.
- Rechazo de propiedades no permitidas en las solicitudes.

Estos mecanismos requieren pruebas adicionales para verificar su correcto funcionamiento y detectar posibles vulnerabilidades.

## Pruebas

El proyecto incluye comandos para ejecutar pruebas con las herramientas configuradas por NestJS.

```bash
# Pruebas unitarias
npm run test

# Pruebas extremo a extremo
npm run test:e2e

# Cobertura de pruebas
npm run test:cov
```

Las pruebas funcionales y de seguridad completas, así como sus evidencias, se documentarán en una etapa posterior.

## Estado del proyecto

El backend se encuentra en desarrollo.

### Funcionalidades implementadas

- Conexión con MySQL.
- Autenticación mediante JWT.
- Manejo de roles.
- Protección de endpoints.
- Operaciones principales de reportes.
- Validación de solicitudes.

### Funcionalidades pendientes

- Completar la consulta comunitaria de reportes.
- Revisar la protección de identidad de reportes anónimos.
- Migrar las credenciales de MySQL a variables de entorno.
- Fortalecer la seguridad de las consultas SQL.
- Documentación OpenAPI/Swagger disponible en `/docs`.
- Realizar pruebas funcionales y de seguridad.
- Registrar resultados y evidencias.

## Documentación de la API

La documentación interactiva de la API está disponible en:

`http://localhost:3000/docs`

El documento OpenAPI en formato JSON está disponible en:

`http://localhost:3000/docs-json`


## Documentación adicional

La documentación técnica del proyecto se ampliará conforme avance el desarrollo del backend.

Se contempla incluir información sobre la arquitectura, base de datos, autenticación, autorización y pruebas de seguridad.

## Referencias

- [Documentación oficial de NestJS](https://docs.nestjs.com/)
- [Documentación oficial de Node.js](https://nodejs.org/)
- [Documentación oficial de MySQL](https://dev.mysql.com/doc/)