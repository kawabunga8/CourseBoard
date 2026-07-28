// API helper to fetch assignments and metrics for a course from Supabase
export interface CourseAssignment {
  id: string;
  title: string;
  due_date: string;
  type: string;
  is_published: boolean;
  avg_score?: number;
}

export interface CourseMetrics {
  classAvg: number;
  submissionRate: number;
  atRiskCount: number;
  excellentCount: number;
}

export async function getCourseAssignments(courseId: string): Promise<CourseAssignment[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not configured');
    return getDevAssignments(courseId);
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rcs.assignments?course_id=eq.${encodeURIComponent(courseId)}&select=id,title,due_date,type,is_published&order=due_date.asc`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch assignments for course ${courseId}:`, response.status, response.statusText);
      return getDevAssignments(courseId);
    }

    const assignments = await response.json();
    console.log(`Fetched ${assignments.length} assignments for course ${courseId}`);

    // Transform to include simulated submission metrics
    return assignments.map((a: any) => ({
      id: a.id,
      title: a.title,
      due_date: a.due_date,
      type: a.type,
      is_published: a.is_published,
      avg_score: Math.floor(Math.random() * 30) + 70, // 70-100%
    }));
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return getDevAssignments(courseId);
  }
}

function getDevAssignments(courseId: string): CourseAssignment[] {
  if (import.meta.env.DEV) {
    console.warn(`Using dev fallback assignments for course ${courseId}`);
    return [
      {
        id: 'a1',
        title: 'Unit 1: Introduction',
        due_date: '2026-08-15',
        type: 'Assignment',
        is_published: true,
        avg_score: 87,
      },
      {
        id: 'a2',
        title: 'Unit 2: Core Concepts',
        due_date: '2026-08-29',
        type: 'Quiz',
        is_published: true,
        avg_score: 82,
      },
      {
        id: 'a3',
        title: 'Unit 3: Project',
        due_date: '2026-09-12',
        type: 'Project',
        is_published: false,
        avg_score: 85,
      },
    ];
  }
  return [];
}

export async function getCourseMetrics(courseId: string): Promise<CourseMetrics> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not configured');
    return getDevMetrics();
  }

  try {
    // Fetch enrollments to get student count and calculate metrics
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rcs.enrollments?course_id=eq.${encodeURIComponent(courseId)}&select=student_id`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch course metrics for ${courseId}:`, response.status, response.statusText);
      return getDevMetrics();
    }

    const enrollments = await response.json();
    const totalStudents = enrollments.length;

    if (totalStudents === 0) {
      return {
        classAvg: 0,
        submissionRate: 0,
        atRiskCount: 0,
        excellentCount: 0,
      };
    }

    // Simulate metrics based on student count
    const classAvg = Math.floor(Math.random() * 30) + 75; // 75-105% average
    const submissionRate = Math.floor(Math.random() * 30) + 70; // 70-100% submission
    const excellentCount = Math.max(1, Math.floor(totalStudents * 0.2)); // ~20% excellent
    const atRiskCount = Math.max(0, Math.floor(totalStudents * 0.1)); // ~10% at-risk

    return {
      classAvg,
      submissionRate,
      atRiskCount,
      excellentCount,
    };
  } catch (error) {
    console.error('Error fetching course metrics:', error);
    return getDevMetrics();
  }
}

function getDevMetrics(): CourseMetrics {
  if (import.meta.env.DEV) {
    console.warn('Using dev fallback metrics');
    return {
      classAvg: 82,
      submissionRate: 85,
      atRiskCount: 2,
      excellentCount: 5,
    };
  }
  return {
    classAvg: 0,
    submissionRate: 0,
    atRiskCount: 0,
    excellentCount: 0,
  };
}
