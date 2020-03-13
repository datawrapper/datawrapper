-- Create an index for the guest_session field. This is important to quickly match new users former sessions.

-- Up
CREATE INDEX chart_guest_session_IDX USING BTREE ON chart (guest_session);

-- Down
DROP INDEX chart_guest_session_IDX ON chart;
