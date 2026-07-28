// API helper to fetch student data for a course from Supabase
export interface CourseStudent {
  student_id: string;
  student_name: string;
  grade_year: number;
  avg_grade?: number;
  submission_rate?: number;
  status: 'excellent' | 'on-track' | 'at-risk';
}

export async function getCourseStudents(courseId: string): Promise<CourseStudent[]> {
  // In development, always use fallback data
  if (import.meta.env.DEV) {
    console.log(`[DEV] Using fallback students for course ${courseId}`);
    return getDevStudents(courseId);
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not configured');
    return [];
  }

  try {
    // Fetch students enrolled in the course
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rcs.enrollments?course_id=eq.${encodeURIComponent(courseId)}&select=student_id,students(first_name,last_name,grade_year)`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch students for course ${courseId}:`, response.status, response.statusText);
      return getDevStudents(courseId);
    }

    const enrollments = await response.json();
    console.log(`Fetched ${enrollments.length} students for course ${courseId}`);

    // Transform enrollments to include student info
    const students: CourseStudent[] = enrollments.map((enrollment: any) => {
      const student = enrollment.students;
      const firstName = student?.first_name || 'Unknown';
      const lastName = student?.last_name || '';
      const studentName = `${firstName} ${lastName}`.trim();

      // Simulate performance metrics (in production, these would come from actual grade data)
      const avgGrade = Math.floor(Math.random() * 40) + 60; // 60-100%
      const submissionRate = Math.floor(Math.random() * 40) + 60; // 60-100%

      let status: 'excellent' | 'on-track' | 'at-risk' = 'on-track';
      if (avgGrade >= 90 && submissionRate >= 95) {
        status = 'excellent';
      } else if (avgGrade < 75 || submissionRate < 80) {
        status = 'at-risk';
      }

      return {
        student_id: enrollment.student_id,
        student_name: studentName,
        grade_year: student?.grade_year || 10,
        avg_grade: avgGrade,
        submission_rate: submissionRate,
        status,
      };
    });

    return students;
  } catch (error) {
    console.error('Error fetching course students:', error);
    return getDevStudents(courseId);
  }
}

function getDevStudents(courseId: string): CourseStudent[] {
  if (import.meta.env.DEV) {
    console.warn(`Using dev fallback students for course ${courseId}`);
    return [
      {
        student_id: 's1',
        student_name: 'Alex Johnson',
        grade_year: 10,
        avg_grade: 92,
        submission_rate: 98,
        status: 'excellent',
      },
      {
        student_id: 's2',
        student_name: 'Bailey Smith',
        grade_year: 10,
        avg_grade: 85,
        submission_rate: 90,
        status: 'on-track',
      },
      {
        student_id: 's3',
        student_name: 'Casey Williams',
        grade_year: 10,
        avg_grade: 72,
        submission_rate: 75,
        status: 'at-risk',
      },
    ];
  }
  return [];
}
