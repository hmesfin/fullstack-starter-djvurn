// frontend/src/lib/api-client.ts
import { createClient, createConfig } from '@/api/client';
import type { ClientOptions } from '@/api/types.gen';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Configure the client with auth
const config = createConfig<ClientOptions>({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create configured client
export const apiClient = createClient(config);

// Add auth header dynamically
apiClient.instance.interceptors.request.use((request: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token && request.headers) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }
  return request;
});

// Handle token refresh on 401
apiClient.instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          // Note: You'll need to add JWT refresh endpoint to your Django setup
          const response = await fetch('/api/auth/token/refresh/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (response.ok) {
            const data = await response.json() as { access: string };
            localStorage.setItem('access_token', data.access);
            if (originalRequest.headers) {
              originalRequest.headers.set('Authorization', `Bearer ${data.access}`);
            }
            return apiClient.instance.request(originalRequest);
          }
        } catch {
          // Refresh failed
        }
      }

      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
