// API helper to fetch courses from report-card-tool Supabase
const DEV_FALLBACK_COURSES: Record<string, any[]> = {
  '2025-26': [
    { id: 'cp11-2526', name: 'CP 11', block: '1', grade_years: [11] },
    { id: 'cp12-2526', name: 'CP 12', block: '2', grade_years: [12] },
  ],
  '2026-27': [
    { id: 'cp10-2627', name: 'CP 10', block: '1', grade_years: [10] },
    { id: 'cp11-2627', name: 'CP 11', block: '2', grade_years: [11] },
    { id: 'cp12-2627', name: 'CP 12', block: '3', grade_years: [12] },
  ],
  '2027-28': [],
};

export async function fetchCourses(schoolYear: string) {
  // In development, always use fallback data
  if (import.meta.env.DEV) {
    console.log(`[DEV] Using fallback courses for ${schoolYear}`);
    return DEV_FALLBACK_COURSES[schoolYear] || [];
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not configured');
    return [];
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rcs.courses?school_years=cs.{${schoolYear}}&select=id,name,block,grade_years`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch courses for ${schoolYear}:`, response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    console.log(`Fetched ${data.length} courses for ${schoolYear}`);
    return data.length > 0 ? data : [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}
