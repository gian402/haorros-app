import {createClient} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ RLS FIX PENDIENTE — ejecutar en Supabase SQL Editor:
// CREATE POLICY "Solo owner puede eliminar" ON goals FOR DELETE USING (auth.uid() = owner_id);
// (sin esta política cualquier usuario autenticado puede borrar metas ajenas)

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://fddzefategdyfciornqr.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkZHplZmF0ZWdkeWZjaW9ybnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMTkwODIsImV4cCI6MjA5NTU5NTA4Mn0.9sVIVqD9yU5wu-FNhA-WEPhSJly1NjCW2iDG1clua6M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
