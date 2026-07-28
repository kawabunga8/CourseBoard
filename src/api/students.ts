import { rcsHeaders } from './courses';

export interface CourseStudent {
  student_id: string;
  student_name: string;
  grade_year: number;
}

export async function getCourseStudents(courseId: string): Promise<CourseStudent[]> {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase credentials are not configured');
  }

  const response = await fetch(
    `${url}/rest/v1/enrollments?course_id=eq.${encodeURIComponent(courseId)}&select=student_id,students(first_name,last_name,grade_year)`,
    { headers: rcsHeaders(key) }
  );

  if (!response.ok) {
    throw new Error(`Failed to load students for course ${courseId}: ${response.status} ${await response.text()}`);
  }

  const enrollments = await response.json();

  return enrollments.map((e: any) => ({
    student_id: e.student_id,
    student_name: [e.students?.first_name, e.students?.last_name].filter(Boolean).join(' '),
    grade_year: e.students?.grade_year,
  }));
}
