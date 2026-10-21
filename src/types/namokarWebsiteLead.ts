export interface NamokarWebsiteLead {
  id: number;
  submission_id: string;
  form_id: string;
  name: string;
  phone: string;
  service: string;
  message?: string | null;
  referral_code?: string | null;
  page_url?: string | null;
  status: string;
  pulseos_status: string;
  sheet_sync_status: string;
  created_at: string;
}

export interface NamokarWebsiteLeadListResponse {
  success: boolean;
  data: NamokarWebsiteLead[];
}
