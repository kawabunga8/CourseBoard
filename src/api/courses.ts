import { supabase } from '../lib/supabase';

/**
 * Course data comes from Student Hub (public.courses), which is the source of
 * truth. It holds one row per course per school year, so the block, room and
 * quarters already vary by year without any side table.
 */
export interface Course {
  id: string;
  name: string;
  block: string | null;
  room: string | null;
  grade_years: number[] | null;
  school_year: string;
  sort_order: number | null;
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
    .schema('public')
    .from('courses')
    .select('id,name,block,room,grade_years,school_year,sort_order')
    .eq('school_year', schoolYear)
    .is('superseded_by', null);

  if (error) {
    throw new Error(`Failed to load courses for ${schoolYear}: ${error.message}`);
  }

  return (data ?? []).sort(
    (x, y) => compareBlocks(x.block, y.block) || x.name.localeCompare(y.name)
  );
}

/**
 * Enrollments still hang off rcs.courses, so a Student Hub course has to be
 * translated before student data can be looked up. Returns null when the
 * course has no linked rcs row — meaning no enrollment data exists for it.
 */
export async function resolveRcsCourseId(
  hubCourseId: string
): Promise<{ rcsCourseId: string; schoolYear: string } | null> {
  const { data, error } = await supabase
    .from('course_hub_links')
    .select('rcs_course_id, school_year')
    .eq('hub_course_id', hubCourseId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve course link: ${error.message}`);
  }
  if (!data) return null;

  return { rcsCourseId: data.rcs_course_id, schoolYear: data.school_year };
}
