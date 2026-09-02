import { supabase } from '../lib/supabase';
import { resolveRcsCourseId } from './courses';

export interface CourseAssignment {
  id: string;
  title: string;
  due_date: string | null;
  type: string | null;
  is_published: boolean;
}

/** Takes a Course Hub course id; assignments still live against rcs.courses. */
export async function getCourseAssignments(hubCourseId: string): Promise<CourseAssignment[]> {
  const link = await resolveRcsCourseId(hubCourseId);
  if (!link) return [];

  const { data, error } = await supabase
    .from('assignments')
    .select('id,title,due_date,type,is_published')
    .eq('course_id', link.rcsCourseId)
    .order('due_date', { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(`Failed to load assignments for this course: ${error.message}`);
  }

  return data ?? [];
}
