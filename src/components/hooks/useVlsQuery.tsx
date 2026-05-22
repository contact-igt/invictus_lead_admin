import { AxiosError } from "axios";
import { useSnackbar } from "notistack";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { VlsApiData } from "services/vls";


const VlsApis = new VlsApiData();


export const useVlsLawpracticeQuery = () => {
    const { enqueueSnackbar } = useSnackbar();

    const { data, isLoading, isError } = useQuery(['vls-law-practice'], () => VlsApis.getAllVlsLawPractice(), {
        staleTime: 2 * 60 * 1000,
        onError: (error: Error) => {
            enqueueSnackbar(error.message || 'Failed to load data', { variant: 'error' });
        },
    });

    return { data, isLoading, isError };
};

export const useDeleteVlsLawPracticeByIdMutation = () => {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    return useMutation<void, Error, { id: number }>(
        ({ id }) => VlsApis.deleteVlsLawPracticeById(id),
        {
            onSuccess: () => {
                enqueueSnackbar('Vls Law Practice User deleted successfully', { variant: 'success' });
                queryClient.invalidateQueries(['vls-law-practice']);
            },
            onError: (error) => {
                const err = error as AxiosError<any>;
                enqueueSnackbar(err.response?.data?.message || 'Something went wrong', {
                    variant: 'error',
                });
            },
        },
    );
}

export const useVlsLawAcademyQuery = () => {
    const { enqueueSnackbar } = useSnackbar();

    const { data, isLoading, isError } = useQuery(['vls-law-academy'], () => VlsApis.getAllVlsLawAcademy(), {
        staleTime: 2 * 60 * 1000,
        onError: (error: Error) => {
            enqueueSnackbar(error.message || 'Failed to load data', { variant: 'error' });
        },
    });

    return { data, isLoading, isError };
};

export const useDeleteVlsLawAcademyByIdMutation = () => {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    return useMutation<void, Error, { id: number }>(
        ({ id }) => VlsApis.deleteVlsLawAcademyById(id),
        {
            onSuccess: () => {
                enqueueSnackbar('Vls Law Academy User deleted successfully', { variant: 'success' });
                queryClient.invalidateQueries(['vls-law-academy']);
            },
            onError: (error) => {
                const err = error as AxiosError<any>;
                enqueueSnackbar(err.response?.data?.message || 'Something went wrong', {
                    variant: 'error',
                });
            },
        },
    );
}

// vls AIBE




export const useVlsLawAibeQuery = () => {
    const { enqueueSnackbar } = useSnackbar();

    const { data, isLoading, isError } = useQuery(['vls-aibe'], () => VlsApis.getAllVlsAibe(), {
        staleTime: 2 * 60 * 1000,
        onError: (error: Error) => {
            enqueueSnackbar(error.message || 'Failed to load data', { variant: 'error' });
        },
    });
    return { data, isLoading, isError };
};

export const useDeleteVlsLawAibeByIdMutation = () => {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    return useMutation<void, Error, { id: number }>(
        ({ id }) => VlsApis.deleteVlsLawAibe(id),
        {
            onSuccess: () => {
                enqueueSnackbar('Vls Law Academy aibe User deleted successfully', { variant: 'success' });
                queryClient.invalidateQueries(['vls-aibe']);
            },
            onError: (error) => {
                const err = error as AxiosError<any>;
                enqueueSnackbar(err.response?.data?.message || 'Something went wrong', {
                    variant: 'error',
                });
            },
        },
    );
}

// Admin hooks for dedicated /vls-aibe endpoints
export const useVlsAibeAdminQuery = () => {
    const { enqueueSnackbar } = useSnackbar();

    const { data, isLoading, isError } = useQuery(['vls-aibe-admin'], () => VlsApis.getAllVlsAibeAdmin(), {
        staleTime: 2 * 60 * 1000,
        onError: (error: Error) => {
            enqueueSnackbar(error.message || 'Failed to load data', { variant: 'error' });
        },
    });

    return { data, isLoading, isError };
};

export const useDeleteVlsAibeByIdMutation = () => {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    return useMutation<void, Error, { id: number }>(
        ({ id }) => VlsApis.deleteVlsAibeById(id),
        {
            onSuccess: () => {
                enqueueSnackbar('Vls AIBE User deleted successfully', { variant: 'success' });
                queryClient.invalidateQueries(['vls-aibe-admin']);
                queryClient.invalidateQueries(['vls-aibe']);
            },
            onError: (error) => {
                const err = error as AxiosError<any>;
                enqueueSnackbar(err.response?.data?.message || 'Something went wrong', {
                    variant: 'error',
                });
            },
        },
    );
}