export type VlsMactMasterClassExportFormat = 'csv' | 'pdf';

export interface VlsMactMasterClassRegistration {
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

export interface CreateVlsMactMasterClassPayload {
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

export type UpdateVlsMactMasterClassPayload = Partial<CreateVlsMactMasterClassPayload>;

export interface VlsMactMasterClassListParams {
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

export type VlsMactMasterClassExportParams = Omit<VlsMactMasterClassListParams, 'page' | 'limit'>;

export interface VlsMactMasterClassListResponse {
  success: boolean;
  data: VlsMactMasterClassRegistration[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VlsMactMasterClassSummary {
  total_registrations: number;
  today_registrations: number;
  total_amount: number;
  paid_registrations: number;
}

export interface VlsMactMasterClassSummaryResponse {
  success: boolean;
  data: VlsMactMasterClassSummary;
}

export interface VlsMactMasterClassResponse {
  success: boolean;
  message?: string;
  data: VlsMactMasterClassRegistration;
}

export interface VlsMactMasterClassDeleteResponse {
  success: boolean;
  message: string;
}
