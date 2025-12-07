-- Analytics Events Table
-- Privacy-focused: No personal data, only aggregated metrics

CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  event_category VARCHAR(50) NOT NULL,
  event_value INTEGER DEFAULT 1,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_event_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);

-- Daily aggregated stats for faster queries
CREATE TABLE IF NOT EXISTS analytics_daily_stats (
  id SERIAL PRIMARY KEY,
  stat_date DATE NOT NULL,
  stat_type VARCHAR(50) NOT NULL,
  stat_value INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(stat_date, stat_type)
);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily_stats(stat_date);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_type ON analytics_daily_stats(stat_type);

COMMENT ON TABLE analytics_events IS 'Privacy-focused analytics events - no personal data stored';
COMMENT ON TABLE analytics_daily_stats IS 'Aggregated daily statistics for performance';
