# Backend Haorros

API Laravel 12 para PHP 8.2 y MySQL. Comienza vacía, sin usuarios de ejemplo.

Consultar [la guía de cPanel](../docs/CPANEL.md) y el [README principal](../README.md).

Instalación: `composer install`, copiar `.env.example` a `.env`,
configurar MySQL, ejecutar `php artisan key:generate` y `php artisan migrate`.

Pruebas: `php vendor/bin/phpunit` (SQLite en memoria por defecto).

Las rutas de API usan el prefijo `/api`. Consultarlas con
`php artisan route:list --except-vendor`. Todas las operaciones de usuario
requieren `Authorization: Bearer <token>` salvo registro, login y recuperación.
