export interface Course {
  id: string;
  name: string;
  block?: string;
  grade_years?: number[];
  school_years?: string[];
}

function supabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase credentials are not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
  }
  return { url, key };
}

export function rcsHeaders(key: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Accept-Profile': 'rcs',
  };
}

export async function fetchCourses(schoolYear: string): Promise<Course[]> {
  const { url, key } = supabaseConfig();

  const response = await fetch(
    `${url}/rest/v1/courses?select=id,name,block,grade_years,school_years&school_years=cs.{"${schoolYear}"}&order=name`,
    { headers: rcsHeaders(key) }
  );

  if (!response.ok) {
    throw new Error(`Failed to load courses for ${schoolYear}: ${response.status} ${await response.text()}`);
  }

  return response.json();
}
