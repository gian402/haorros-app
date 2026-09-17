<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Haorros · Nueva contraseña</title>
<style>body{font:16px system-ui;background:#111827;color:#f9fafb;max-width:420px;margin:8vh auto;padding:24px}input,button{box-sizing:border-box;width:100%;padding:12px;margin:8px 0 20px;border-radius:8px}button{background:#e8bd47;border:0;font-weight:bold}.error{color:#fca5a5}</style></head>
<body><h1>Nueva contraseña</h1><p>Elige una contraseña para volver a entrar en Haorros.</p>
@if ($errors->any()) <p class="error">{{ $errors->first() }}</p> @endif
<form method="POST" action="{{ route('password.update') }}">
@csrf
<input type="hidden" name="token" value="{{ $token }}">
<label>Correo<input type="email" name="email" value="{{ $email }}" required autocomplete="email"></label>
<label>Nueva contraseña<input type="password" name="password" minlength="8" maxlength="72" required autocomplete="new-password"></label>
<label>Repite la contraseña<input type="password" name="password_confirmation" minlength="8" maxlength="72" required autocomplete="new-password"></label>
<button type="submit">Guardar contraseña</button>
</form></body></html>
