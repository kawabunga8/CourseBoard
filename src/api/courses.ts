// API helper to fetch courses from report-card-tool Supabase
const FALLBACK_COURSES: Record<string, any[]> = {
  '2025-26': [
    { id: 'cp11-2526', name: 'CP 11', block: '1', grade_years: [11] },
    { id: 'cp12-2526', name: 'CP 12', block: '2', grade_years: [12] },
    { id: 'bp10-2526', name: 'Biblical Perspectives 10', block: '3', grade_years: [10] },
    { id: 'cle10-2526', name: 'Career Life Education 10', block: '4', grade_years: [10] },
    { id: 'band12-2526', name: 'Band 12', block: '5', grade_years: [12] },
    { id: 'band11-2526', name: 'Band 11', block: '6', grade_years: [11] },
    { id: 'band10-2526', name: 'Band 10', block: '7', grade_years: [10] },
  ],
  '2026-27': [
    { id: 'cp10-2627', name: 'CP 10', block: '1', grade_years: [10] },
    { id: 'cp11-2627', name: 'CP 11', block: '2', grade_years: [11] },
    { id: 'cp12-2627', name: 'CP 12', block: '3', grade_years: [12] },
    { id: 'bp10-2627', name: 'Biblical Perspectives 10', block: '1', grade_years: [10] },
    { id: 'cle10-2627', name: 'Career Life Education 10', block: '2', grade_years: [10] },
    { id: 'eng10-2627', name: 'English 10', block: '3', grade_years: [10] },
    { id: 'math10-2627', name: 'Mathematics 10', block: '4', grade_years: [10] },
    { id: 'sci10-2627', name: 'Science 10', block: '5', grade_years: [10] },
    { id: 'soc10-2627', name: 'Social Studies 10', block: '6', grade_years: [10] },
    { id: 'eng11-2627', name: 'English 11', block: '1', grade_years: [11] },
    { id: 'math11-2627', name: 'Mathematics 11', block: '2', grade_years: [11] },
    { id: 'sci11-2627', name: 'Science 11', block: '3', grade_years: [11] },
    { id: 'soc11-2627', name: 'Social Studies 11', block: '4', grade_years: [11] },
    { id: 'eng12-2627', name: 'English 12', block: '5', grade_years: [12] },
    { id: 'math12-2627', name: 'Mathematics 12', block: '6', grade_years: [12] },
    { id: 'sci12-2627', name: 'Science 12', block: '7', grade_years: [12] },
  ],
  '2027-28': [],
};

export async function fetchCourses(schoolYear: string) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // In development, always use fallback data
  if (import.meta.env.DEV) {
    console.log(`[DEV] Using fallback courses for ${schoolYear}`);
    return FALLBACK_COURSES[schoolYear] || [];
  }

  // In production, try Supabase first, fall back to hardcoded data if it fails
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not configured, using fallback courses');
    return FALLBACK_COURSES[schoolYear] || [];
  }

  try {
    // Try fetching with array contains operator
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rcs.courses?select=id,name,block,grade_years&order=id`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      console.warn(`Supabase returned ${response.status}, using fallback courses for ${schoolYear}`);
      return FALLBACK_COURSES[schoolYear] || [];
    }

    const allCourses = await response.json();

    if (!Array.isArray(allCourses) || allCourses.length === 0) {
      console.warn('No courses found in Supabase, using fallback courses');
      return FALLBACK_COURSES[schoolYear] || [];
    }

    // Filter by school_years array containing the selected year
    const filteredCourses = allCourses.filter((course: any) => {
      return course.school_years &&
             Array.isArray(course.school_years) &&
             course.school_years.includes(schoolYear);
    });

    if (filteredCourses.length > 0) {
      console.log(`Fetched ${filteredCourses.length} courses from Supabase for ${schoolYear}`);
      return filteredCourses;
    } else {
      console.warn(`No courses found for ${schoolYear} in Supabase, using fallback`);
      return FALLBACK_COURSES[schoolYear] || [];
    }
  } catch (error) {
    console.error('Error fetching courses from Supabase:', error);
    console.warn(`Using fallback courses for ${schoolYear}`);
    return FALLBACK_COURSES[schoolYear] || [];
  }
}
