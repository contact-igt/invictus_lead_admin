export type ShantiEyeTechExportFormat = 'csv' | 'pdf';

export interface ShantiEyeTechLead {
  id: number;
  name: string;
  mobile_number: string;
  service: string | null;
  message: string | null;
  ip_address: string | null;
  utm_source: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateShantiEyeTechLeadPayload {
  name: string;
  mobile_number: string;
  service?: string | null;
  message?: string | null;
  ip_address?: string | null;
  utm_source?: string | null;
}

export type UpdateShantiEyeTechLeadPayload = Partial<CreateShantiEyeTechLeadPayload>;

export interface ShantiEyeTechListParams {
  page?: number;
  limit?: number;
  search?: string;
  service?: string;
  utm_source?: string;
  start_date?: string;
  end_date?: string;
  _client_key?: string;
}

export type ShantiEyeTechExportParams = Omit<ShantiEyeTechListParams, 'page' | 'limit'>;

export interface ShantiEyeTechListResponse {
  success: boolean;
  data: ShantiEyeTechLead[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ShantiEyeTechSummary {
  total_leads: number;
  today_leads: number;
  this_month_leads: number;
  top_service: string | null;
  top_service_count: number;
}

export interface ShantiEyeTechSummaryResponse { success: boolean; data: ShantiEyeTechSummary }
export interface ShantiEyeTechLeadResponse { success: boolean; message?: string; data: ShantiEyeTechLead }
export interface ShantiEyeTechDeleteResponse { success: boolean; message: string }