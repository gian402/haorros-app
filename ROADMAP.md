# Haorros — Roadmap a App Profesional

## 🔴 Crítico (antes de mostrarla a alguien)

### Seguridad
- [ ] Política RLS DELETE en tabla `goals` — cualquier usuario autenticado puede borrar metas ajenas
- [ ] Contraseña mínima 8 caracteres (ahora acepta 6)
- [ ] Quitar credenciales hardcodeadas en `src/supabase/client.ts`, usar solo variables de entorno

### Funcionalidad básica faltante
- [ ] Pantalla "Olvidé mi contraseña" con envío de email de recuperación
- [ ] Confirmación de email al registrarse
- [ ] Editar meta (nombre, monto objetivo, imagen)
- [ ] Eliminar miembro de una meta compartida
- [ ] Validar que el monto a agregar no supere lo que falta para la meta

### Estabilidad
- [ ] Detectar sin internet y mostrar mensaje, no congelar la app
- [ ] Redirigir al login cuando el token de sesión expira
- [ ] Traducir errores de Supabase al español (ahora muestra mensajes en inglés)

---

## 🟡 Para competir con apps reales

### Funcionalidad
- [ ] Notificaciones push cuando alguien agrega dinero a una meta compartida (Firebase FCM)
- [ ] Fecha límite en metas con countdown "X días restantes"
- [ ] Categorías de metas con íconos (✈️ Viaje, 🚨 Emergencia, 💻 Tecnología, 🏠 Hogar, etc.)
- [ ] Meta completada al 100% → animación de confetti + notificación
- [ ] Historial con filtros por fecha y por usuario
- [ ] Exportar historial como imagen para compartir por WhatsApp

### Perfil
- [ ] Foto de perfil (el Storage de Supabase ya está configurado, falta el UI)
- [ ] Cambiar nombre desde perfil
- [ ] Cambiar contraseña desde perfil
- [ ] Estadísticas: total ahorrado histórico, metas completadas, meses activo

### UX / Diseño
- [ ] Tipografía Poppins o Inter en toda la app
- [ ] Skeleton loaders en lugar de spinners (HomeScreen, HistoryScreen)
- [ ] Splash screen animado con `react-native-bootsplash`
- [ ] FAB (botón flotante) para crear meta en lugar del tab "Nueva Meta"
- [ ] Botones rápidos +50 / +100 / +200 en el modal de agregar dinero
- [ ] ProgressBar con color dinámico: rojo <30%, amarillo 30-80%, verde >80%
- [ ] Haptic feedback al confirmar acciones importantes
- [ ] Badge "👥 N miembros" en GoalCard cuando la meta es compartida
- [ ] Empty states con ilustraciones en lugar de solo emojis
- [ ] Input con borde animado al hacer focus

---

## 🟢 Requisitos formales Play Store

- [ ] Icono de app real 512x512 PNG adaptativo (ahora es el default de React Native)
- [ ] Splash screen (ahora es pantalla blanca)
- [ ] Nombre de paquete único: cambiar `com.app` → `com.haorros.app` en `android/app/build.gradle`
- [ ] APK Release firmado con keystore (ahora el workflow genera Debug)
- [ ] Privacy Policy — URL pública con política de privacidad
- [ ] Política de eliminación de cuenta (Google lo exige desde 2024)
- [ ] Screenshots para la ficha de Play Store (mínimo 2, recomendado 8)
- [ ] Descripción corta (80 chars) y larga (4000 chars) en Play Store
- [ ] Clasificación de contenido (cuestionario en Play Console)
- [ ] Probar en dispositivos con Android 8, 10, 12 y 14

---

## 📊 Resumen

| Categoría | Tareas | Estado |
|-----------|--------|--------|
| 🔴 Crítico | 11 | Pendiente |
| 🟡 Competitivo | 19 | Pendiente |
| 🟢 Play Store | 10 | Pendiente |
| **Total** | **40** | **0 / 40** |
