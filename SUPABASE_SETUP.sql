-- CourseBoard: Separate Course Rosters by School Year
-- Run these queries in Supabase SQL Editor to set up independent course rosters

-- ========================================
-- STEP 1: Reset all courses (start fresh)
-- ========================================
UPDATE rcs.courses SET school_years = NULL;

-- ========================================
-- STEP 2: 2025-26 ROSTER (7 courses)
-- ========================================
UPDATE rcs.courses
SET school_years = ARRAY['2025-26']
WHERE name IN (
  'CP 11',
  'CP 12',
  'Biblical Perspectives 10',
  'Career Life Education 10',
  'Band 12',
  'Band 11',
  'Band 10'
);

-- ========================================
-- STEP 3: 2026-27 ROSTER (All 16 courses)
-- ========================================
UPDATE rcs.courses
SET school_years = ARRAY['2026-27']
WHERE TRUE;

-- ========================================
-- STEP 4: 2027-28 ROSTER (0 courses initially)
-- ========================================
-- Leave 2027-28 empty for now. When ready to expand offerings for 2027-28,
-- add specific courses or add new courses with school_years = ARRAY['2027-28']
-- For example: INSERT INTO rcs.courses VALUES (..., school_years := ARRAY['2027-28'])
-- Or: UPDATE rcs.courses SET school_years = ARRAY['2027-28'] WHERE name IN (...);

-- ========================================
-- VERIFY: Check course distribution
-- ========================================
SELECT
  school_years,
  COUNT(*) as course_count,
  STRING_AGG(name, ', ' ORDER BY name) as courses
FROM rcs.courses
WHERE school_years IS NOT NULL
GROUP BY school_years
ORDER BY school_years;
