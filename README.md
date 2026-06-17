# Senit Web App — DDD por bounded contexts

Proyecto Vite + Vue reorganizado por bounded contexts. La app usa `server/db.json` como fake API local para simular los endpoints que luego se reemplazarán por servicios REST reales.

## Ejecutar

```bash
npm install
npm run dev
```

Fake API con json-server:

```bash
npx json-server --watch server/db.json --port 3000
```

También puedes usar el script equivalente:

```bash
npm run api
```

Compilar:

```bash
npm run build
```

## Variables de entorno

El proyecto incluye:

```txt
.env
.env.development
.env.production
```

Estas variables definen `VITE_API_BASE_URL`, `VITE_PUBLIC_BASE_PATH`, la versión `VITE_APP_VERSION=2.0.0` y los paths de endpoints del fake API. Los endpoints están pensados para `json-server` y coinciden con las colecciones de `server/db.json`.

## Credenciales de prueba

- Recepción: `recepcion@senit.com` / `123456`
- Administrador: `admin@senit.com` / `123456`

## Estructura principal

```txt
src/
  iam/
  front-desk/
  room/
  reservation/
  guest-stay/
  payment/
  housekeeping/
  subscription-payment/
  shared/
  locales/
server/
  db.json
```

## Qué hace cada carpeta

- `iam`: bounded context de identidad y acceso. Contiene inicio de sesión, registro de cuenta administrativa, usuarios del personal y roles. Tiene `domain`, `application`, `infrastructure` y `presentation`: el modelo vive en `domain/model`, el store de sesión vive en `application`, la simulación de autenticación/localStorage y `UsersApi` viven en `infrastructure`, y las pantallas de login/registro/personal viven en `presentation`.
- `front-desk`: bounded context de coordinación de recepción. Contiene dashboard, alertas, configuración, layouts y rutas generales. Tiene `domain`, `application`, `infrastructure` y `presentation`: los modelos de resumen y alerta viven en `domain/model`, `front-desk.store.js` actúa como fachada de aplicación, los adaptadores REST y assemblers viven en `infrastructure`, y las vistas Vue viven en `presentation`.
- `room`: bounded context de habitaciones. Contiene entidades, assembler, API REST simulada, store de aplicación y vistas tanto para recepción como para administración. Por eso aquí está la vista de habitaciones del recepcionista y la vista de registro/estado de habitaciones del administrador.
- `reservation`: bounded context de reservas. Contiene entidad, assembler, API REST simulada, store propio, lista, búsqueda por nombre de huésped, creación y cancelación de reservas.
- `guest-stay`: bounded context de estadías. Contiene entidad, assembler, API REST simulada, store propio, check-in, lista de estadías, detalle de estadía, consumos adicionales y estados como activa, por vencer, vencida sin checkout y finalizada.
- `payment`: bounded context de pagos y comprobantes. Contiene entidad, assembler, API REST simulada, store propio, confirmación de pago, emisión de comprobante PDF y cierre de estadía cuando el pago ya fue confirmado.
- `housekeeping`: bounded context de limpieza/mantenimiento. Contiene modelo, assembler, API REST simulada y store para tareas de limpieza que se generan después del checkout. No tiene `presentation` porque todavía no hay una pantalla independiente de limpieza; sus datos se consumen desde habitaciones, dashboard y checkout.
- `subscription-payment`: bounded context de suscripciones del producto Senit. En esta app interna no tiene una pantalla directa de operación diaria, pero conserva `domain`, `application` e `infrastructure` para representar planes/suscripciones del fake API y dejar el módulo listo para conectar con landing o billing real.
- `shared`: código transversal que no pertenece a un contexto específico: `BaseApi`, `BaseEndpoint`, persistencia local temporal, servicios de fecha, generación de PDF, componente raíz `layout.vue`, componentes comunes y vista 404.
- `locales`: archivos `es.json` y `en.json` para internacionalización. Las vistas de recepción, administración, navegación y componentes nuevos usan estas claves para evitar textos hardcodeados en la interfaz.
- `server`: fake API local. `db.json` contiene solo colecciones REST en kebab-case: `hotels`, `users`, `rooms`, `reservations`, `guests`, `guest-stays`, `consumptions`, `payments`, `invoices`, `cleaning-tasks`, `notifications` y `subscriptions`. No se duplican endpoints como `guestStays`/`guest-stays` ni endpoints derivados como `guest-stays-active`; esos filtros se calculan desde la aplicación.

## Capas usadas dentro de bounded contexts

- `domain`: entidades, value objects y reglas del negocio del contexto.
- `application`: stores o casos de uso usados por la interfaz. Ya no hay stores que solo reexportan otro store; cada bounded context tiene su propia fachada de aplicación.
- `infrastructure`: acceso al fake API mediante Axios, assemblers, repositorios o servicios externos del contexto. `BaseEndpoint` sigue el estilo `return this.http.put(`${this.endpointPath}/${id}`, resource);` del código de referencia.
- `presentation`: rutas, layouts, componentes y vistas Vue. Solo existe cuando el contexto tiene pantalla propia en esta app.

## Layout raíz

`src/app.vue` ahora usa:

```vue
<layout />
```

El componente raíz está en `src/shared/presentation/components/layout.vue` y contiene el `router-view` general. Los layouts específicos de recepción y administración siguen viviendo en `front-desk/presentation/layouts` porque pertenecen a la experiencia operativa de ese bounded context.

## Nota sobre roles

No hay carpetas duplicadas por rol. Cuando un mismo contexto tiene vistas para recepción y administración, ambas viven dentro del mismo bounded context, separadas en `presentation/views` o `presentation/views/admin`.


## Persistencia temporal y futura conexión REST

Mientras no exista el servicio web real, `iam/infrastructure/authentication.api.js` conserva la sesión y los usuarios en `localStorage` con claves sin versión (`senit-webapp-users`, `senit-webapp-current-user`). Esta decisión solo simula endpoints como `POST /authentication/sign-in` y `GET /users` durante el prototipo. Cuando se conecte el backend real, esa clase debe reemplazar esas lecturas locales por llamadas HTTP usando `BaseApi`/`BaseEndpoint` o un endpoint especializado.

`shared/infrastructure/local-persistence.repository.js` hace lo mismo para la base operativa simulada: mantiene cambios de checkout, pagos, comprobantes y estados de habitaciones entre vistas hasta que esas operaciones se persistan en los endpoints reales.
