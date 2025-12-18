export type SortOption = 'user_id' | 'username';

export interface User {
  userId: number;
  username: string;
  fullName: string;
}

export interface UserQuery {
  page?: number;
  size?: number;
  sort?: SortOption;
}

export interface UserCreatePayload {
  username: string;
  fullName: string;
  password: string;
}

export interface UserUpdatePayload {
  userId: number;
  fullName?: string;
  password?: string;
}

export type UserFormMode = 'create' | 'edit';

export interface UserFormValues {
  username: string;
  fullName: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

