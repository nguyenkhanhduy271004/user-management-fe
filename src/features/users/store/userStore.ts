import { create } from 'zustand';
import { usersApi } from '../api';
import { DEFAULT_USER_QUERY } from '../api';
import type { User, UserQuery, UserFormValues, UserUpdatePayload } from '../types';
import { getApiErrorMessage } from '../../../api/httpClient';

type UserState = {
    users: User[];
    query: UserQuery;
    loading: boolean;
    submitting: boolean;
    deletingId: number | null;
    error: string | null;
    info: string | null;

    loadUsers: () => Promise<void>;
    setQuery: (query: Partial<UserQuery>) => void;
    createUser: (values: UserFormValues) => Promise<void>;
    updateUser: (user: User, values: UserFormValues) => Promise<void>;
    deleteUser: (user: User) => Promise<void>;
    clearMessage: () => void;
};

export const useUserStore = create<UserState>((set, get) => ({
    users: [],
    query: DEFAULT_USER_QUERY,
    loading: false,
    submitting: false,
    deletingId: null,
    error: null,
    info: null,

    setQuery: (query) =>
        set((state) => ({
            query: { ...state.query, ...query },
        })),

    loadUsers: async () => {
        const { query } = get();
        set({ loading: true, error: null });
        try {
            const res = await usersApi.list(query);
            set({ users: res.data ?? [] });
        } catch (err) {
            set({ error: getApiErrorMessage(err) });
        } finally {
            set({ loading: false });
        }
    },

    createUser: async (values) => {
        set({ submitting: true, error: null });
        try {
            await usersApi.create({
                username: values.username,
                fullName: values.fullName,
                password: values.password,
            });
            set({ info: 'Thêm người dùng thành công.' });
            await get().loadUsers();
        } catch (err) {
            set({ error: getApiErrorMessage(err) });
        } finally {
            set({ submitting: false });
        }
    },

    updateUser: async (user, values) => {
        set({ submitting: true, error: null });
        try {
            const payload: UserUpdatePayload = { userId: user.userId };
            if (values.fullName.trim()) payload.fullName = values.fullName.trim();
            if (values.password.trim()) payload.password = values.password.trim();

            await usersApi.update(payload);
            set({ info: 'Cập nhật người dùng thành công.' });
            await get().loadUsers();
        } catch (err) {
            set({ error: getApiErrorMessage(err) });
        } finally {
            set({ submitting: false });
        }
    },

    deleteUser: async (user) => {
        set({ deletingId: user.userId, error: null });
        try {
            await usersApi.remove(user.userId);
            set({ info: 'Xóa người dùng thành công.' });
            await get().loadUsers();
        } catch (err) {
            set({ error: getApiErrorMessage(err) });
        } finally {
            set({ deletingId: null });
        }
    },

    clearMessage: () => set({ error: null, info: null }),
}));
