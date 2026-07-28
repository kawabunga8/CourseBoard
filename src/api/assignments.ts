import { supabase } from '../lib/supabase';

export interface CourseAssignment {
  id: string;
  title: string;
  due_date: string | null;
  type: string | null;
  is_published: boolean;
}

export async function getCourseAssignments(courseId: string): Promise<CourseAssignment[]> {
  const { data, error } = await supabase
    .from('assignments')
    .select('id,title,due_date,type,is_published')
    .eq('course_id', courseId)
    .order('due_date', { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(`Failed to load assignments for this course: ${error.message}`);
  }

  return data ?? [];
}
