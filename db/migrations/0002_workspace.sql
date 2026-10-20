CREATE TABLE inbox_conversations (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  access_token_hash TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('enquiry', 'request')),
  name TEXT NOT NULL CHECK(length(name) BETWEEN 2 AND 100),
  email TEXT NOT NULL CHECK(length(email) <= 254),
  phone TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL CHECK(length(subject) BETWEEN 3 AND 160),
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'in_progress', 'resolved', 'closed', 'archived')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK(priority IN ('normal', 'high', 'urgent')),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX inbox_kind_status ON inbox_conversations(kind, status, updated_at);

CREATE TABLE inbox_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES inbox_conversations(id),
  sender_type TEXT NOT NULL CHECK(sender_type IN ('visitor', 'admin')),
  sender_name TEXT NOT NULL,
  admin_id TEXT,
  body TEXT NOT NULL CHECK(length(body) BETWEEN 1 AND 5000),
  created_at TEXT NOT NULL
);
CREATE INDEX inbox_message_thread ON inbox_messages(conversation_id, created_at);
CREATE TRIGGER inbox_messages_no_update BEFORE UPDATE ON inbox_messages
BEGIN SELECT RAISE(ABORT, 'Message history cannot be edited'); END;
CREATE TRIGGER inbox_messages_no_delete BEFORE DELETE ON inbox_messages
BEGIN SELECT RAISE(ABORT, 'Message history cannot be deleted; archive the conversation'); END;
CREATE TRIGGER inbox_messages_open_thread BEFORE INSERT ON inbox_messages
WHEN (SELECT status FROM inbox_conversations WHERE id = NEW.conversation_id) IN ('closed', 'archived')
BEGIN SELECT RAISE(ABORT, 'Conversation is closed'); END;
CREATE TRIGGER inbox_version_guard BEFORE UPDATE ON inbox_conversations
WHEN NEW.version != OLD.version + 1
BEGIN SELECT RAISE(ABORT, 'Concurrent record change; refresh and try again'); END;

CREATE TABLE document_records (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK(length(title) BETWEEN 3 AND 160),
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  language TEXT NOT NULL,
  year INTEGER NOT NULL CHECK(year BETWEEN 1900 AND 2100),
  status TEXT NOT NULL CHECK(status IN ('draft', 'published', 'archived')),
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL CHECK(mime_type = 'application/pdf'),
  size_bytes INTEGER NOT NULL CHECK(size_bytes BETWEEN 1 AND 5242880),
  chunk_count INTEGER NOT NULL CHECK(chunk_count BETWEEN 1 AND 20),
  checksum TEXT NOT NULL CHECK(length(checksum) = 64),
  uploaded_by TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX documents_public ON document_records(status, category, created_at);
CREATE TABLE document_chunks (
  document_id TEXT NOT NULL REFERENCES document_records(id),
  part INTEGER NOT NULL CHECK(part >= 0),
  data BLOB NOT NULL CHECK(length(data) BETWEEN 1 AND 262144),
  checksum TEXT NOT NULL CHECK(length(checksum) = 64),
  PRIMARY KEY(document_id, part)
);
CREATE TABLE document_downloads (
  document_id TEXT PRIMARY KEY REFERENCES document_records(id),
  request_count INTEGER NOT NULL DEFAULT 0
);
CREATE TRIGGER document_bytes_no_update BEFORE UPDATE ON document_chunks
BEGIN SELECT RAISE(ABORT, 'Document file bytes cannot be overwritten'); END;
CREATE TRIGGER document_bytes_no_delete BEFORE DELETE ON document_chunks
BEGIN SELECT RAISE(ABORT, 'Document file bytes are retained; archive the document'); END;
CREATE TRIGGER document_version_guard BEFORE UPDATE ON document_records
WHEN NEW.version != OLD.version + 1
BEGIN SELECT RAISE(ABORT, 'Concurrent record change; refresh and try again'); END;

CREATE TABLE public_rate_limits (
  key TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 1,
  window_started_at INTEGER NOT NULL
);
