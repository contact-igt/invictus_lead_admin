import { useQuery, useMutation, useQueryClient } from 'react-query';
import { _axios } from 'helper/axios';

export interface PixelEyeLead {
    id: number;
    date?: string;
    time?: string;
    call_id?: string;
    customer_name?: string;
    phone_number?: string;
    agent_name?: string;
    status?: string;
    day_1?: string;
    day_2?: string;
    day_3?: string;
    day_4?: string;
    day_5?: string;
    source?: string;
    type_of_enquiry?: string;
    follow_up_date?: string;
}

export interface CreatePixelEyePayload {
    date: string;
    time: string;
    call_id: string;
    customer_name: string;
    phone_number: string;
    agent_name: string;
    status: string;
    source?: string;
    type_of_enquiry?: string;
    follow_up_date?: string;
    _client_key?: string;
}

export interface UpdatePixelEyePayload {
    id: number;
    status?: string;
    date?: string;
    time?: string;
    call_id?: string;
    customer_name?: string;
    phone_number?: string;
    agent_name?: string;
    source?: string;
    type_of_enquiry?: string;
    follow_up_date?: string;
    day_1?: string;
    day_2?: string;
    day_3?: string;
    day_4?: string;
    day_5?: string;
}

export const usePixelEyeQuery = () =>
    useQuery<PixelEyeLead[]>(['pixelEyeLeads'], async () => {
        const res = await _axios('get', '/pixeleye');
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.debug('usePixelEyeQuery - raw response', res);
        }
        // _axios returns res.data (already unwrapped) in normal usage,
        // but some older callers expect an object with `data` property.
        if (Array.isArray(res)) {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.debug('usePixelEyeQuery - returning array length', res.length);
            }
            return res as PixelEyeLead[];
        }
        if (Array.isArray(res?.data)) {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.debug('usePixelEyeQuery - returning res.data length', res.data.length);
            }
            return res.data as PixelEyeLead[];
        }
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.debug('usePixelEyeQuery - returning fallback value', res ?? []);
        }
        return (res ?? []) as PixelEyeLead[];
    });

export const useCreatePixelEyeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation(
        (payload: CreatePixelEyePayload) => {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.debug('useCreatePixelEyeMutation - request payload', payload);
            }
            return _axios('post', '/pixeleye', payload).then((res) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useCreatePixelEyeMutation - response', res);
                }
                return res;
            });
        },
        {
            onMutate: (vars) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useCreatePixelEyeMutation - onMutate', vars);
                }
            },
            onSuccess: (data) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useCreatePixelEyeMutation - onSuccess', data);
                }
                queryClient.invalidateQueries(['pixelEyeLeads']);
                // Ensure immediate refetch so active views update without delay
                try {
                    queryClient.refetchQueries(['pixelEyeLeads']);
                } catch (e) {}
            },
            onError: (err) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useCreatePixelEyeMutation - onError', err);
                }
            },
        }
    );
};

export const useUpdatePixelEyeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation(
        ({ id, ...payload }: UpdatePixelEyePayload) => {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.debug('useUpdatePixelEyeMutation - request id,payload', id, payload);
            }
            return _axios('patch', `/pixeleye/${id}`, payload).then((res) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useUpdatePixelEyeMutation - response', res);
                }
                return res;
            });
        },
        {
            onMutate: (vars) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useUpdatePixelEyeMutation - onMutate', vars);
                }
            },
            onSuccess: (data) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useUpdatePixelEyeMutation - onSuccess', data);
                }
                queryClient.invalidateQueries(['pixelEyeLeads']);
                try {
                    queryClient.refetchQueries(['pixelEyeLeads']);
                } catch (e) {}
            },
            onError: (err) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useUpdatePixelEyeMutation - onError', err);
                }
            },
        }
    );
};

export const useDeletePixelEyeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation(
        (id: number) => {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.debug('useDeletePixelEyeMutation - request id', id);
            }
            return _axios('delete', `/pixeleye/${id}`).then((res) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useDeletePixelEyeMutation - response', res);
                }
                return res;
            });
        },
        {
            onMutate: (vars) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useDeletePixelEyeMutation - onMutate', vars);
                }
            },
            onSuccess: (data) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useDeletePixelEyeMutation - onSuccess', data);
                }
                queryClient.invalidateQueries(['pixelEyeLeads']);
                try {
                    queryClient.refetchQueries(['pixelEyeLeads']);
                } catch (e) {}
            },
            onError: (err) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useDeletePixelEyeMutation - onError', err);
                }
            },
        }
    );
};
