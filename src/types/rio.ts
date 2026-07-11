export type RioService = 'High-Risk Pregnancy Care' | 'Fetal Medicine' | 'NICU' | 'PICU' | 'Paediatric Emergency Care' | 'General Paediatrics' | 'Vaccination Services' | 'Human Milk Bank' | 'Maternity Care' | 'Fertility & IVF';
export type RioBranch = 'Madurai (Main)' | 'Southwing, Madurai' | 'Dindigul' | 'Thanjavur';
export type RioExportFormat = 'csv' | 'pdf';

export interface RioLead {
  id: number;
  name: string;
  mobile_number: string;
  service: RioService | null;
  branch: RioBranch | null;
  message: string | null;
  ip_address: string | null;
  utm_source: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRioLeadPayload {
  name: string;
  mobile_number: string;
  service?: RioService | null;
  branch?: RioBranch | null;
  message?: string | null;
  ip_address?: string | null;
  utm_source?: string | null;
}

export interface UpdateRioLeadPayload {
  name?: string;
  mobile_number?: string;
  service?: RioService | null;
  branch?: RioBranch | null;
  message?: string | null;
  ip_address?: string | null;
  utm_source?: string | null;
}

export interface RioListParams {
  page?: number;
  limit?: number;
  search?: string;
  service?: RioService | '';
  branch?: RioBranch | '';
  utm_source?: string;
  start_date?: string;
  end_date?: string;
  _client_key?: string;
}

export type RioExportParams = Omit<RioListParams, 'page' | 'limit'>;

export interface RioListResponse {
  success: boolean;
  data: RioLead[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface RioSummary {
  total_leads: number;
  today_leads: number;
  this_month_leads: number;
  top_service: RioService | null;
  top_service_count: number;
}

export interface RioSummaryResponse { success: boolean; data: RioSummary }
export interface RioLeadResponse { success: boolean; message?: string; data: RioLead }
export interface RioDeleteResponse { success: boolean; message: string }
