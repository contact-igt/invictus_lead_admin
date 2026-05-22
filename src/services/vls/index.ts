import { _axios } from 'helper/axios';
import { VlsPropertyLaw } from './script';

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

