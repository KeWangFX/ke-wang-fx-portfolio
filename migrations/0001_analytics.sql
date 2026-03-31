CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer_host TEXT,
  referrer_url TEXT,
  country TEXT,
  device_type TEXT,
  browser TEXT,
  language TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at
  ON analytics_events(created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_id
  ON analytics_events(visitor_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_path
  ON analytics_events(path);
