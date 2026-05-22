import { _axios } from 'helper/axios';
import { VlsPropertyLaw, VlsAibe } from './script';

export class VlsApiData {
  getAllVlsLawPractice = async () => {
    return await _axios('get', '/dynamic/vlslaw_practice');
  };

  getAllVlsLawAcademy = async () => {
    return await _axios('get', '/dynamic/vlslaw_academy');
  };

  getAllVlsAibe = async () => {
    return await _axios('get', '/dynamic/vlslaw_aibe');
  };

  // Dedicated admin endpoints (Option A): vls-aibe
  getAllVlsAibeAdmin = async () => {
    return await _axios('get', '/vls-aibe');
  };

  createVlsAibeAdmin = async (payload: Partial<VlsAibe>) => {
    return await _axios('post', '/vls-aibe', payload);
  };

  updateVlsAibeById = async (id: number | string, payload: Partial<VlsAibe>) => {
    return await _axios('patch', `/vls-aibe/${id}`, payload);
  };

  deleteVlsAibeById = async (id: number | string) => {
    return await _axios('delete', `/vls-aibe/${id}`);
  };

  deleteVlsLawPracticeById = async (id: number | string) => {
    return await _axios('delete', `/dynamic/vlslaw_practice/${id}`);
  };

  deleteVlsLawAcademyById = async (id: number | string) => {
    return await _axios('delete', `/dynamic/vlslaw_academy/${id}`);
  };

  deleteVlsLawAibe = async (id: number | string) => {
    return await _axios('delete', `/dynamic/vlslaw_aibe/${id}`);
  };

  // ── Property Law Masterclass (authenticated) ────────────────────────────────

  getAllPropertyLaw = async () => {
    return await _axios('get', '/property-law');
  };

  createPropertyLaw = async (payload: Partial<VlsPropertyLaw>) => {
    return await _axios('post', '/property-law', payload);
  };

  updatePropertyLawById = async (id: number | string, payload: Partial<VlsPropertyLaw>) => {
    return await _axios('patch', `/property-law/${id}`, payload);
  };

  deletePropertyLawById = async (id: number | string) => {
    return await _axios('delete', `/property-law/${id}`);
  };
}

