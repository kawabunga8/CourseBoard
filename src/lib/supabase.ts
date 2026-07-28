import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    'Supabase credentials are not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)'
  );
}

// All CourseBoard data lives in the `rcs` schema, which is RLS-protected to the
// `authenticated` role — every query below requires a signed-in session.
export const supabase = createClient(url, key, {
  db: { schema: 'rcs' },
});
