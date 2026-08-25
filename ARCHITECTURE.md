# Multi-Year Data Architecture

This document now lives in the repo that owns the data it describes:

**[course-hub/ARCHITECTURE.md](https://github.com/kawabunga8/course-hub/blob/main/ARCHITECTURE.md)**

CourseBoard reads the shared database and never writes to it, so the design for
that schema does not belong here. Course Hub is the source: it owns students,
courses, enrolments, quarters and the standards catalogue, and every other app
in the suite reads them.

Anything CourseBoard-specific - how it presents this data, its own views and
analysis - belongs in this repo. The shape of the data does not.
