const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'Correo o contraseña incorrectos',
  'Email not confirmed': 'Confirma tu correo antes de iniciar sesión',
  'User already registered': 'Este correo ya está registrado',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 8 caracteres',
  'Unable to validate email address: invalid format': 'El formato del correo no es válido',
  'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos',
  'For security purposes, you can only request this once every 60 seconds': 'Espera 60 segundos antes de volver a intentarlo',
  'Token has expired or is invalid': 'El enlace expiró. Solicita uno nuevo',
  'Network request failed': 'Sin conexión a internet',
};

export function translateAuthError(msg: string): string {
  for (const [key, val] of Object.entries(ERROR_MAP)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return msg || 'Ocurrió un error. Intenta de nuevo';
}
