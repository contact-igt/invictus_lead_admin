import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
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
    followup_state?: string | null;
    reminder_schedule_type?: string | null;
    reminder_scheduled_at?: string | null;
    reminder_notification_sent?: boolean | null;
    reminder_notification_sent_at?: string | null;
    reminder_reason?: string | null;
    reminder_permanently_closed?: boolean | null;
    reminder_cancel_reason?: string | null;
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

export interface MarkPixelEyeFollowUpHandledPayload {
    id: number;
    reason?: string;
}

export interface ReschedulePixelEyeFollowUpPayload {
    id: number;
    follow_up_date: string;
    reason?: string;
}

export interface CancelPixelEyeFollowUpPayload {
    id: number;
    status?: string;
    reason?: string;
}

// clientKey is included in the query key so super-admin switching between clients
// gets a fresh fetch instead of returning the previous client's cached data.
export const usePixelEyeQuery = (clientKey?: string) =>
    useQuery<PixelEyeLead[]>(['pixelEyeLeads', clientKey ?? null], async () => {
        const params = clientKey ? { _client_key: clientKey } : undefined;
        const res = await _axios('get', '/pixeleye', undefined, 'application/json', params);
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.debug('usePixelEyeQuery - raw response', res);
        }
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

export const useMarkPixelEyeFollowUpHandledMutation = () => {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    return useMutation(
        ({ id, reason }: MarkPixelEyeFollowUpHandledPayload) => {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.debug('useMarkPixelEyeFollowUpHandledMutation - request', id, reason);
            }
            return _axios('patch', `/pixeleye/${id}/follow-up/handled`, { reason }).then((res) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useMarkPixelEyeFollowUpHandledMutation - response', res);
                }
                return res;
            });
        },
        {
            onSuccess: (data) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useMarkPixelEyeFollowUpHandledMutation - onSuccess', data);
                }
                enqueueSnackbar('Follow-up marked as handled', { variant: 'success' });
                queryClient.invalidateQueries(['pixelEyeLeads']);
                try {
                    queryClient.refetchQueries(['pixelEyeLeads']);
                } catch (e) {}
            },
            onError: (err: any) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useMarkPixelEyeFollowUpHandledMutation - onError', err);
                }
                enqueueSnackbar(err?.response?.data?.message || err?.message || 'Failed to mark follow-up as handled', {
                    variant: 'error',
                });
            },
        }
    );
};

export const useReschedulePixelEyeFollowUpMutation = () => {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    return useMutation(
        ({ id, ...payload }: ReschedulePixelEyeFollowUpPayload) => {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.debug('useReschedulePixelEyeFollowUpMutation - request', id, payload);
            }
            return _axios('patch', `/pixeleye/${id}/follow-up/reschedule`, payload).then((res) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useReschedulePixelEyeFollowUpMutation - response', res);
                }
                return res;
            });
        },
        {
            onSuccess: (data) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useReschedulePixelEyeFollowUpMutation - onSuccess', data);
                }
                enqueueSnackbar('Follow-up rescheduled', { variant: 'success' });
                queryClient.invalidateQueries(['pixelEyeLeads']);
                try {
                    queryClient.refetchQueries(['pixelEyeLeads']);
                } catch (e) {}
            },
            onError: (err: any) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useReschedulePixelEyeFollowUpMutation - onError', err);
                }
                enqueueSnackbar(err?.response?.data?.message || err?.message || 'Failed to reschedule follow-up', {
                    variant: 'error',
                });
            },
        }
    );
};

export const useCancelPixelEyeFollowUpMutation = () => {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    return useMutation(
        ({ id, ...payload }: CancelPixelEyeFollowUpPayload) => {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.debug('useCancelPixelEyeFollowUpMutation - request', id, payload);
            }
            return _axios('patch', `/pixeleye/${id}/follow-up/cancel`, payload).then((res) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useCancelPixelEyeFollowUpMutation - response', res);
                }
                return res;
            });
        },
        {
            onSuccess: (data) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useCancelPixelEyeFollowUpMutation - onSuccess', data);
                }
                enqueueSnackbar('Follow-up closed/cancelled', { variant: 'success' });
                queryClient.invalidateQueries(['pixelEyeLeads']);
                try {
                    queryClient.refetchQueries(['pixelEyeLeads']);
                } catch (e) {}
            },
            onError: (err: any) => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('useCancelPixelEyeFollowUpMutation - onError', err);
                }
                enqueueSnackbar(err?.response?.data?.message || err?.message || 'Failed to cancel follow-up', {
                    variant: 'error',
                });
            },
        }
    );
};
