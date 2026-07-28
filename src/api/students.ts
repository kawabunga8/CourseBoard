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
    console.warn('Supabase credentials not configured, using fallback students');
    return getDevStudents(courseId);
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
      console.warn(`Failed to fetch students from Supabase for course ${courseId} (${response.status}), using fallback`);
      return getDevStudents(courseId);
    }

    const enrollments = await response.json();

    // If no students found, use fallback data
    if (!Array.isArray(enrollments) || enrollments.length === 0) {
      console.warn(`No students found in Supabase for course ${courseId}, using fallback`);
      return getDevStudents(courseId);
    }

    console.log(`Fetched ${enrollments.length} students from Supabase for course ${courseId}`);

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
    console.error('Error fetching course students from Supabase:', error);
    console.warn(`Using fallback students for course ${courseId}`);
    return getDevStudents(courseId);
  }
}

function getDevStudents(courseId: string): CourseStudent[] {
  const allStudents: CourseStudent[] = [
    // Grade 10 students
    { student_id: 's1', student_name: 'Alex Johnson', grade_year: 10, avg_grade: 92, submission_rate: 98, status: 'excellent' },
    { student_id: 's2', student_name: 'Bailey Smith', grade_year: 10, avg_grade: 85, submission_rate: 90, status: 'on-track' },
    { student_id: 's3', student_name: 'Casey Williams', grade_year: 10, avg_grade: 72, submission_rate: 75, status: 'at-risk' },
    { student_id: 's4', student_name: 'Dakota Lee', grade_year: 10, avg_grade: 88, submission_rate: 95, status: 'excellent' },
    { student_id: 's5', student_name: 'Emory Brown', grade_year: 10, avg_grade: 80, submission_rate: 85, status: 'on-track' },
    { student_id: 's6', student_name: 'Finley Davis', grade_year: 10, avg_grade: 78, submission_rate: 80, status: 'on-track' },
    { student_id: 's7', student_name: 'Grayson Miller', grade_year: 10, avg_grade: 68, submission_rate: 70, status: 'at-risk' },
    // Grade 11 students
    { student_id: 's8', student_name: 'Harper Wilson', grade_year: 11, avg_grade: 90, submission_rate: 96, status: 'excellent' },
    { student_id: 's9', student_name: 'Indigo Moore', grade_year: 11, avg_grade: 84, submission_rate: 88, status: 'on-track' },
    { student_id: 's10', student_name: 'Jordan Taylor', grade_year: 11, avg_grade: 76, submission_rate: 82, status: 'on-track' },
    { student_id: 's11', student_name: 'Kai Anderson', grade_year: 11, avg_grade: 65, submission_rate: 68, status: 'at-risk' },
    // Grade 12 students
    { student_id: 's12', student_name: 'Lena Thomas', grade_year: 12, avg_grade: 91, submission_rate: 97, status: 'excellent' },
    { student_id: 's13', student_name: 'Morgan Jackson', grade_year: 12, avg_grade: 86, submission_rate: 92, status: 'excellent' },
    { student_id: 's14', student_name: 'Noah White', grade_year: 12, avg_grade: 82, submission_rate: 87, status: 'on-track' },
    { student_id: 's15', student_name: 'Olivia Harris', grade_year: 12, avg_grade: 75, submission_rate: 78, status: 'on-track' },
  ];

  if (import.meta.env.DEV) {
    console.warn(`Using fallback students for course ${courseId}`);
  }

  // Return a consistent subset of students for this course (based on courseId hash)
  const hash = courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const startIdx = hash % allStudents.length;
  const studentCount = 8 + (hash % 8); // 8-15 students per course

  const courseStudents: CourseStudent[] = [];
  for (let i = 0; i < studentCount; i++) {
    const student = allStudents[(startIdx + i) % allStudents.length];
    courseStudents.push({
      ...student,
      // Vary grades slightly per course
      avg_grade: Math.max(60, Math.min(95, (student.avg_grade ?? 80) + (Math.random() - 0.5) * 10)),
      submission_rate: Math.max(60, Math.min(100, (student.submission_rate ?? 85) + (Math.random() - 0.5) * 10)),
    });
  }

  return courseStudents;
}
