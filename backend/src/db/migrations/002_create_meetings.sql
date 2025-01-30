CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_meeting',
  transcript JSONB,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add an index on bot_id for faster lookups
CREATE INDEX meetings_bot_id_idx ON meetings(bot_id);

-- Add an index on status for filtering
CREATE INDEX meetings_status_idx ON meetings(status); 