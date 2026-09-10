export type VlsBusinessLawExportFormat = 'csv' | 'pdf';

export interface VlsBusinessLawRegistration {
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

export interface CreateVlsBusinessLawPayload {
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

export type UpdateVlsBusinessLawPayload = Partial<CreateVlsBusinessLawPayload>;

export interface VlsBusinessLawListParams {
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

export type VlsBusinessLawExportParams = Omit<VlsBusinessLawListParams, 'page' | 'limit'>;

export interface VlsBusinessLawListResponse {
  success: boolean;
  data: VlsBusinessLawRegistration[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VlsBusinessLawSummary {
  total_registrations: number;
  today_registrations: number;
  total_amount: number;
  paid_registrations: number;
}

export interface VlsBusinessLawSummaryResponse {
  success: boolean;
  data: VlsBusinessLawSummary;
}

export interface VlsBusinessLawResponse {
  success: boolean;
  message?: string;
  data: VlsBusinessLawRegistration;
}

export interface VlsBusinessLawDeleteResponse {
  success: boolean;
  message: string;
}
