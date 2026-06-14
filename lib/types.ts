export type ArrBucket = 'pre_revenue' | 'under_1m' | 'one_to_5m' | 'five_to_20m' | 'over_20m'
export type BusinessModel = 'b2b_saas' | 'marketplace' | 'usage_based' | 'services_attached'
export type CustomerType = 'smb' | 'mid_market' | 'enterprise' | 'mixed'
export type FounderStatus = 'pending' | 'active' | 'paused'
export type TopicDirection = 'been_through_this' | 'figuring_this_out'
export type MatchStatus = 'pending' | 'founder_a_accepted' | 'founder_b_accepted' | 'both_accepted' | 'declined' | 'expired'

export interface Founder {
  id: string
  email: string
  first_name: string | null
  company_description: string
  arr_bucket: ArrBucket
  business_model: BusinessModel
  customer_type: CustomerType
  vertical: string | null
  geography: string
  open_to_share: string | null
  additional_notes: string | null
  status: FounderStatus
  created_at: string
  updated_at: string
}

export interface Topic {
  id: string
  name: string
  display_order: number
}

export interface FounderTopic {
  id: string
  founder_id: string
  topic_id: string
  direction: TopicDirection
  topics?: Topic
}

export interface Match {
  id: string
  founder_a_id: string
  founder_b_id: string
  topic_id: string
  status: MatchStatus
  founder_a_response: boolean | null
  founder_b_response: boolean | null
  founder_a_token: string
  founder_b_token: string
  matched_at: string
  expires_at: string
  intro_sent_at: string | null
  founders_a?: Founder
  founders_b?: Founder
  topics?: Topic
}

export const ARR_BUCKET_LABELS: Record<ArrBucket, string> = {
  pre_revenue: 'Pre-revenue',
  under_1m: 'Under $1M ARR',
  one_to_5m: '$1M–$5M ARR',
  five_to_20m: '$5M–$20M ARR',
  over_20m: 'Over $20M ARR',
}

export const BUSINESS_MODEL_LABELS: Record<BusinessModel, string> = {
  b2b_saas: 'B2B SaaS',
  marketplace: 'Marketplace',
  usage_based: 'Usage-based',
  services_attached: 'Services-attached',
}

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  smb: 'SMB',
  mid_market: 'Mid-market',
  enterprise: 'Enterprise',
  mixed: 'Mixed',
}
