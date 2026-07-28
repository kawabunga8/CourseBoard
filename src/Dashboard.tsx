import { useState, useEffect } from 'react';
import './Dashboard.css';
import { fetchCourses } from './api/courses';
import { getCourseStudents } from './api/students';
import { getCourseAssignments, getCourseMetrics, type CourseAssignment } from './api/assignments';

interface Course {
  id: string;
  name: string;
  block?: string;
  grade_years?: number[];
}


interface StudentProgress {
  name: string;
  email: string;
  avgGrade: number;
  submissionRate: number;
  status: 'on-track' | 'at-risk' | 'excellent';
}

interface CourseMetrics {
  classAvg: number;
  submissionRate: number;
  atRiskCount: number;
  excellentCount: number;
}

const SCHOOL_YEARS = ['2025-26', '2026-27', '2027-28'];

export default function Dashboard() {
  const [schoolYear, setSchoolYear] = useState<string>('2026-27');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [courseMetrics, setCourseMetrics] = useState<CourseMetrics>({
    classAvg: 0,
    submissionRate: 0,
    atRiskCount: 0,
    excellentCount: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Load courses from Supabase when school year changes
  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);
      setSelectedCourse('');
      setStudents([]);
      const fetchedCourses = await fetchCourses(schoolYear);

      if (Array.isArray(fetchedCourses) && fetchedCourses.length > 0) {
        setCourses(fetchedCourses);
        setSelectedCourse(fetchedCourses[0].id);
      } else {
        // No courses found in database for this school year
        setCourses([]);
        setSelectedCourse('');
      }
      setLoadingCourses(false);
    };

    loadCourses();
  }, [schoolYear]);

  // Load course data (students, assignments, metrics) for selected course
  useEffect(() => {
    if (!selectedCourse) {
      setStudents([]);
      setAssignments([]);
      setCourseMetrics({ classAvg: 0, submissionRate: 0, atRiskCount: 0, excellentCount: 0 });
      return;
    }

    const loadCourseData = async () => {
      // Load students
      setLoadingStudents(true);
      const courseStudents = await getCourseStudents(selectedCourse);
      const studentProgress: StudentProgress[] = courseStudents.map(cs => ({
        name: cs.student_name,
        email: `${cs.student_name.toLowerCase().replace(' ', '.')}@school`,
        avgGrade: cs.avg_grade || 0,
        submissionRate: cs.submission_rate || 0,
        status: cs.status,
      }));
      setStudents(studentProgress);
      setLoadingStudents(false);

      // Load assignments
      setLoadingAssignments(true);
      const courseAssignments = await getCourseAssignments(selectedCourse);
      setAssignments(courseAssignments);
      setLoadingAssignments(false);

      // Load metrics
      setLoadingMetrics(true);
      const metrics = await getCourseMetrics(selectedCourse);
      setCourseMetrics(metrics);
      setLoadingMetrics(false);
    };

    loadCourseData();
  }, [selectedCourse]);

  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'students'>('overview');

  const statusDot = (status: string) => {
    const colors: Record<string, string> = {
      'on-track': '#10b981',
      'excellent': '#06b6d4',
      'at-risk': '#ef4444',
    };
    return (
      <span
        style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: colors[status] || '#94a3b8',
          marginRight: 8,
        }}
      />
    );
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📚 Course Dashboard</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={schoolYear}
            onChange={e => setSchoolYear(e.target.value)}
            style={{
              padding: '8px 12px',
              backgroundColor: '#fbbf24',
              color: '#1a1a1a',
              border: '1px solid #f59e0b',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {SCHOOL_YEARS.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {loadingCourses ? (
            <p className="status-info">Loading courses...</p>
          ) : (
            <>
              <select
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                disabled={courses.length === 0}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  fontSize: 14,
                  cursor: courses.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: courses.length === 0 ? 0.5 : 1,
                }}
              >
                <option value="">Select a course...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.block ? `(Block ${c.block})` : ''}
                  </option>
                ))}
              </select>
              <p className="status-info">
                {courses.length > 0 ? `${courses.length} courses · ` : ''}
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </>
          )}
        </div>
      </header>

      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>Assignments</button>
        <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>Students</button>
      </div>

      {activeTab === 'overview' && (
        <div className="overview-panel">
          {selectedCourse && !loadingMetrics ? (
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Class Average</h3>
                <p className="metric-value">{courseMetrics.classAvg.toFixed(1)}%</p>
                <span className="metric-badge" style={{ backgroundColor: courseMetrics.classAvg >= 85 ? '#10b98166' : '#f59e0b66' }}>
                  {courseMetrics.classAvg >= 85 ? 'Healthy' : 'Monitor'}
                </span>
              </div>
              <div className="metric-card">
                <h3>Submission Rate</h3>
                <p className="metric-value">{courseMetrics.submissionRate}%</p>
                <span className="metric-badge" style={{ backgroundColor: courseMetrics.submissionRate >= 85 ? '#10b98166' : '#f59e0b66' }}>
                  {courseMetrics.submissionRate >= 85 ? 'Good' : 'Low'}
                </span>
              </div>
              <div className="metric-card">
                <h3>At-Risk Students</h3>
                <p className="metric-value">{courseMetrics.atRiskCount}</p>
                <span className="metric-badge" style={{ backgroundColor: courseMetrics.atRiskCount > 0 ? '#f59e0b66' : '#10b98166' }}>
                  {courseMetrics.atRiskCount > 0 ? 'Monitor' : 'Good'}
                </span>
              </div>
              <div className="metric-card">
                <h3>Excellent (90%+)</h3>
                <p className="metric-value">{courseMetrics.excellentCount}</p>
                <span className="metric-badge" style={{ backgroundColor: '#06b6d466' }}>Excellent</span>
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>
              {selectedCourse ? 'Loading metrics...' : 'Select a course to view metrics'}
            </div>
          )}

          <div className="alerts-section">
            <h2>Alerts & Notices</h2>
            {selectedCourse ? (
              loadingStudents ? (
                <p style={{ color: '#94a3b8', fontSize: 12 }}>Loading student data...</p>
              ) : students.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 12 }}>No students enrolled in this course</p>
              ) : (
                <>
                  {/* At-risk students */}
                  {students
                    .filter(s => s.status === 'at-risk')
                    .map((student, idx) => (
                      <div key={idx} className="alert">
                        <span>⚠️</span>
                        <div>
                          <strong>{student.name}</strong> - At risk ({student.avgGrade}% avg, {student.submissionRate}% submissions)
                        </div>
                        <button className="alert-action">Contact</button>
                      </div>
                    ))}

                  {/* Excellent performers */}
                  {students
                    .filter(s => s.status === 'excellent')
                    .slice(0, 2)
                    .map((student, idx) => (
                      <div key={idx} className="alert">
                        <span>⭐</span>
                        <div>
                          <strong>{student.name}</strong> - Excellent performance ({student.avgGrade}% avg)
                        </div>
                      </div>
                    ))}

                  {students.length === 0 && (
                    <p style={{ color: '#94a3b8', fontSize: 12 }}>No alerts for this course</p>
                  )}
                </>
              )
            ) : (
              <p style={{ color: '#94a3b8', fontSize: 12 }}>Select a course to view student alerts</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="assignments-panel">
          {selectedCourse && !loadingAssignments ? (
            assignments.length > 0 ? (
              <table className="assignments-table">
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Due Date</th>
                    <th>Type</th>
                    <th>Avg Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(a => {
                    const dueDate = new Date(a.due_date);
                    const isOverdueAssignment = dueDate < new Date();
                    return (
                      <tr key={a.id} className={isOverdueAssignment ? 'overdue' : ''}>
                        <td>{a.title}</td>
                        <td style={{ color: isOverdueAssignment ? '#ef4444' : '#e2e8f0' }}>
                          {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td style={{ fontSize: 12, color: '#94a3b8' }}>{a.type}</td>
                        <td>{a.avg_score ? `${a.avg_score}%` : 'N/A'}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: a.is_published ? '#10b98166' : '#64748b66',
                            }}
                          >
                            {a.is_published ? '✓ Published' : 'Draft'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>
                No assignments for this course
              </div>
            )
          ) : (
            <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>
              {selectedCourse ? 'Loading assignments...' : 'Select a course to view assignments'}
            </div>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="students-panel">
          <table className="students-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Avg Grade</th>
                <th>Submission Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={i}>
                  <td>{s.name}</td>
                  <td style={{ fontSize: 12, color: '#94a3b8' }}>{s.email}</td>
                  <td style={{ fontWeight: 600 }}>{s.avgGrade}%</td>
                  <td>{s.submissionRate}%</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {statusDot(s.status)}
                      <span
                        style={{
                          fontSize: 12,
                          textTransform: 'capitalize',
                          color:
                            s.status === 'excellent'
                              ? '#06b6d4'
                              : s.status === 'at-risk'
                                ? '#ef4444'
                                : '#10b981',
                        }}
                      >
                        {s.status.replace('-', ' ')}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
