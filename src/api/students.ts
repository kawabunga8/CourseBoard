import { supabase } from '../lib/supabase';
import { resolveRcsCourseId } from './courses';

export interface CourseStudent {
  student_id: string;
  student_name: string;
  grade_year: number | null;
}

/**
 * Takes a Student Hub course id. Student rows live in public.students, and
 * rcs.enrollments has no foreign key on student_id, so the lookup runs as
 * separate queries rather than a PostgREST embed.
 */
export async function getCourseStudents(hubCourseId: string): Promise<CourseStudent[]> {
  const link = await resolveRcsCourseId(hubCourseId);
  if (!link) return [];

  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select('student_id')
    .eq('course_id', link.rcsCourseId)
    .eq('school_year', link.schoolYear);

  if (enrollError) {
    throw new Error(`Failed to load enrollments for this course: ${enrollError.message}`);
  }

  const studentIds = (enrollments ?? []).map(e => e.student_id).filter(Boolean);
  if (studentIds.length === 0) return [];

  const { data: students, error: studentError } = await supabase
    .schema('public')
    .from('students')
    .select('id, first_name, last_name, grade_year')
    .in('id', studentIds);

  if (studentError) {
    throw new Error(`Failed to load student details: ${studentError.message}`);
  }

  return (students ?? [])
    .map(s => ({
      student_id: s.id,
      student_name: [s.first_name, s.last_name].filter(Boolean).join(' '),
      grade_year: s.grade_year ?? null,
    }))
    .sort((a, b) => a.student_name.localeCompare(b.student_name));
}
