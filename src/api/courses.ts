import { supabase } from '../lib/supabase';

export interface Course {
  id: string;
  name: string;
  block?: string;
  grade_years?: number[];
  school_years?: string[];
}

export async function fetchCourses(schoolYear: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('id,name,block,grade_years,school_years')
    .contains('school_years', [schoolYear])
    .order('name');

  if (error) {
    throw new Error(`Failed to load courses for ${schoolYear}: ${error.message}`);
  }

  return data ?? [];
}
