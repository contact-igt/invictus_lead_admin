/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from 'react-query';
import { AuthApis } from '../../../services/auth';
import { User } from '../../../services/auth/script';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setAuthData } from 'redux/slices/auth/authSlice';
import { useSnackbar } from 'notistack';
import { AxiosError } from 'axios';
import { resolveClientModuleKey } from 'utils/clientModuleResolver';
import paths from 'routes/paths';

const { login } = new AuthApis();

export const useLoginMutation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (data: User) => login(data),
    onSuccess: (data) => {
      if (!data || data.success === false) {
        enqueueSnackbar(data?.message || 'Login failed', { variant: 'error' });
        return;
      }

      enqueueSnackbar('Login successful', { variant: 'success' });
      dispatch(
        setAuthData({
          token: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        }),
      );

      if (data.user?.role === 'client') {
        const moduleKey = resolveClientModuleKey(data.user?.clientKey);
        if (moduleKey) {
          navigate(
            moduleKey === 'aarav_eye_care'
              ? paths.aaravEyeCare(moduleKey)
              : moduleKey === 'antardrashti_netralaya'
                ? paths.antardrashtiNetralaya(moduleKey)
                : moduleKey === 'rio'
                  ? paths.rio(moduleKey)
                  : `/pages/d/${moduleKey}/overview`,
          );
          return;
        }
      }

      navigate('/');
    },
    onError: (error) => {
      const err = error as AxiosError<any>;
      enqueueSnackbar(err.response?.data?.message || 'Something went wrong', {
        variant: 'error',
      });
    },
  });
};
