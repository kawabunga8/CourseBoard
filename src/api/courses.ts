import { supabase } from '../lib/supabase';

export interface Course {
  id: string;
  name: string;
  block?: string;
  grade_years?: number[];
  school_years?: string[];
}

/**
 * Timetable blocks are single letters (A–H). Anything else — "CLE" and other
 * named slots — sorts after the lettered blocks rather than alphabetically
 * among them, so "CLE" does not land between B and D.
 */
export function compareBlocks(a?: string | null, b?: string | null): number {
  const norm = (v?: string | null) => (v ?? '').trim().toUpperCase();
  const av = norm(a);
  const bv = norm(b);

  if (av === bv) return 0;
  if (av === '') return 1;
  if (bv === '') return -1;

  const aLettered = /^[A-Z]$/.test(av);
  const bLettered = /^[A-Z]$/.test(bv);
  if (aLettered !== bLettered) return aLettered ? -1 : 1;

  return av.localeCompare(bv);
}

export async function fetchCourses(schoolYear: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('id,name,block,grade_years,school_years')
    .contains('school_years', [schoolYear]);

  if (error) {
    throw new Error(`Failed to load courses for ${schoolYear}: ${error.message}`);
  }

  return (data ?? []).sort(
    (x, y) => compareBlocks(x.block, y.block) || x.name.localeCompare(y.name)
  );
}
