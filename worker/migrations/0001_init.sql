-- KidMin Harmony initial schema
-- Apply with: npx wrangler d1 migrations apply kidmin-harmony-db

-- =========================================================
-- Users & auth
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'parent',
  avatar TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- =========================================================
-- Children
-- =========================================================
CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob TEXT,
  gender TEXT,
  age_group TEXT,
  allergies TEXT,
  medical_notes TEXT,
  church_member INTEGER NOT NULL DEFAULT 0,
  parent_first_name TEXT,
  parent_last_name TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  emergency_contact_name TEXT,
  emergency_contact_relation TEXT,
  emergency_contact_phone TEXT,
  photo_url TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_children_parent_email ON children (parent_email);
CREATE INDEX IF NOT EXISTS idx_children_age_group ON children (age_group);

CREATE TABLE IF NOT EXISTS child_notes (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
);

-- =========================================================
-- Attendance
-- =========================================================
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'Sunday Morning',
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_date ON attendance_sessions (date);

CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  checked_in_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  checked_by TEXT,
  status TEXT NOT NULL DEFAULT 'present',
  FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  UNIQUE (session_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_records_child ON attendance_records (child_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON attendance_records (session_id);

-- =========================================================
-- Events
-- =========================================================
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  address TEXT,
  capacity INTEGER NOT NULL DEFAULT 0,
  age_group TEXT,
  requires_registration INTEGER NOT NULL DEFAULT 1,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_events_start_date ON events (start_date);

CREATE TABLE IF NOT EXISTS event_attendees (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  UNIQUE (event_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees (event_id);

CREATE TABLE IF NOT EXISTS event_volunteers (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  assigned TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_volunteers_event ON event_volunteers (event_id);

-- =========================================================
-- Lessons / curriculum
-- =========================================================
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  age_group TEXT,
  category TEXT,
  lesson_date TEXT,
  duration INTEGER,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_lessons_date ON lessons (lesson_date);

CREATE TABLE IF NOT EXISTS lesson_objectives (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  text TEXT NOT NULL,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lesson_materials (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lesson_activities (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER,
  materials TEXT,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- =========================================================
-- Partners
-- =========================================================
CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  partnership_type TEXT,
  contribution_amount TEXT,
  last_contribution TEXT,
  next_meeting TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
