-- Create indices that are present in production.

-- Up
CREATE INDEX action_key_IDX ON action (`key`, user_id);
CREATE INDEX action_action_time_IDX USING BTREE ON action (action_time);

CREATE INDEX chart_idx_is_fork ON chart (is_fork);
CREATE INDEX chart_author USING BTREE ON chart (author_id);
CREATE INDEX chart_in_folder_IDX USING BTREE ON chart (in_folder);
CREATE INDEX chart_organization_id_IDX USING BTREE ON chart (organization_id);
CREATE INDEX chart_type_IDX USING BTREE ON chart (type);
CREATE INDEX chart_deleted_IDX USING BTREE ON chart (deleted);
CREATE INDEX chart_last_modified_at_IDX USING BTREE ON chart (last_modified_at);
CREATE INDEX chart_forkable_IDX USING BTREE ON chart (forkable);
CREATE INDEX chart_external_data_IDX USING BTREE ON chart (external_data);
CREATE INDEX chart_last_edit_step_IDX USING BTREE ON chart (last_edit_step);
CREATE INDEX chart_guest_session_IDX USING BTREE ON chart (guest_session);

CREATE INDEX export_job_created_at_IDX USING BTREE ON export_job (created_at);
CREATE INDEX export_job_status_IDX USING BTREE ON export_job (status);
CREATE INDEX export_job_key_IDX USING BTREE ON export_job (`key`);
CREATE INDEX export_job_priority_IDX USING BTREE ON export_job (priority);

CREATE INDEX last_updated ON session (last_updated);
CREATE INDEX session_user_id_IDX USING BTREE ON session (user_id);
CREATE INDEX session_persistent_IDX USING BTREE ON session (persistent);

CREATE INDEX created_at ON user (created_at);
CREATE INDEX user_email_IDX USING BTREE ON user (email);
CREATE INDEX user_oauth_signin_IDX USING BTREE ON user (oauth_signin);

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

DROP INDEX export_job_created_at_IDX ON export_job;
DROP INDEX export_job_status_IDX ON export_job;
DROP INDEX export_job_key_IDX ON export_job;
DROP INDEX export_job_priority_IDX ON export_job;

DROP INDEX last_updated ON session;
DROP INDEX session_user_id_IDX ON session;
DROP INDEX session_persistent_IDX ON session;

DROP INDEX created_at ON user;
DROP INDEX user_email_IDX ON user;
DROP INDEX user_oauth_signin_IDX ON user;
