# Publicar Haorros en cPanel

## Antes de subir

Confirmado en las capturas: PHP 8.2, PHP-FPM y las herramientas de bases de datos.
Aún hay que confirmar el dominio, las extensiones PHP y el acceso a la consola.
El icono «Acceso SSH» no garantiza una shell habilitada.

Elegir un subdominio dedicado, por ejemplo `api.tudominio.com`, con HTTPS.
Laravel 12 requiere PHP 8.2 o superior y sus extensiones habituales:
https://laravel.com/docs/12.x/deployment.
Para esta app habilitar también `pdo_mysql`, `fileinfo` y soporte de imágenes.

## Crear una base vacía

En **Manage My Databases**:

1. Crear una base nueva, por ejemplo `usuario_haorros`.
2. Crear un usuario y asignarlo a esa base con todos sus privilegios.
3. Guardar la contraseña en el `.env` del servidor.
4. No reutilizar ni borrar bases de otros sitios.

Laravel crea el esquema MySQL nuevo mediante migraciones. No se usan los SQL del sistema anterior.

## Archivos y directorio público

Subir el contenido de `backend/` a una carpeta fuera de `public_html`,
por ejemplo `/home/USUARIO/haorros-backend`.

Hay dos opciones:

- Subir fuentes y ejecutar `composer install --no-dev --optimize-autoloader` por SSH.
- Descargar el artifact **haorros-backend-cpanel** de GitHub Actions.
  Contiene un ZIP con `vendor/`; extraerlo en la carpeta del backend.

Configurar el document root del subdominio para que apunte a
`/home/USUARIO/haorros-backend/public`.
No exponer la raíz del proyecto ni su `.env`.
Si el hosting no permite ese document root, consultar al proveedor antes de
mover archivos; no colocar todo el backend dentro de una carpeta pública.

La carpeta `public/` incluye `.htaccess` y conserva la cabecera Authorization.
Habilitar escritura del usuario PHP en `storage/` y `bootstrap/cache/`.
No usar permisos 777. Las imágenes se sirven por Laravel desde `/media/...`;
no es necesario `storage:link`.

## Configuración del servidor

Copiar `.env.example` a `.env` y editar:

```dotenv
APP_NAME=Haorros
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.tudominio.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=usuario_haorros
DB_USERNAME=usuario_haorros
DB_PASSWORD="CONTRASEÑA_DE_LA_BASE"

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync

MAIL_MAILER=smtp
MAIL_SCHEME=smtp
MAIL_HOST=servidor.smtp.real
MAIL_PORT=587
MAIL_USERNAME=correo@tudominio.com
MAIL_PASSWORD="CONTRASEÑA_DEL_CORREO"
MAIL_FROM_ADDRESS=correo@tudominio.com
MAIL_FROM_NAME=Haorros
```

Usar los datos y puerto del proveedor de correo. Si exige TLS implícito en 465,
configurar `MAIL_SCHEME=smtps`. `MAIL_MAILER=log` no envía correos.
El enlace de recuperación abre una página del backend para elegir contraseña.

Desde la carpeta del backend, con el ejecutable PHP 8.2 del hosting:

```sh
php -v
php artisan key:generate --force
php artisan migrate --force
php artisan optimize
```

Generar la clave una sola vez en la primera instalación; no cambiarla en cada actualización.
No ejecutar `migrate:fresh` en una base con datos.
Si la shell usa otra versión de PHP, usar la ruta PHP 8.2 que indique el hosting.
Si no hay SSH/Terminal, pedir al proveedor ejecutar estos comandos;
no publicar scripts de instalación sin autenticación.

## APK y comprobación

1. Probar `https://api.tudominio.com/up` y la raíz del backend.
2. En GitHub: Settings → Secrets and variables → Actions → **Variables**.
3. Crear `API_BASE_URL=https://api.tudominio.com/api`.
4. Ejecutar **Build Android APK** y descargar el artifact.
5. Instalar el APK y registrar usuarios nuevos.
6. Probar login, recuperación por correo, foto, meta compartida, aportes,
   gastos, préstamos y cierre de sesión.
7. Probar con dos cuentas: una cuenta ajena no debe ver ni modificar la meta.

El APK actual sigue siendo debug para instalación directa. Publicar en Google
Play requiere configurar la firma de distribución por separado.

## Actualizaciones y mantenimiento

El workflow empaqueta el backend, pero no accede ni despliega en cPanel.
Para actualizar, conservar `.env`, `storage/` y los datos MySQL; respaldarlos.
Subir el nuevo código y vendor, ejecutar `php artisan migrate --force` y
`php artisan optimize`. Programar limpieza de tokens expirados, por ejemplo
`php artisan sanctum:prune-expired --hours=24` diariamente.

Las imágenes anteriores quedan en storage si se sustituye una foto o se borra
una meta. Planificar su limpieza y las copias de seguridad del hosting.

## Estado de validación local

Las pruebas automatizadas cubren permisos, sesiones, importes, rollback de
aportes, idempotencia, imágenes y recuperación de contraseña. Por defecto se
ejecutan con SQLite en memoria. El workflow repite las pruebas con MySQL 8 y PHP
8.2. Ejecutarlo antes del primer despliegue; el bloqueo concurrente de MySQL no
queda validado por SQLite.

Todavía hace falta probar SMTP, HTTPS, subida de imágenes y el APK en el hosting
real. No se ha importado ni eliminado nada de Supabase.
