import {createClient} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ RLS FIX PENDIENTE — ejecutar en Supabase SQL Editor:
// CREATE POLICY "Solo owner puede eliminar" ON goals FOR DELETE USING (auth.uid() = owner_id);
// (sin esta política cualquier usuario autenticado puede borrar metas ajenas)

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
