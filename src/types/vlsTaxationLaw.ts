export type VlsTaxationLawExportFormat = 'csv' | 'pdf';

export interface VlsTaxationLawRegistration {
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

export interface CreateVlsTaxationLawPayload {
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

export type UpdateVlsTaxationLawPayload = Partial<CreateVlsTaxationLawPayload>;

export interface VlsTaxationLawListParams {
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

export type VlsTaxationLawExportParams = Omit<VlsTaxationLawListParams, 'page' | 'limit'>;

export interface VlsTaxationLawListResponse {
  success: boolean;
  data: VlsTaxationLawRegistration[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VlsTaxationLawSummary {
  total_registrations: number;
  today_registrations: number;
  total_amount: number;
  paid_registrations: number;
}

export interface VlsTaxationLawSummaryResponse {
  success: boolean;
  data: VlsTaxationLawSummary;
}

export interface VlsTaxationLawResponse {
  success: boolean;
  message?: string;
  data: VlsTaxationLawRegistration;
}

export interface VlsTaxationLawDeleteResponse {
  success: boolean;
  message: string;
}
