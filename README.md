# Haorros

App de ahorro compartido con React Native + TypeScript y una API Laravel 12 + MySQL.
Esta versión comienza con usuarios y datos nuevos. No importa ni elimina datos de Supabase.

## Estructura

- `src/`: app móvil, servicios HTTP y sesión en el almacén seguro del dispositivo.
- `backend/`: API Laravel, migraciones y pruebas.
- `docs/CPANEL.md`: instalación del backend en cPanel.

## Backend local

1. En `backend/`, ejecutar `composer install`.
2. Copiar `.env.example` a `.env` y configurar una base MySQL nueva.
3. Ejecutar `php artisan key:generate` y `php artisan migrate`.
4. Ejecutar `php artisan serve`.

No hay usuarios precargados: crear la primera cuenta desde la app.
`MAIL_MAILER=log` es solo para desarrollo; el envío real requiere SMTP.

## App

```sh
npm ci
node scripts/configure-api.cjs https://api.tudominio.com/api
npm run android
```

La dirección anterior es un ejemplo; sustituirla por el backend real. El archivo
`src/api/config.json` se incorpora al bundle. Un archivo `.env` por sí solo no
inyecta variables en React Native. Para desarrollo local se puede editar
`baseUrl` en ese JSON; HTTP solo se acepta con `__DEV__` y requiere la
configuración de red apropiada del dispositivo. Para el APK se exige HTTPS.

Para iOS, instalar Pods después de `npm ci` en un Mac.
Las sesiones antiguas de Supabase no se reutilizan.

## GitHub Actions

- **Build Android APK**: en cada push a `main` o ejecución manual.
  Configurar la variable de repositorio `API_BASE_URL` con
  `https://api.tudominio.com/api`. Se descarga el APK debug desde Artifacts.
- **Test and package Laravel**: prueba la API con MySQL 8/PHP 8.2 y verifica
  TypeScript. En el job del backend produce un ZIP con dependencias de
  producción para subir a cPanel. No publica automáticamente en el hosting.

Los secrets anteriores de Supabase ya no se usan. No colocar las credenciales
MySQL en la app ni en `API_BASE_URL`.

## Validación

```sh
npm run type-check
node --test tests/api-client.test.cjs
cd backend
php vendor/bin/phpunit
```

Por defecto PHPUnit usa SQLite en memoria, sin tocar la base de la aplicación.
En Windows con las DLL disponibles pero desactivadas:

```powershell
php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/phpunit
```

Para probar MySQL, usar una base exclusiva de pruebas y definir `DB_CONNECTION=mysql`,
`DB_DATABASE=haorros_test`, `DB_HOST`, `DB_USERNAME` y `DB_PASSWORD` en el entorno
del proceso. Las pruebas recrean las tablas de esa base.

## Comportamiento

- El servidor obtiene el usuario del token; no confía en los IDs enviados por la app.
- Solo el dueño administra la meta. Los miembros pueden consultarla y aportar.
- Aportes y saldo se guardan en una transacción con bloqueo de fila.
- Cada aporte admite una clave de idempotencia para reintentos.
- Dinero en MySQL: DECIMAL(12,2); validación de montos y límite de la meta.
- Metas e historial se actualizan cada 10 segundos mientras la app está activa.
  Esto reemplaza Supabase Realtime y no requiere un proceso WebSocket.
- Los tokens expiran a los 30 días. Después se vuelve a iniciar sesión.
- Imágenes JPEG, PNG o WebP de hasta 5 MB. Las URLs de imágenes son públicas,
  como en el sistema anterior; los datos financieros requieren autenticación.

Consultar `docs/CPANEL.md` antes del despliegue.
