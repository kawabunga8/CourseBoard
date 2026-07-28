import { supabase } from '../lib/supabase';

export interface CourseStudent {
  student_id: string;
  student_name: string;
  grade_year: number | null;
}

/**
 * Two queries rather than a PostgREST embed: rcs.enrollments has a foreign key
 * on course_id but none on student_id, so the relationship cannot be resolved
 * from the schema cache. The student rows also live in public.students, not
 * rcs.students, which is why the client schema is overridden below.
 */
export async function getCourseStudents(
  courseId: string,
  schoolYear: string
): Promise<CourseStudent[]> {
  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select('student_id')
    .eq('course_id', courseId)
    .eq('school_year', schoolYear);

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
