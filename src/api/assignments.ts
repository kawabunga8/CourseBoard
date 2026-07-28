import { rcsHeaders } from './courses';

export interface CourseAssignment {
  id: string;
  title: string;
  due_date: string;
  type: string;
  is_published: boolean;
}

export async function getCourseAssignments(courseId: string): Promise<CourseAssignment[]> {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase credentials are not configured');
  }

  const response = await fetch(
    `${url}/rest/v1/assignments?course_id=eq.${encodeURIComponent(courseId)}&select=id,title,due_date,type,is_published&order=due_date.asc`,
    { headers: rcsHeaders(key) }
  );

  if (!response.ok) {
    throw new Error(`Failed to load assignments for course ${courseId}: ${response.status} ${await response.text()}`);
  }

  return response.json();
}
