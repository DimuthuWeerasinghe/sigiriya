CREATE TABLE admin_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE CHECK(length(username) BETWEEN 3 AND 32),
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_login_at TEXT,
  disabled INTEGER NOT NULL DEFAULT 0 CHECK(disabled IN (0, 1))
);

CREATE TABLE admin_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  csrf_token TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX admin_sessions_user ON admin_sessions(user_id);

CREATE TABLE admin_login_limits (
  key TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 1,
  window_started_at INTEGER NOT NULL
);

CREATE TABLE admin_audit_log (
  id INTEGER PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  occurred_at TEXT NOT NULL,
  actor_id TEXT,
  username TEXT NOT NULL,
  action TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK(outcome IN ('success', 'failure', 'blocked')),
  summary TEXT NOT NULL CHECK(length(summary) <= 500),
  source TEXT NOT NULL CHECK(length(source) <= 100),
  previous_hash TEXT NOT NULL UNIQUE CHECK(length(previous_hash) = 64),
  entry_hash TEXT NOT NULL UNIQUE CHECK(length(entry_hash) = 64)
);
CREATE INDEX admin_audit_date ON admin_audit_log(occurred_at);
CREATE INDEX admin_audit_action ON admin_audit_log(action, outcome);

CREATE TRIGGER admin_audit_no_update
BEFORE UPDATE ON admin_audit_log
BEGIN
  SELECT RAISE(ABORT, 'Activity log entries cannot be updated');
END;

CREATE TRIGGER admin_audit_no_delete
BEFORE DELETE ON admin_audit_log
BEGIN
  SELECT RAISE(ABORT, 'Activity log entries cannot be deleted');
END;

CREATE TRIGGER admin_audit_chain_order
BEFORE INSERT ON admin_audit_log
WHEN NEW.id != COALESCE((SELECT MAX(id) FROM admin_audit_log), 0) + 1
  OR NEW.previous_hash != COALESCE((SELECT entry_hash FROM admin_audit_log ORDER BY id DESC LIMIT 1), printf('%064d', 0))
BEGIN
  SELECT RAISE(ABORT, 'Activity log chain conflict');
END;
