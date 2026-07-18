export type PhoenixFitnessExportFormat = 'csv' | 'pdf';

export interface PhoenixFitnessLead {
  id: number;
  name: string;
  mobile_number: string;
  branch: string | null;
  ip_address: string | null;
  utm_source: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePhoenixFitnessLeadPayload {
  name: string;
  mobile_number: string;
  branch?: string | null;
  ip_address?: string | null;
  utm_source?: string | null;
}

export type UpdatePhoenixFitnessLeadPayload = Partial<CreatePhoenixFitnessLeadPayload>;

export interface PhoenixFitnessListParams {
  page?: number;
  limit?: number;
  search?: string;
  branch?: string;
  utm_source?: string;
  start_date?: string;
  end_date?: string;
  _client_key?: string;
}

export type PhoenixFitnessExportParams = Omit<PhoenixFitnessListParams, 'page' | 'limit'>;

export interface PhoenixFitnessListResponse {
  success: boolean;
  data: PhoenixFitnessLead[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface PhoenixFitnessSummary {
  total_leads: number;
  today_leads: number;
  this_month_leads: number;
  top_branch: string | null;
  top_branch_count: number;
}

export interface PhoenixFitnessSummaryResponse { success: boolean; data: PhoenixFitnessSummary }
export interface PhoenixFitnessLeadResponse { success: boolean; message?: string; data: PhoenixFitnessLead }
export interface PhoenixFitnessDeleteResponse { success: boolean; message: string }