import httpClient from '../../api/httpClient';
import type {
  ApiResponse,
  SortOption,
  User,
  UserCreatePayload,
  UserQuery,
  UserUpdatePayload,
} from './types';

export const DEFAULT_USER_QUERY: UserQuery = {
  page: 0,
  size: 20,
  sort: 'user_id',
};

const ensureSortSafe = (sort?: SortOption) =>
  sort && ['user_id', 'username'].includes(sort) ? sort : DEFAULT_USER_QUERY.sort;

export const usersApi = {
  list: async (query: UserQuery = DEFAULT_USER_QUERY) => {
    const params = { ...query, sort: ensureSortSafe(query.sort) };
    const response = await httpClient.get<ApiResponse<User[]>>('/users', { params });
    return response.data;
  },
  create: async (payload: UserCreatePayload) => {
    const response = await httpClient.post<ApiResponse<null>>('/users', payload);
    return response.data;
  },
  update: async (payload: UserUpdatePayload) => {
    const response = await httpClient.put<ApiResponse<null>>('/users', payload);
    return response.data;
  },
  remove: async (userId: number) => {
    const response = await httpClient.delete<ApiResponse<null>>(`/users/${userId}`);
    return response.data;
  },
};

