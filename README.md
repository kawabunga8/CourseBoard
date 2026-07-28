# CourseBoard

A modern course dashboard for instructors and educators. Display student progress, assignment submissions, and course metrics in real-time.

## Features

- 📊 **Course Metrics** - Class average, submission rates, at-risk student tracking
- 📝 **Assignment Tracking** - Due dates, submission status, average scores
- 👥 **Student Progress** - Per-student grades, submission rates, performance status
- 🎯 **Multi-Course Support** - Switch between courses via dropdown
- 📱 **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Frontend:** React 19, TypeScript 5.9, Vite 7
- **Styling:** CSS 3 (dark theme)
- **Linting:** ESLint

## Commands

```bash
npm run dev              # Dev server at localhost:5173
npm run build            # Type-check + Vite bundle
npm run lint             # ESLint
npm run preview          # Preview production build
```

## Architecture

### Components

- **Dashboard** - Main container with tab navigation (Overview, Assignments, Students)
- **Metrics Panel** - Displays class-level statistics
- **Assignments Table** - Shows assignment submissions and scores
- **Students Table** - Displays student grades and progress status

### Data Flow

Currently uses mock data. In production:
- Fetch courses from `/api/courses`
- Load assignments from `/api/courses/[id]/assignments`
- Get student data from `/api/courses/[id]/students`

### Integration

Ready to integrate with:
- **rcs-report-card-tool** API (course + student data)
- **student-hub** (authentication + enrollment)
- Supabase (database)

## Deployment

Deploy to Vercel with one command:

```bash
npm run build && vercel
```

Environment variables (optional):
- `VITE_REPORT_CARD_API` - API endpoint for course data
- `VITE_STUDENT_HUB_API` - API endpoint for enrollment data

## Future Enhancements

- [ ] Real API integration with report-card-tool
- [ ] Export grades to CSV
- [ ] Student roster management
- [ ] Bulk messaging
- [ ] Assignment rubric/feedback
- [ ] Grade curves and statistics
- [ ] Late submission tracking
