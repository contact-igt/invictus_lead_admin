export type VlsEconomicLawsExportFormat = 'csv' | 'pdf';

export interface VlsEconomicLawsRegistration {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
  amount: string | null;
  registered_date: string | null;
  programm_date: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  payment_status: string | null;
  captured: boolean | null;
  page_name: string | null;
  ip_address: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVlsEconomicLawsPayload {
  name: string;
  mobile: string;
  email?: string | null;
  amount?: string | number | null;
  registered_date?: string | null;
  programm_date?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  payment_status?: string | null;
  captured?: boolean | null;
  page_name?: string | null;
  ip_address?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
}

export type UpdateVlsEconomicLawsPayload = Partial<CreateVlsEconomicLawsPayload>;

export interface VlsEconomicLawsListParams {
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

export type VlsEconomicLawsExportParams = Omit<VlsEconomicLawsListParams, 'page' | 'limit'>;

export interface VlsEconomicLawsListResponse {
  success: boolean;
  data: VlsEconomicLawsRegistration[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VlsEconomicLawsSummary {
  total_registrations: number;
  today_registrations: number;
  total_amount: number;
  paid_registrations: number;
}

export interface VlsEconomicLawsSummaryResponse {
  success: boolean;
  data: VlsEconomicLawsSummary;
}

export interface VlsEconomicLawsResponse {
  success: boolean;
  message?: string;
  data: VlsEconomicLawsRegistration;
}

export interface VlsEconomicLawsDeleteResponse {
  success: boolean;
  message: string;
}
