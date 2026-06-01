# Haorros — Roadmap a App Profesional

## 🔴 Crítico (antes de mostrarla a alguien)

### Seguridad
- [x] Política RLS DELETE en tabla `goals` — solo el owner puede borrar ✅
- [x] Política RLS DELETE en tabla `goal_members` — solo el owner puede eliminar miembros ✅
- [x] Contraseña mínima 8 caracteres ✅
- [x] Quitar credenciales hardcodeadas → `.env` ✅

### Funcionalidad básica faltante
- [x] Pantalla "Olvidé mi contraseña" con envío de email de recuperación ✅
- [ ] Confirmación de email al registrarse *(omitido por decisión)*
- [x] Editar meta (nombre, monto objetivo) ✅
- [x] Eliminar miembro de una meta compartida ✅
- [x] Validar que el monto a agregar no supere lo que falta para la meta ✅

### Estabilidad
- [x] Detectar sin internet y mostrar mensaje ✅
- [x] Redirigir al login cuando el token de sesión expira ✅
- [x] Traducir errores de Supabase al español ✅

---

## 🟡 Para competir con apps reales

### Funcionalidad
- [ ] Notificaciones push (Firebase FCM) *(requiere Firebase)*
- [x] Fecha límite en metas con countdown "X días restantes" ✅
- [x] Categorías de metas con íconos ✅
- [x] Meta completada al 100% → animación de confetti ✅
- [x] Historial con filtros por fecha y por usuario ✅
- [ ] Exportar historial como imagen *(requiere librería extra)*

### Perfil
- [x] Foto de perfil (sube a Storage, persiste en tabla users, visible para todos) ✅
- [x] Cambiar nombre desde perfil ✅
- [x] Cambiar contraseña desde perfil ✅
- [x] Estadísticas: total ahorrado, metas activas, completadas ✅

### UX / Diseño
- [ ] Tipografía Poppins o Inter *(requiere fuentes nativas)*
- [x] Skeleton loaders en HomeScreen ✅
- [x] Splash screen animado ✅
- [x] Onboarding (3 slides, solo primera vez) ✅
- [x] FAB dorado para crear meta (abre modal real) ✅
- [x] Botones rápidos +50 / +100 / +200 en modal de agregar dinero ✅
- [x] ProgressBar con color dinámico: rojo <30%, amarillo 30-80%, verde >80% ✅
- [x] Haptic feedback al confirmar acciones importantes ✅
- [x] Badge "👥 N miembros" en GoalCard ✅
- [x] Empty states con ilustración ✅
- [x] Input con borde animado al hacer focus ✅

---

## 🟢 Requisitos formales Play Store *(omitido por ahora)*

---

## 📊 Resumen

| Categoría | Tareas | Estado |
|-----------|--------|--------|
| 🔴 Crítico | 12 | **11 / 12** ✅ |
| 🟡 Competitivo | 19 | **15 / 19** ✅ |
| 🟢 Play Store | — | Omitido |
| **Total completado** | | **26 / 31** |

> Pendientes: confirmación de email (omitido), Firebase FCM, exportar historial, tipografía personalizada (requieren dependencias externas).
