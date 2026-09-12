-- Migration 0002: one attendance session per (date, service_type).
--
-- The check-in flow treats (date, service_type) as a singleton ("find
-- existing session, else create"). Without a constraint, two concurrent
-- check-ins could each create a session for the same date and service type.
-- This migration makes the invariant explicit; the application retries
-- against the winning row on conflict.
--
-- Safety for deployments that already contain duplicate sessions:
--   * "winner" = the oldest session id per (date, service_type) group
--   * check-in records from the redundant ("loser") sessions are re-pointed
--     to the winner — unless the same child is already recorded in the
--     winner, in which case the loser row is a true duplicate and removed
--   * the loser sessions are then deleted
-- No check-in history is lost.

-- A) Move non-duplicate records from loser sessions to their winner session.
UPDATE attendance_records
SET session_id = (
    SELECT MIN(w.id) FROM attendance_sessions w
    WHERE w.date = (SELECT s.date FROM attendance_sessions s WHERE s.id = attendance_records.session_id)
      AND w.service_type = (SELECT s.service_type FROM attendance_sessions s WHERE s.id = attendance_records.session_id)
)
WHERE EXISTS (
    SELECT 1 FROM attendance_sessions loser
    WHERE loser.id = attendance_records.session_id
      AND EXISTS (
        SELECT 1 FROM attendance_sessions older
        WHERE older.date = loser.date
          AND older.service_type = loser.service_type
          AND older.id < loser.id
      )
)
AND NOT EXISTS (
    SELECT 1 FROM attendance_records kept
    WHERE kept.child_id = attendance_records.child_id
      AND kept.session_id = (
        SELECT MIN(w.id) FROM attendance_sessions w
        WHERE w.date = (SELECT s.date FROM attendance_sessions s WHERE s.id = attendance_records.session_id)
          AND w.service_type = (SELECT s.service_type FROM attendance_sessions s WHERE s.id = attendance_records.session_id)
      )
);

-- B) Remove the remaining loser-session records (true duplicates of the
--    winner's records for the same child).
DELETE FROM attendance_records
WHERE EXISTS (
    SELECT 1 FROM attendance_sessions loser
    WHERE loser.id = attendance_records.session_id
      AND EXISTS (
        SELECT 1 FROM attendance_sessions older
        WHERE older.date = loser.date
          AND older.service_type = loser.service_type
          AND older.id < loser.id
      )
);

-- C) Drop the redundant loser sessions.
DELETE FROM attendance_sessions
WHERE EXISTS (
    SELECT 1 FROM attendance_sessions older
    WHERE older.date = attendance_sessions.date
      AND older.service_type = attendance_sessions.service_type
      AND older.id < attendance_sessions.id
);

-- D) Enforce the invariant going forward.
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_sessions_date_type
  ON attendance_sessions (date, service_type);
