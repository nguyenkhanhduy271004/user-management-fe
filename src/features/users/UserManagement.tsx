import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  TablePagination,
  Typography,
} from '@mui/material';
import { getApiErrorMessage } from '../../api/httpClient';
import { DEFAULT_USER_QUERY, usersApi } from './api';
import type {
  SortOption,
  User,
  UserFormMode,
  UserFormValues,
  UserQuery,
  UserUpdatePayload,
} from './types';
import UserFormDialog from './components/UserFormDialog';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState<UserQuery>(DEFAULT_USER_QUERY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<UserFormMode>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersApi.list(query);
      setUsers(response.data ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openCreateDialog = () => {
    setDialogMode('create');
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (values: UserFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      if (dialogMode === 'create') {
        await usersApi.create({
          username: values.username,
          fullName: values.fullName,
          password: values.password,
        });
        setInfo('Thêm người dùng thành công.');
      } else if (selectedUser) {
        const fullName = values.fullName.trim();
        const password = values.password.trim();

        const payload: UserUpdatePayload = { userId: selectedUser.userId };
        if (fullName) payload.fullName = fullName;
        if (password) payload.password = password;

        await usersApi.update(payload);
        setInfo('Cập nhật người dùng thành công.');
      }
      handleDialogClose();
      await loadUsers();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    const confirmed = window.confirm(`Bạn chắc chắn muốn xóa người dùng "${user.fullName}"?`);
    if (!confirmed) return;
    setDeletingId(user.userId);
    setError(null);
    try {
      await usersApi.remove(user.userId);
      setInfo('Xóa người dùng thành công.');
      await loadUsers();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSortChange = (event: ChangeEvent<HTMLInputElement>) => {
    const sortValue = event.target.value as SortOption;
    setQuery((prev) => ({ ...prev, sort: sortValue }));
  };

  const handleSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) return;
    setQuery((prev) => ({ ...prev, page: 0, size: Math.max(1, Math.min(100, value)) }));
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setQuery((prev) => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10);
    setQuery((prev) => ({ ...prev, page: 0, size: newSize }));
  };

  const page = query.page ?? 0;
  const size = query.size ?? DEFAULT_USER_QUERY.size!;
  const hasMore = users.length === size;
  const paginationCount = useMemo(
    () => page * size + users.length + (hasMore ? 1 : 0),
    [page, size, users.length, hasMore],
  );

  const isEmpty = useMemo(() => !loading && users.length === 0, [loading, users.length]);

  return (
    <Box mt={3}>
      <Card className="panel-card">
        {loading && <LinearProgress />}
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" gap={2}>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Quản lý người dùng
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={loadUsers} disabled={loading || submitting}>
                Làm mới
              </Button>
              <Button variant="contained" onClick={openCreateDialog} disabled={submitting}>
                Thêm mới
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
            <TextField
              select
              label="Sắp xếp theo"
              value={query.sort}
              onChange={handleSortChange}
              sx={{ minWidth: 180 }}
              SelectProps={{ native: true }}
            >
              <option value="user_id">ID</option>
              <option value="username">Tên đăng nhập</option>
            </TextField>
           
          </Stack>

          <Stack spacing={1} mb={2}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            {info && (
              <Alert severity="success" onClose={() => setInfo(null)}>
                {info}
              </Alert>
            )}
          </Stack>

          <TableContainer className="table-container">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="10%">ID</TableCell>
                  <TableCell width="25%">Tên đăng nhập</TableCell>
                  <TableCell>Họ và tên</TableCell>
                  <TableCell align="right" width="20%">
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userId} hover>
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" variant="outlined" onClick={() => openEditDialog(user)}>
                          Sửa
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(user)}
                          disabled={deletingId === user.userId}
                        >
                          {deletingId === user.userId ? 'Đang xóa...' : 'Xóa'}
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {isEmpty && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Box py={4} textAlign="center">
                        <Typography variant="body2" color="text.secondary">
                          Chưa có người dùng nào.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box display="flex" justifyContent="flex-end" mt={1}>
            <TablePagination
              component="div"
              rowsPerPageOptions={[5, 10, 20, 50]}
              count={paginationCount}
              rowsPerPage={size}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              labelDisplayedRows={({ page }) => `Trang ${page + 1}`}
              labelRowsPerPage="Số bản ghi mỗi trang"
            />
          </Box>
        </CardContent>
      </Card>

      <UserFormDialog
        open={dialogOpen}
        mode={dialogMode}
        initialUser={selectedUser}
        submitting={submitting}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default UserManagement;

