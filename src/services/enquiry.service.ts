import { _axios } from 'helper/axios';
import type {
  GeneralEnquiryListParams,
  GeneralEnquiryListResponse,
  CareersListParams,
  CareersListResponse,
  GeneralEnquiryStatus,
  CareersStatus,
} from 'types/enquiry';

export const fetchGeneralEnquiries = async (
  params: GeneralEnquiryListParams = {}
): Promise<GeneralEnquiryListResponse> => {
  return await _axios('get', '/invictus-enquiries/general', undefined, 'application/json', params);
};

export const updateGeneralEnquiryStatusApi = async (
  id: string,
  status: GeneralEnquiryStatus
): Promise<{ success: boolean; message: string }> => {
  return await _axios('patch', `/invictus-enquiries/general/${id}`, { status });
};

export const deleteGeneralEnquiryApi = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  return await _axios('delete', `/invictus-enquiries/general/${id}`);
};

export const fetchCareersApplications = async (
  params: CareersListParams = {}
): Promise<CareersListResponse> => {
  return await _axios('get', '/invictus-enquiries/careers', undefined, 'application/json', params);
};

export const updateCareersApplicationStatusApi = async (
  id: string,
  status: CareersStatus
): Promise<{ success: boolean; message: string }> => {
  return await _axios('patch', `/invictus-enquiries/careers/${id}`, { status });
};

export const deleteCareersApplicationApi = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  return await _axios('delete', `/invictus-enquiries/careers/${id}`);
};

export const exportCareersApplicationsCSVApi = async (
  params: CareersListParams = {}
): Promise<Blob> => {
  return await _axios('get', '/invictus-enquiries/careers/export', undefined, 'text/csv', params, {
    responseType: 'blob',
  });
};
