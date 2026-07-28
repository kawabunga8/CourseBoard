import { supabase } from '../lib/supabase';

export interface CourseStudent {
  student_id: string;
  student_name: string;
  grade_year: number | null;
}

export async function getCourseStudents(
  courseId: string,
  schoolYear: string
): Promise<CourseStudent[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('student_id, students(first_name, last_name, grade_year)')
    .eq('course_id', courseId)
    .eq('school_year', schoolYear);

  if (error) {
    throw new Error(`Failed to load students for this course: ${error.message}`);
  }

  return (data ?? [])
    .map(row => {
      const student = row.students as unknown as {
        first_name: string | null;
        last_name: string | null;
        grade_year: number | null;
      } | null;
      return {
        student_id: row.student_id,
        student_name: [student?.first_name, student?.last_name].filter(Boolean).join(' '),
        grade_year: student?.grade_year ?? null,
      };
    })
    .sort((a, b) => a.student_name.localeCompare(b.student_name));
}
