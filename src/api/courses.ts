// API helper to fetch courses from report-card-tool Supabase
export async function fetchCourses(schoolYear: string) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not configured');
    return getDevFallback(schoolYear);
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
      return getDevFallback(schoolYear);
    }

    const data = await response.json();
    console.log(`Fetched ${data.length} courses for ${schoolYear}`);
    return data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return getDevFallback(schoolYear);
  }
}

function getDevFallback(schoolYear: string) {
  if (import.meta.env.DEV) {
    console.warn(`Using dev fallback courses for ${schoolYear}`);
    const fallbackCourses: Record<string, any[]> = {
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
    return fallbackCourses[schoolYear] || [];
  }
  return [];
}
