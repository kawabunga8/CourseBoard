import { supabase } from '../lib/supabase';

export interface CourseStudent {
  student_id: string;
  student_name: string;
  grade_year: number | null;
}

/**
 * Rosters come from Student Hub: public.enrollments keyed directly by the
 * Student Hub course id, with student rows in public.students.
 *
 * This deliberately does not go through rcs.enrollments. That table is the
 * report card tool's own copy and is missing courses entirely — ICT 9 Q1 and
 * Q2 have 36 students each here and no rcs rows at all.
 *
 * Two queries rather than a PostgREST embed because enrollments has no foreign
 * key on student_id.
 */
export async function getCourseStudents(hubCourseId: string): Promise<CourseStudent[]> {
  const { data: enrollments, error: enrollError } = await supabase
    .schema('public')
    .from('enrollments')
    .select('student_id')
    .eq('course_id', hubCourseId);

  if (enrollError) {
    throw new Error(`Failed to load enrollments for this course: ${enrollError.message}`);
  }

  const studentIds = [...new Set((enrollments ?? []).map(e => e.student_id).filter(Boolean))];
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
