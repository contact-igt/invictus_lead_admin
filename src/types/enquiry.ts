export type GeneralEnquiryStatus = 'New' | 'Contacted' | 'In Progress' | 'Closed';

export type CareersStatus = 'New' | 'Shortlisted' | 'Under Review' | 'Rejected' | 'Hired';

export type CareersRole =
  | 'Graphic Designer'
  | 'Video Editor'
  | 'HR & Operations Executive'
  | 'HR & Operations Intern';

export type ExperienceLevel =
  | 'under_6_months'
  | '6_to_11_months'
  | '1_to_2_years'
  | '2_to_4_years'
  | 'over_4_years';

export type AiUsageLevel = 'ai_primary' | 'ai_ideas' | 'ai_selective' | 'ai_rare';

export interface GeneralEnquiry {
  id: string;
  name: string;
  mobile: string;
  email: string;
  industry: string;
  applied_for: string;
  submitted_at: string;
  ip_address?: string | null;
  status: GeneralEnquiryStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CareersApplication {
  id: string;
  application_reference: string;
  role: string;
  role_slug: string;
  full_name: string;
  phone: string;
  email: string;
  current_city: string;
  notice_period: string;
  experience: ExperienceLevel;
  portfolio_or_showreel: string;
  resume_or_linkedin?: string | null;
  tools: string[];
  work_categories: string[];
  workflow_answer: string;
  ai_usage: AiUsageLevel;
  judgement_answer: string;
  practical_assessment: 'Yes' | 'No';
  screening_flags?: string[];
  status: CareersStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface GeneralEnquiryListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface CareersListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
}

export interface GeneralEnquiryListResponse {
  success: boolean;
  data: GeneralEnquiry[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CareersListResponse {
  success: boolean;
  data: CareersApplication[];
  total: number;
  page: number;
  totalPages: number;
}
