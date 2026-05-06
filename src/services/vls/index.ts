import { _axios } from 'helper/axios';

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
}

