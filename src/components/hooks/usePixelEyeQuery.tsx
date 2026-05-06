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
        return (res?.data ?? []) as PixelEyeLead[];
    });

export const useCreatePixelEyeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation(
        (payload: CreatePixelEyePayload) => _axios('post', '/pixeleye', payload),
        {
            onSuccess: () => queryClient.invalidateQueries(['pixelEyeLeads']),
        }
    );
};

export const useUpdatePixelEyeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation(
        ({ id, ...payload }: UpdatePixelEyePayload) => _axios('patch', `/pixeleye/${id}`, payload),
        {
            onSuccess: () => queryClient.invalidateQueries(['pixelEyeLeads']),
        }
    );
};

export const useDeletePixelEyeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation(
        (id: number) => _axios('delete', `/pixeleye/${id}`),
        {
            onSuccess: () => queryClient.invalidateQueries(['pixelEyeLeads']),
        }
    );
};
