-- FoundersTalk Database Schema

-- Enums
CREATE TYPE arr_bucket AS ENUM ('pre_revenue', 'under_1m', 'one_to_5m', 'five_to_20m', 'over_20m');
CREATE TYPE business_model AS ENUM ('b2b_saas', 'marketplace', 'usage_based', 'services_attached');
CREATE TYPE customer_type AS ENUM ('smb', 'mid_market', 'enterprise', 'mixed');
CREATE TYPE founder_status AS ENUM ('pending', 'active', 'paused');
CREATE TYPE topic_direction AS ENUM ('been_through_this', 'figuring_this_out');
CREATE TYPE match_status AS ENUM ('pending', 'founder_a_accepted', 'founder_b_accepted', 'both_accepted', 'declined', 'expired');

-- Founders table
CREATE TABLE founders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  company_description TEXT NOT NULL,
  arr_bucket arr_bucket NOT NULL,
  business_model business_model NOT NULL,
  customer_type customer_type NOT NULL,
  vertical TEXT,
  geography TEXT NOT NULL,
  open_to_share TEXT,
  additional_notes TEXT,
  status founder_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Topics lookup table
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL
);

-- Founder-topic junction table
CREATE TABLE founder_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES founders(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  direction topic_direction NOT NULL,
  UNIQUE(founder_id, topic_id)
);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_a_id UUID NOT NULL REFERENCES founders(id),
  founder_b_id UUID NOT NULL REFERENCES founders(id),
  topic_id UUID NOT NULL REFERENCES topics(id),
  status match_status NOT NULL DEFAULT 'pending',
  founder_a_response BOOLEAN,
  founder_b_response BOOLEAN,
  founder_a_token UUID NOT NULL DEFAULT gen_random_uuid(),
  founder_b_token UUID NOT NULL DEFAULT gen_random_uuid(),
  matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '5 days'),
  intro_sent_at TIMESTAMPTZ
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER founders_updated_at
  BEFORE UPDATE ON founders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed topics
INSERT INTO topics (name, display_order) VALUES
  ('Fundraising (Seed)', 1),
  ('Fundraising (Series A)', 2),
  ('Fundraising (Series B+)', 3),
  ('Bridge Rounds and Inside Rounds', 4),
  ('Term Sheet Negotiation', 5),
  ('Picking the Right VC', 6),
  ('Down Rounds', 7),
  ('GTM and Sales Motion', 8),
  ('Hiring Your First Sales Rep', 9),
  ('Hiring a VP of Sales', 10),
  ('Pricing and Packaging', 11),
  ('Moving Upmarket (SMB to Enterprise)', 12),
  ('Customer Success and Churn Reduction', 13),
  ('Product-Led Growth', 14),
  ('Channel and Partnerships', 15),
  ('International Expansion', 16),
  ('Building and Managing a Board', 17),
  ('Co-Founder Conflict', 18),
  ('Founder-to-CEO Transition', 19),
  ('AI Integration into Product', 20),
  ('Managing Through a Down Market', 21);
