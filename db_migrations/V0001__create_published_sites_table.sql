CREATE TABLE IF NOT EXISTS published_sites (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  project_name TEXT NOT NULL,
  html_content TEXT NOT NULL,
  css_content TEXT NOT NULL,
  js_content TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_published_sites_user ON published_sites(user_email);
CREATE INDEX idx_published_sites_created ON published_sites(created_at DESC);