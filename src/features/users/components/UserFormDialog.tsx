import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { User, UserFormMode, UserFormValues } from '../types';

type Props = {
  open: boolean;
  mode: UserFormMode;
  initialUser?: User | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void> | void;
};

const emptyValues: UserFormValues = {
  username: '',
  fullName: '',
  password: '',
};

const UserFormDialog = ({
  open,
  mode,
  initialUser,
  submitting = false,
  onClose,
  onSubmit,
}: Props) => {
  const [values, setValues] = useState<UserFormValues>(emptyValues);

  useEffect(() => {
    if (initialUser) {
      setValues({
        username: initialUser.username,
        fullName: initialUser.fullName,
        password: '',
      });
      return;
    }
    setValues(emptyValues);
  }, [initialUser, open]);

  const isCreateMode = mode === 'create';

  const isValid = useMemo(() => {
    const hasName = values.fullName.trim().length > 0;
    const hasUsername = isCreateMode ? values.username.trim().length > 0 : true;
    const hasPassword = values.password.trim().length >= 4;

    if (isCreateMode) {
      return hasName && hasUsername && hasPassword;
    }

    return hasUsername && (hasName || hasPassword);
  }, [values, isCreateMode]);

  const handleChange =
    (field: keyof UserFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValid) return;
    await onSubmit({
      username: values.username.trim(),
      fullName: values.fullName.trim(),
      password: values.password.trim(),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isCreateMode ? 'Thêm người dùng' : 'Chỉnh sửa người dùng'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} mt={0.5}>
            <TextField
              label="Tài khoản"
              placeholder="username"
              value={values.username}
              onChange={handleChange('username')}
              required
              disabled={!isCreateMode}
              helperText={
                isCreateMode
                  ? 'Tên đăng nhập duy nhất, không được để trống.'
                  : 'Không thể đổi tài khoản sau khi tạo.'
              }
            />
            <TextField
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              value={values.fullName}
              onChange={handleChange('fullName')}
              required
            />
            <div>
              <TextField
                label={isCreateMode ? 'Mật khẩu' : 'Mật khẩu mới'}
                type="password"
                placeholder="••••••"
                value={values.password}
                onChange={handleChange('password')}
                required
                helperText={
                  isCreateMode
                    ? 'Tối thiểu 4 ký tự.'
                    : 'Nhập nếu muốn đổi mật khẩu (tối thiểu 4 ký tự).'
                }
                fullWidth
              />
              {!isCreateMode && (
                <Typography variant="caption" color="text.secondary">
                  Đổi mật khẩu cho lần cập nhật này.
                </Typography>
              )}
            </div>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" variant="contained" disabled={!isValid || submitting}>
            {submitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserFormDialog;

