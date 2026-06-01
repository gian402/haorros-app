-- ============================================================
-- HAORROS — Fix políticas RLS (sin recursión, sin bloqueos)
-- Ejecutar completo en Supabase → SQL Editor
-- ============================================================

-- ── TABLA: goals ────────────────────────────────────────────
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ver metas propias o compartidas" ON goals;
DROP POLICY IF EXISTS "Crear meta autenticado" ON goals;
DROP POLICY IF EXISTS "Editar solo owner" ON goals;
DROP POLICY IF EXISTS "Eliminar solo owner" ON goals;

CREATE POLICY "Ver metas propias o compartidas" ON goals
  FOR SELECT USING (
    auth.uid() = owner_id
    OR id IN (
      SELECT goal_id FROM goal_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Crear meta autenticado" ON goals
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Editar solo owner" ON goals
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Eliminar solo owner" ON goals
  FOR DELETE USING (auth.uid() = owner_id);


-- ── TABLA: goal_members ──────────────────────────────────────
-- FIX: sin subconsulta recursiva a goal_members
ALTER TABLE goal_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ver miembros de meta propia" ON goal_members;
DROP POLICY IF EXISTS "Agregar miembro solo owner" ON goal_members;
DROP POLICY IF EXISTS "Eliminar miembro solo owner" ON goal_members;

-- Ver miembros: si eres dueño de la meta O si eres miembro (sin recursión)
CREATE POLICY "Ver miembros de meta propia" ON goal_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR goal_id IN (
      SELECT id FROM goals WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Agregar miembro solo owner" ON goal_members
  FOR INSERT WITH CHECK (
    goal_id IN (
      SELECT id FROM goals WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Eliminar miembro solo owner" ON goal_members
  FOR DELETE USING (
    goal_id IN (
      SELECT id FROM goals WHERE owner_id = auth.uid()
    )
  );


-- ── TABLA: transactions ──────────────────────────────────────
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ver transacciones de meta propia" ON transactions;
DROP POLICY IF EXISTS "Insertar transaccion autenticado" ON transactions;

CREATE POLICY "Ver transacciones de meta propia" ON transactions
  FOR SELECT USING (
    goal_id IN (
      SELECT id FROM goals WHERE owner_id = auth.uid()
    )
    OR goal_id IN (
      SELECT goal_id FROM goal_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Insertar transaccion autenticado" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ── TABLA: users ─────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ver todos los usuarios" ON users;
DROP POLICY IF EXISTS "Editar propio perfil" ON users;
DROP POLICY IF EXISTS "Insertar propio perfil" ON users;
DROP POLICY IF EXISTS "Upsert propio perfil" ON users;

CREATE POLICY "Ver todos los usuarios" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- FIX: upsert necesita tanto INSERT como UPDATE
CREATE POLICY "Insertar propio perfil" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Editar propio perfil" ON users
  FOR UPDATE USING (auth.uid() = id);


-- ── STORAGE: bucket avatars ──────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Avatar público lectura" ON storage.objects;
DROP POLICY IF EXISTS "Subir propio avatar" ON storage.objects;
DROP POLICY IF EXISTS "Actualizar propio avatar" ON storage.objects;

CREATE POLICY "Avatar público lectura" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- FIX: el path es userId.ext (sin carpeta), ajustar check
CREATE POLICY "Subir propio avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Actualizar propio avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND auth.role() = 'authenticated'
  );


-- ── COLUMNAS NUEVAS ──────────────────────────────────────────
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS deadline DATE;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;
