-- Create meeting_transcripts table
CREATE TABLE IF NOT EXISTS meeting_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id TEXT NOT NULL,
    transcript JSONB NOT NULL,
    summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for bot_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_meeting_transcripts_bot_id ON meeting_transcripts(bot_id);

-- Create index for created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_meeting_transcripts_created_at ON meeting_transcripts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE meeting_transcripts ENABLE ROW LEVEL SECURITY;

-- Create a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_meeting_transcripts_updated_at
    BEFORE UPDATE ON meeting_transcripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 