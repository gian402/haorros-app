-- ============================================================
-- HAORROS — Políticas RLS completas
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- ── TABLA: goals ────────────────────────────────────────────
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Solo el dueño puede ver sus metas (+ miembros via goal_members)
DROP POLICY IF EXISTS "Ver metas propias o compartidas" ON goals;
CREATE POLICY "Ver metas propias o compartidas" ON goals
  FOR SELECT USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM goal_members
      WHERE goal_members.goal_id = goals.id
        AND goal_members.user_id = auth.uid()
    )
  );

-- Solo usuarios autenticados pueden crear metas
DROP POLICY IF EXISTS "Crear meta autenticado" ON goals;
CREATE POLICY "Crear meta autenticado" ON goals
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Solo el dueño puede editar su meta
DROP POLICY IF EXISTS "Editar solo owner" ON goals;
CREATE POLICY "Editar solo owner" ON goals
  FOR UPDATE USING (auth.uid() = owner_id);

-- ✅ FIX CRÍTICO: Solo el dueño puede ELIMINAR su meta
DROP POLICY IF EXISTS "Eliminar solo owner" ON goals;
CREATE POLICY "Eliminar solo owner" ON goals
  FOR DELETE USING (auth.uid() = owner_id);


-- ── TABLA: goal_members ──────────────────────────────────────
ALTER TABLE goal_members ENABLE ROW LEVEL SECURITY;

-- Ver miembros si eres dueño o miembro de esa meta
DROP POLICY IF EXISTS "Ver miembros de meta propia" ON goal_members;
CREATE POLICY "Ver miembros de meta propia" ON goal_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = goal_members.goal_id
        AND (goals.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM goal_members gm2
            WHERE gm2.goal_id = goals.id AND gm2.user_id = auth.uid()
          ))
    )
  );

-- Solo el dueño de la meta puede agregar miembros
DROP POLICY IF EXISTS "Agregar miembro solo owner" ON goal_members;
CREATE POLICY "Agregar miembro solo owner" ON goal_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = goal_members.goal_id
        AND goals.owner_id = auth.uid()
    )
  );

-- ✅ FIX CRÍTICO: Solo el dueño puede ELIMINAR miembros
DROP POLICY IF EXISTS "Eliminar miembro solo owner" ON goal_members;
CREATE POLICY "Eliminar miembro solo owner" ON goal_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = goal_members.goal_id
        AND goals.owner_id = auth.uid()
    )
  );


-- ── TABLA: transactions ──────────────────────────────────────
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ver transacciones de meta propia" ON transactions;
CREATE POLICY "Ver transacciones de meta propia" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = transactions.goal_id
        AND (goals.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM goal_members
            WHERE goal_members.goal_id = goals.id
              AND goal_members.user_id = auth.uid()
          ))
    )
  );

DROP POLICY IF EXISTS "Insertar transaccion autenticado" ON transactions;
CREATE POLICY "Insertar transaccion autenticado" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ── TABLA: users ─────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ver todos los usuarios" ON users;
CREATE POLICY "Ver todos los usuarios" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Editar propio perfil" ON users;
CREATE POLICY "Editar propio perfil" ON users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Insertar propio perfil" ON users;
CREATE POLICY "Insertar propio perfil" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);


-- ── STORAGE: bucket avatars ──────────────────────────────────
-- Crear bucket si no existe (también puedes hacerlo desde el dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatar público lectura" ON storage.objects;
CREATE POLICY "Avatar público lectura" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Subir propio avatar" ON storage.objects;
CREATE POLICY "Subir propio avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Actualizar propio avatar" ON storage.objects;
CREATE POLICY "Actualizar propio avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


-- ── COLUMNAS NUEVAS (si no existen) ─────────────────────────
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS deadline DATE;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;
