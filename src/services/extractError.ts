/**
 * Extrae un mensaje legible de cualquier tipo de error:
 * - Error estándar de JS
 * - PostgrestError de Supabase ({ message, details, hint, code })
 * - String
 * - Objeto desconocido
 */
export function extractError(e: unknown): string {
  if (!e) return 'Error desconocido';
  if (typeof e === 'string') return e;
  if (e instanceof Error) return e.message;
  // PostgrestError shape
  if (typeof e === 'object') {
    const obj = e as Record<string, unknown>;
    if (typeof obj.message === 'string') return obj.message;
    if (typeof obj.error_description === 'string') return obj.error_description;
    if (typeof obj.msg === 'string') return obj.msg;
  }
  return 'Ocurrió un error inesperado';
}
