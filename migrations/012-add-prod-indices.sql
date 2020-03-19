-- Create indices that are present in production.

-- Up
CREATE INDEX action_key_IDX USING BTREE ON action (key, user_id);
CREATE INDEX action_action_time_IDX USING BTREE ON action (action_time);

CREATE INDEX chart_idx_is_fork ON chart (is_fork);
CREATE INDEX chart_author ON chart USING BTREE (author_id);
CREATE INDEX chart_in_folder_IDX ON chart USING BTREE (in_folder);
CREATE INDEX chart_organization_id_IDX ON chart USING BTREE (organization_id);
CREATE INDEX chart_type_IDX ON chart USING BTREE (type);
CREATE INDEX chart_deleted_IDX ON chart USING BTREE (deleted);
CREATE INDEX chart_last_modified_at_IDX ON chart USING BTREE (last_modified_at);
CREATE INDEX chart_forkable_IDX ON chart USING BTREE (forkable);
CREATE INDEX chart_external_data_IDX ON chart USING BTREE (external_data);
CREATE INDEX chart_last_edit_step_IDX ON chart USING BTREE (last_edit_step);
CREATE INDEX chart_guest_session_IDX ON chart USING BTREE (guest_session);

CREATE INDEX chart_guest_session_IDX USING BTREE ON chart (guest_session);

-- Down
DROP INDEX action_key_IDX ON action;
DROP INDEX action_action_time_IDX ON action;

DROP INDEX chart_idx_is_fork ON chart;
DROP INDEX chart_author ON chart;
DROP INDEX chart_in_folder_IDX ON chart;
DROP INDEX chart_organization_id_IDX ON chart;
DROP INDEX chart_type_IDX ON chart;
DROP INDEX chart_deleted_IDX ON chart;
DROP INDEX chart_last_modified_at_IDX ON chart;
DROP INDEX chart_forkable_IDX ON chart;
DROP INDEX chart_external_data_IDX ON chart;
DROP INDEX chart_last_edit_step_IDX ON chart;
DROP INDEX chart_guest_session_IDX ON chart;

DROP INDEX chart_guest_session_IDX ON chart;
