// API helper to fetch courses from report-card-tool Supabase
export async function fetchCourses(schoolYear: string) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not configured');
    return [];
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/current_courses?p_school_year=${encodeURIComponent(schoolYear)}`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch courses:', response.statusText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}
