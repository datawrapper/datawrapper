-- Up
INSERT INTO access_token
    (user_id, token, type, created_at, last_used_at, data)
    SELECT user_id, token, "login-token", NOW(), NULL,
        JSON_OBJECT('redirect_url', redirect_url) FROM login_token;

-- Down
