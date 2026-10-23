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
  source_key?: string | null;
  form_name?: string | null;
  lead_type?: string | null;
  lead_status?: string | null;
  email?: string | null;
  country_calling_code?: string | null;
  mobile_e164?: string | null;
  hospital_location?: string | null;
  appointment_date?: string | null;
  appointment_time_slot?: string | null;
  symptom_or_condition?: string | null;
  symptom_details?: string | null;
  terms_accepted?: boolean | null;
  whatsapp_updates_opt_in?: boolean | null;
  marketing_contact_consent?: boolean | null;
  source_page_url?: string | null;
  referrer_url?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
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

