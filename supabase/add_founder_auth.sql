-- Add password_hash to founders table
ALTER TABLE founders ADD COLUMN IF NOT EXISTS password_hash TEXT;
