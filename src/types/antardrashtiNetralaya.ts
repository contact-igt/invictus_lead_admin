export type AntardrashtiNetralayaService = 'Cataract' | 'Lasik';
export type AntardrashtiNetralayaExportFormat = 'csv' | 'pdf';

export interface AntardrashtiNetralayaLead {
  id: number;
  name: string;
  mobile_number: string;
  service: AntardrashtiNetralayaService | null;
  ip_address: string | null;
  utm_source: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAntardrashtiNetralayaLeadPayload {
  name: string;
  mobile_number: string;
  service?: AntardrashtiNetralayaService | null;
  ip_address?: string | null;
  utm_source?: string | null;
}

export interface UpdateAntardrashtiNetralayaLeadPayload {
  name?: string;
  mobile_number?: string;
  service?: AntardrashtiNetralayaService | null;
  ip_address?: string | null;
  utm_source?: string | null;
}

export interface AntardrashtiNetralayaListParams {
  page?: number;
  limit?: number;
  search?: string;
  service?: AntardrashtiNetralayaService | '';
  utm_source?: string;
  start_date?: string;
  end_date?: string;
  _client_key?: string;
}

export type AntardrashtiNetralayaExportParams = Omit<AntardrashtiNetralayaListParams, 'page' | 'limit'>;

export interface AntardrashtiNetralayaListResponse {
  success: boolean;
  data: AntardrashtiNetralayaLead[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AntardrashtiNetralayaSummary {
  total_leads: number;
  today_leads: number;
  this_month_leads: number;
  top_service: AntardrashtiNetralayaService | null;
  top_service_count: number;
}

export interface AntardrashtiNetralayaSummaryResponse { success: boolean; data: AntardrashtiNetralayaSummary }
export interface AntardrashtiNetralayaLeadResponse { success: boolean; message?: string; data: AntardrashtiNetralayaLead }
export interface AntardrashtiNetralayaDeleteResponse { success: boolean; message: string }
