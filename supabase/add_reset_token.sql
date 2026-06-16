-- Add password reset token columns to founders
ALTER TABLE founders
  ADD COLUMN IF NOT EXISTS reset_token UUID,
  ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;
