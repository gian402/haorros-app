# Haorros 💰

App de ahorro compartido en tiempo real. React Native CLI + TypeScript + Supabase.

## Stack

- React Native CLI + TypeScript
- NativeWind (Tailwind CSS)
- React Navigation (Stack + Bottom Tabs)
- Zustand (estado global)
- Supabase (Auth, PostgreSQL, Realtime, Storage)

## Estructura

```
src/
├── components/     # Button, Input, ProgressBar, GoalCard
├── navigation/     # RootNavigator, AuthNavigator, MainNavigator
├── screens/
│   ├── auth/       # LoginScreen, RegisterScreen
│   └── main/       # HomeScreen, GoalDetailScreen, CreateGoalScreen, HistoryScreen, ProfileScreen
├── services/       # authService, goalsService, transactionsService
├── store/          # authStore, goalsStore
└── supabase/       # client.ts, types.ts
```

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ejecuta `supabase/schema.sql` en el SQL Editor
3. Copia tu `Project URL` y `anon key`

### 3. Variables de entorno

Edita `src/supabase/client.ts` con tus credenciales, o crea `.env`:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

### 4. Correr en Android

```bash
npx react-native run-android
```

## GitHub Actions (APK automático)

Agrega estos secrets en tu repo → Settings → Secrets:

| Secret | Descripción |
|--------|-------------|
| `SUPABASE_URL` | URL de tu proyecto Supabase |
| `SUPABASE_ANON_KEY` | Anon key de Supabase |
| `KEYSTORE_PASSWORD` | Password del keystore Android |
| `KEY_ALIAS` | Alias de la clave |
| `KEY_PASSWORD` | Password de la clave |

El APK se genera automáticamente en cada push a `main` y queda disponible en los artifacts del workflow.

## Base de datos

Ver `supabase/schema.sql` — incluye tablas, RLS, función atómica `increment_goal_amount`, Realtime y Storage.
