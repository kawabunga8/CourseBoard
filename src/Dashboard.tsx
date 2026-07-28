import { useState, useEffect } from 'react';
import './Dashboard.css';

interface Course {
  id: string;
  name: string;
  code: string;
  semester: string;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: Date;
  submitted: number;
  total: number;
  avgScore?: number;
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

export default function Dashboard() {
  const [selectedCourse, setSelectedCourse] = useState<string>('CP12');
  const [courses] = useState<Course[]>([
    { id: 'CP12', name: 'Computer Programming 12', code: 'CP12', semester: 'S1 2026' },
    { id: 'CP11', name: 'Computer Programming 11', code: 'CP11', semester: 'S1 2026' },
    { id: 'CS10', name: 'Computer Science 10', code: 'CS10', semester: 'S1 2026' },
  ]);

  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: 'a1',
      title: 'Unit 1: Variables & Data Types',
      dueDate: new Date('2026-08-15'),
      submitted: 28,
      total: 30,
      avgScore: 87,
    },
    {
      id: 'a2',
      title: 'Unit 2: Control Flow',
      dueDate: new Date('2026-08-29'),
      submitted: 26,
      total: 30,
      avgScore: 82,
    },
    {
      id: 'a3',
      title: 'Unit 3: Functions & Scope',
      dueDate: new Date('2026-09-12'),
      submitted: 24,
      total: 30,
      avgScore: 85,
    },
  ]);

  const [students, setStudents] = useState<StudentProgress[]>([
    { name: 'Alice Johnson', email: 'alice@school', avgGrade: 95, submissionRate: 100, status: 'excellent' },
    { name: 'Bob Smith', email: 'bob@school', avgGrade: 88, submissionRate: 93, status: 'on-track' },
    { name: 'Carol Davis', email: 'carol@school', avgGrade: 72, submissionRate: 67, status: 'at-risk' },
    { name: 'David Lee', email: 'david@school', avgGrade: 91, submissionRate: 100, status: 'excellent' },
    { name: 'Emma Wilson', email: 'emma@school', avgGrade: 78, submissionRate: 80, status: 'on-track' },
  ]);

  const [metrics, setMetrics] = useState<CourseMetrics>({
    classAvg: 86.8,
    submissionRate: 88,
    atRiskCount: 1,
    excellentCount: 2,
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'students'>('overview');

  useEffect(() => {
    // Simulate loading course data
    const loadCourseData = async () => {
      // In production: fetch from /api/courses/[id]/...
      await new Promise(resolve => setTimeout(resolve, 300));
      setAssignments(prev => prev.map(a => ({ ...a })));
    };

    loadCourseData();
  }, [selectedCourse]);

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (date: Date) => date < new Date();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📚 Course Dashboard</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.name}
              </option>
            ))}
          </select>
          <p className="status-info">Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </header>

      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>Assignments</button>
        <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>Students</button>
      </div>

      {activeTab === 'overview' && (
        <div className="overview-panel">
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Class Average</h3>
              <p className="metric-value">{metrics.classAvg.toFixed(1)}%</p>
              <span className="metric-badge" style={{ backgroundColor: '#10b98166' }}>Healthy</span>
            </div>
            <div className="metric-card">
              <h3>Submission Rate</h3>
              <p className="metric-value">{metrics.submissionRate}%</p>
              <span className="metric-badge" style={{ backgroundColor: '#10b98166' }}>Good</span>
            </div>
            <div className="metric-card">
              <h3>At-Risk Students</h3>
              <p className="metric-value">{metrics.atRiskCount}</p>
              <span className="metric-badge" style={{ backgroundColor: '#f59e0b66' }}>Monitor</span>
            </div>
            <div className="metric-card">
              <h3>Excellent (90%+)</h3>
              <p className="metric-value">{metrics.excellentCount}</p>
              <span className="metric-badge" style={{ backgroundColor: '#06b6d466' }}>Excellent</span>
            </div>
          </div>

          <div className="alerts-section">
            <h2>Alerts & Notices</h2>
            <div className="alert">
              <span>⚠️</span>
              <div>
                <strong>Carol Davis</strong> - Falling behind on submissions (67% rate)
              </div>
              <button className="alert-action">Contact</button>
            </div>
            <div className="alert">
              <span>✅</span>
              <div>
                <strong>Unit 3 Assignment</strong> - 80% submitted, avg score 85%
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="assignments-panel">
          <table className="assignments-table">
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Due Date</th>
                <th>Submitted</th>
                <th>Avg Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id} className={isOverdue(a.dueDate) ? 'overdue' : ''}>
                  <td>{a.title}</td>
                  <td style={{ color: isOverdue(a.dueDate) ? '#ef4444' : '#e2e8f0' }}>
                    {formatDate(a.dueDate)}
                  </td>
                  <td>
                    <span className="badge">{a.submitted}/{a.total}</span>
                  </td>
                  <td>{a.avgScore ? `${a.avgScore}%` : 'N/A'}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor:
                          a.submitted === a.total
                            ? '#10b98166'
                            : a.submitted >= a.total * 0.8
                              ? '#10b98166'
                              : '#f59e0b66',
                      }}
                    >
                      {a.submitted === a.total ? '✓ Complete' : `${Math.round((a.submitted / a.total) * 100)}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
