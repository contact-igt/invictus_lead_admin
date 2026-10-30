export type VlsConstitutionalBootcampExportFormat = 'csv' | 'pdf';

export interface VlsConstitutionalBootcampRegistration {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
  amount: string | null;
  registered_date: string | null;
  programm_date: string | null;
  payment_status: string | null;
  captured: boolean | null;
  page_name: string | null;
  ip_address: string | null;
  utm_source: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVlsConstitutionalBootcampPayload {
  name: string;
  mobile: string;
  email?: string | null;
  amount?: string | number | null;
  registered_date?: string | null;
  programm_date?: string | null;
  payment_status?: string | null;
  captured?: boolean | null;
  page_name?: string | null;
  ip_address?: string | null;
  utm_source?: string | null;
}

export type UpdateVlsConstitutionalBootcampPayload = Partial<CreateVlsConstitutionalBootcampPayload>;

export interface VlsConstitutionalBootcampListParams {
  page?: number;
  limit?: number;
  search?: string;
  payment_status?: string;
  captured?: boolean | '';
  page_name?: string;
  utm_source?: string;
  registered_start_date?: string;
  registered_end_date?: string;
  programm_start_date?: string;
  programm_end_date?: string;
  _client_key?: string;
}

export type VlsConstitutionalBootcampExportParams = Omit<VlsConstitutionalBootcampListParams, 'page' | 'limit'>;

export interface VlsConstitutionalBootcampListResponse {
  success: boolean;
  data: VlsConstitutionalBootcampRegistration[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VlsConstitutionalBootcampSummary {
  total_registrations: number;
  today_registrations: number;
  total_amount: number;
  paid_registrations: number;
}

export interface VlsConstitutionalBootcampSummaryResponse {
  success: boolean;
  data: VlsConstitutionalBootcampSummary;
}

export interface VlsConstitutionalBootcampResponse {
  success: boolean;
  message?: string;
  data: VlsConstitutionalBootcampRegistration;
}

export interface VlsConstitutionalBootcampDeleteResponse {
  success: boolean;
  message: string;
}
