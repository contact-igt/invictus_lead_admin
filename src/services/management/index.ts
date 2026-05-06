import { _axios } from 'helper/axios';

export interface UserPayload {
    title?: string;
    username: string;
    email: string;
    country_code?: string;
    mobile?: string;
    password?: string;
    role: 'super-admin' | 'admin' | 'client';
    client_key?: string;
}

export class ManagementApiData {
    createUser = async (data: UserPayload) => {
        return await _axios('post', '/users', data);
    };

    getAllManagements = async () => {
        return await _axios('get', '/users');
    };

    getManagementById = async (id: number | string) => {
        return await _axios('get', `/users/${id}`);
    };

    updateManagement = async (id: number | string, data: Partial<UserPayload>) => {
        return await _axios('patch', `/users/${id}`, data);
    };

    deleteManagement = async (id: number | string) => {
        return await _axios('delete', `/users/${id}`);
    };
}
