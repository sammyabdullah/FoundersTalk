-- Fix matches table to cascade delete when a founder is deleted

ALTER TABLE matches
  DROP CONSTRAINT matches_founder_a_id_fkey,
  DROP CONSTRAINT matches_founder_b_id_fkey;

ALTER TABLE matches
  ADD CONSTRAINT matches_founder_a_id_fkey
    FOREIGN KEY (founder_a_id) REFERENCES founders(id) ON DELETE CASCADE,
  ADD CONSTRAINT matches_founder_b_id_fkey
    FOREIGN KEY (founder_b_id) REFERENCES founders(id) ON DELETE CASCADE;
