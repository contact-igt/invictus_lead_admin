import { _axios } from "helper/axios";
import { User } from "./script";

export class AuthApis {
	login = async (data: User) => {
		return await _axios('post', '/auth/login', data)
	}
}