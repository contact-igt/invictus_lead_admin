/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { store } from '../redux/store';
import type { RootState } from '../redux/store';
import { clearAuthData } from 'redux/slices/auth/authSlice';

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

interface AxiosHelperOptions {
  responseType?: 'json' | 'blob' | 'arraybuffer' | 'text';
  returnRawResponse?: boolean;
}

export const _axios = async (
  method?: string,
  url?: string,
  body?: any,
  contentType: string = 'application/json',
  params?: any,
  options?: AxiosHelperOptions,
) => {
  const APIURL =
    import.meta.env.VITE_SERVER_PORT === 'production'
      ? import.meta.env.VITE_PRODUCTION_API_URL
      : import.meta.env.VITE_SERVER_PORT === 'development'
        ? import.meta.env.VITE_DEVELOPMENT_API_URL
        : import.meta.env.VITE_LOCALHOST_API_URL;

  const normalizedApiUrl = APIURL?.trim();
  const endpoint = `${normalizedApiUrl}${url}`;
  const isNgrokUrl = normalizedApiUrl?.includes('ngrok-free.dev');
  const lowerMethod = (method || '').toLowerCase();
  const isGetRequest = lowerMethod === 'get';
  const state: RootState = store.getState();
  const token = state.auth.token;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);

      if (decoded.exp < currentTime) {
        console.warn('Token is expired');
        store.dispatch(clearAuthData());
        throw new Error('Token expired');
      }
    } catch (e) {
      console.error('Invalid token:', e);
      store.dispatch(clearAuthData());
      throw e;
    }
  }

  const isFormData = body instanceof FormData;
  // Add a timestamp to all GET requests so stale/proxy cache does not affect any client module.
  const requestParams = isGetRequest ? { ...(params || {}), _ts: Date.now() } : params;

  try {
    const res = await axios({
      headers: {
        ...(isFormData ? {} : { 'Content-Type': contentType }),
        ...(isGetRequest
          ? {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          }
          : {}),
        ...(isNgrokUrl ? { 'ngrok-skip-browser-warning': 'true' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      method: method,
      url: endpoint,
      data: body,
      params: requestParams,
      responseType: options?.responseType,
    });
    if (options?.returnRawResponse) {
      return res;
    }
    return res.data;
  } catch (err) {
    console.error('Axios error:', err);
    throw err;
  }
};
