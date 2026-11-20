import axios from 'axios';
import { store } from '@api/store';
import { clearAuth } from '@api/auth/auth.slice';
import { queryClient } from '@api/queryClient';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  paramsSerializer: {
    indexes: null,
  },
});

let isRefreshing = false;
let refreshPromise: Promise<unknown> | null = null;

// Finish issuing any replacement cookies before logout expires them.
export const waitForTokenRefresh = async () => {
  if (refreshPromise) await refreshPromise.catch(() => undefined);
};

let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  failedQueue = [];
};

instance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    const url: string = originalRequest?.url ?? '';
    const skipRefresh = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/logout',
    ].some(path => url.includes(path));

    const auth = store.getState().auth;
    const hadSession = Boolean(auth.user);

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !skipRefresh &&
      hadSession &&
      !auth.loading.logout
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => instance(originalRequest))
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        refreshPromise = instance.post('/auth/refresh');
        await refreshPromise;
        processQueue(null);
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        store.dispatch(clearAuth());
        queryClient.clear();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
