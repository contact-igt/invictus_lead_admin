export type VlsLawPracticeExportFormat = 'csv' | 'pdf';

export type VlsLawPracticePageName = 'decoding-of-practice' | 'decoding-of-law-practice';

export interface VlsLawPracticeRegistration {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
  amount: string | null;
  registered_date: string | null;
  programm_date: string | null;
  payment_status: string | null;
  captured: boolean | null;
  page_name: VlsLawPracticePageName | null;
  ip_address: string | null;
  utm_source: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVlsLawPracticePayload {
  name: string;
  mobile: string;
  email?: string | null;
  amount?: string | number | null;
  registered_date?: string | null;
  programm_date?: string | null;
  payment_status?: string | null;
  captured?: boolean | null;
  page_name?: VlsLawPracticePageName | null;
  ip_address?: string | null;
  utm_source?: string | null;
}

export type UpdateVlsLawPracticePayload = Partial<CreateVlsLawPracticePayload>;

export interface VlsLawPracticeListParams {
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

export type VlsLawPracticeExportParams = Omit<VlsLawPracticeListParams, 'page' | 'limit'>;

export interface VlsLawPracticeListResponse {
  success: boolean;
  data: VlsLawPracticeRegistration[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VlsLawPracticeSummary {
  total_registrations: number;
  today_registrations: number;
  total_amount: number;
  paid_registrations: number;
}

export interface VlsLawPracticeSummaryResponse {
  success: boolean;
  data: VlsLawPracticeSummary;
}

export interface VlsLawPracticeResponse {
  success: boolean;
  message?: string;
  data: VlsLawPracticeRegistration;
}

export interface VlsLawPracticeDeleteResponse {
  success: boolean;
  message: string;
}
