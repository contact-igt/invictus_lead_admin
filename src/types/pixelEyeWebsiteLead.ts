export type PixelEyeWebsiteLeadService =
  | 'Cataract'
  | 'Lasik'
  | 'Squint'
  | 'Retina'
  | 'Glaucoma'
  | 'Keratoconus'
  | 'Pediatric';
export type PixelEyeWebsiteLeadExportFormat = 'csv' | 'pdf';

export interface PixelEyeWebsiteLead {
  id: number;
  name: string;
  mobile_number: string;
  service: PixelEyeWebsiteLeadService | null;
  ip_address: string | null;
  utm_source: string | null;
  created_at: string;
  updated_at: string;
}

export interface PixelEyeWebsiteLeadFormValues {
  name: string;
  mobile_number: string;
  service: string;
  ip_address: string;
  utm_source: string;
}

export interface CreatePixelEyeWebsiteLeadPayload {
  name: string;
  mobile_number: string;
  service?: PixelEyeWebsiteLeadService | null;
  ip_address?: string | null;
  utm_source?: string | null;
}

export interface UpdatePixelEyeWebsiteLeadPayload {
  name?: string;
  mobile_number?: string;
  service?: PixelEyeWebsiteLeadService | null;
  ip_address?: string | null;
  utm_source?: string | null;
}

export interface PixelEyeWebsiteLeadListParams {
  page?: number;
  limit?: number;
  search?: string;
  service?: PixelEyeWebsiteLeadService | '';
  utm_source?: string;
  start_date?: string;
  end_date?: string;
  _client_key?: string;
}

export type PixelEyeWebsiteLeadExportParams = Omit<PixelEyeWebsiteLeadListParams, 'page' | 'limit'>;

export interface PixelEyeWebsiteLeadListResponse {
  success: boolean;
  data: PixelEyeWebsiteLead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PixelEyeWebsiteLeadSummary {
  total_leads: number;
  today_leads: number;
  this_month_leads: number;
  top_service: PixelEyeWebsiteLeadService | null;
  top_service_count: number;
}

export interface PixelEyeWebsiteLeadSummaryResponse {
  success: boolean;
  data: PixelEyeWebsiteLeadSummary;
}

export interface PixelEyeWebsiteLeadResponse {
  success: boolean;
  message?: string;
  data: PixelEyeWebsiteLead;
}

export interface PixelEyeWebsiteLeadDeleteResponse {
  success: boolean;
  message: string;
}

