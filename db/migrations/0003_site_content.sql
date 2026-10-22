CREATE TABLE site_section_revisions (
  section_id TEXT NOT NULL,
  version INTEGER NOT NULL CHECK(version > 0),
  content_json TEXT NOT NULL CHECK(json_valid(content_json)),
  updated_by TEXT NOT NULL REFERENCES admin_users(id),
  updated_at TEXT NOT NULL,
  PRIMARY KEY(section_id, version)
);
CREATE TRIGGER site_revision_sequence BEFORE INSERT ON site_section_revisions
WHEN NEW.version != COALESCE((SELECT MAX(version) FROM site_section_revisions WHERE section_id = NEW.section_id), 0) + 1
BEGIN SELECT RAISE(ABORT, 'Concurrent website change; refresh and try again'); END;
CREATE TRIGGER site_revision_no_update BEFORE UPDATE ON site_section_revisions
BEGIN SELECT RAISE(ABORT, 'Website revisions are retained'); END;
CREATE TRIGGER site_revision_no_delete BEFORE DELETE ON site_section_revisions
BEGIN SELECT RAISE(ABORT, 'Website revisions are retained'); END;
CREATE TABLE site_media (
  id TEXT PRIMARY KEY,
  storage_key TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL CHECK(mime_type IN ('image/png', 'image/jpeg', 'image/webp')),
  size_bytes INTEGER NOT NULL CHECK(size_bytes BETWEEN 1 AND 2097152),
  uploaded_by TEXT NOT NULL REFERENCES admin_users(id),
  created_at TEXT NOT NULL
);