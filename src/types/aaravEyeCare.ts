export type AaravEyeCareExportFormat = 'csv' | 'pdf';

export interface AaravEyeCareLead {
  id: number;
  name: string;
  mobile_number: string;
  service: string | null;
  ip_address: string | null;
  utm_source: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAaravEyeCareLeadPayload {
  name: string;
  mobile_number: string;
  service?: string | null;
  ip_address?: string | null;
  utm_source?: string | null;
}

export interface UpdateAaravEyeCareLeadPayload {
  name?: string;
  mobile_number?: string;
  service?: string | null;
  ip_address?: string | null;
  utm_source?: string | null;
}

export interface AaravEyeCareListParams {
  page?: number;
  limit?: number;
  search?: string;
  service?: string;
  utm_source?: string;
  start_date?: string;
  end_date?: string;
}

export type AaravEyeCareExportParams = Omit<AaravEyeCareListParams, 'page' | 'limit'>;

export interface AaravEyeCareListResponse {
  success: boolean;
  data: AaravEyeCareLead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AaravEyeCareSummary {
  total_leads: number;
  today_leads: number;
  this_month_leads: number;
  top_service: string | null;
  top_service_count: number;
}

export interface AaravEyeCareSummaryResponse {
  success: boolean;
  data: AaravEyeCareSummary;
}

export interface AaravEyeCareLeadResponse {
  success: boolean;
  message?: string;
  data: AaravEyeCareLead;
}

export interface AaravEyeCareDeleteResponse {
  success: boolean;
  message: string;
}
