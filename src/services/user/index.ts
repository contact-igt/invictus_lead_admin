import { _axios } from "helper/axios";

export class UserApis {
    getAllUsers = async () => {
        return await _axios('get', '/users')
    }

    getUserById = async (id: number) => {
        return await _axios('get', `/users/${id}`)
    }
}