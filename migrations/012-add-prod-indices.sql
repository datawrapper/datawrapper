-- Create indices that are present in production.

-- Up
CREATE INDEX action_key_IDX USING BTREE ON action (key, user_id);
CREATE INDEX action_action_time_IDX USING BTREE ON action (action_time);

CREATE INDEX chart_guest_session_IDX USING BTREE ON chart (guest_session);

-- Down
DROP INDEX action_key_IDX ON action;
DROP INDEX action_action_time_IDX ON action;

DROP INDEX chart_guest_session_IDX ON chart;
