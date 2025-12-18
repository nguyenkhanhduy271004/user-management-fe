import axios from 'axios';

type ApiErrorResponse = {
  success?: boolean;
  message?: string;
  details?: unknown;
};

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      'Something went wrong, please try again.'
    );
  }
  return 'Something went wrong, please try again.';
};

export default httpClient;

