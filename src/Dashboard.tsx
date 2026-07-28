import { useState, useEffect, useMemo } from 'react';
import './Dashboard.css';
import { supabase } from './lib/supabase';
import { fetchCourses, compareBlocks, type Course } from './api/courses';
import { getCourseStudents, type CourseStudent } from './api/students';
import { getCourseAssignments, type CourseAssignment } from './api/assignments';

const SCHOOL_YEARS = ['2025-26', '2026-27', '2027-28'];

export default function Dashboard() {
  const [schoolYear, setSchoolYear] = useState<string>('2026-27');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [students, setStudents] = useState<CourseStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);
      setError('');
      setSelectedCourse('');
      setStudents([]);
      setAssignments([]);
      try {
        const fetched = await fetchCourses(schoolYear);
        setCourses(fetched);
        setSelectedCourse(fetched[0]?.id ?? '');
      } catch (e) {
        setCourses([]);
        setError(e instanceof Error ? e.message : String(e));
      }
      setLoadingCourses(false);
    };

    loadCourses();
  }, [schoolYear]);

  useEffect(() => {
    if (!selectedCourse) {
      setStudents([]);
      setAssignments([]);
      return;
    }

    const loadCourseData = async () => {
      setLoadingStudents(true);
      setLoadingAssignments(true);
      setError('');
      try {
        const [courseStudents, courseAssignments] = await Promise.all([
          getCourseStudents(selectedCourse, schoolYear),
          getCourseAssignments(selectedCourse),
        ]);
        setStudents(courseStudents);
        setAssignments(courseAssignments);
      } catch (e) {
        setStudents([]);
        setAssignments([]);
        setError(e instanceof Error ? e.message : String(e));
      }
      setLoadingStudents(false);
      setLoadingAssignments(false);
    };

    loadCourseData();
  }, [selectedCourse, schoolYear]);

  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'students'>('overview');

  // Courses arrive already sorted by block; group them so the dropdown shows
  // one heading per timetable block for the selected year.
  const coursesByBlock = useMemo(() => {
    const groups = new Map<string, Course[]>();
    for (const course of courses) {
      const block = (course.block ?? '').trim().toUpperCase();
      const existing = groups.get(block);
      if (existing) existing.push(course);
      else groups.set(block, [course]);
    }
    return [...groups.entries()].sort(([a], [b]) => compareBlocks(a, b));
  }, [courses]);

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
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {courses.length === 0 ? (
                  <option value="">No courses available for this year</option>
                ) : (
                  <>
                    <option value="">Select a course...</option>
                    {coursesByBlock.map(([block, blockCourses]) => (
                      <optgroup key={block} label={block === '' ? 'No block' : `Block ${block}`}>
                        {blockCourses.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </>
                )}
              </select>
              <p className="status-info">
                {courses.length > 0 ? `${courses.length} courses` : ''}
              </p>
            </>
          )}
          <button className="signout-btn" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </div>
      </header>

      {error && (
        <div
          style={{
            margin: '12px 0',
            padding: '12px 16px',
            backgroundColor: '#7f1d1d',
            border: '1px solid #ef4444',
            borderRadius: 6,
            color: '#fecaca',
            fontSize: 13,
          }}
        >
          <strong>Database error:</strong> {error}
        </div>
      )}

      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>Assignments</button>
        <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>Students</button>
      </div>

      {activeTab === 'overview' && (
        <div className="overview-panel">
          {selectedCourse && !loadingStudents && !loadingAssignments ? (
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Students Enrolled</h3>
                <p className="metric-value">{students.length}</p>
              </div>
              <div className="metric-card">
                <h3>Assignments</h3>
                <p className="metric-value">{assignments.length}</p>
              </div>
              <div className="metric-card">
                <h3>Published</h3>
                <p className="metric-value">{assignments.filter(a => a.is_published).length}</p>
              </div>
              <div className="metric-card">
                <h3>Past Due</h3>
                <p className="metric-value">
                  {assignments.filter(a => a.due_date && new Date(a.due_date) < new Date()).length}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>
              {selectedCourse ? 'Loading…' : 'Select a course to view metrics'}
            </div>
          )}
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
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(a => {
                    const dueDate = a.due_date ? new Date(a.due_date) : null;
                    const isOverdueAssignment = dueDate !== null && dueDate < new Date();
                    return (
                      <tr key={a.id} className={isOverdueAssignment ? 'overdue' : ''}>
                        <td>{a.title}</td>
                        <td style={{ color: isOverdueAssignment ? '#ef4444' : '#e2e8f0' }}>
                          {dueDate
                            ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : '—'}
                        </td>
                        <td style={{ fontSize: 12, color: '#94a3b8' }}>{a.type ?? '—'}</td>
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
          {!selectedCourse ? (
            <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>
              Select a course to view students
            </div>
          ) : loadingStudents ? (
            <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>Loading students…</div>
          ) : students.length === 0 ? (
            <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>
              No students enrolled in this course
            </div>
          ) : (
            <table className="students-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.student_id}>
                    <td>{s.student_name}</td>
                    <td>{s.grade_year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
