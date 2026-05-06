import { _axios } from 'helper/axios';

export interface ClientPayload {
  name: string;
  client_key?: string;
}

export class ClientApiData {
  getAll = async () => _axios('get', '/clients');
  getById = async (id: number | string) => _axios('get', `/clients/${id}`);
  create = async (data: ClientPayload) => _axios('post', '/clients', data);
  update = async (id: number | string, data: Partial<ClientPayload>) =>
    _axios('patch', `/clients/${id}`, data);
  remove = async (id: number | string) => _axios('delete', `/clients/${id}`);
}
