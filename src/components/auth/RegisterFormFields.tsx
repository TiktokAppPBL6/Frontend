import { FormInput } from '@/components/common/FormInput';

interface RegisterFormFieldsProps {
  formData: {
    email: string;
    username: string;
    fullName: string;
    password: string;
    confirmPassword: string;
  };
  errors: Record<string, string>;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function RegisterFormFields({ formData, errors, isLoading, onChange }: RegisterFormFieldsProps) {
  return (
    <>
      <FormInput
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={onChange}
        error={errors.email}
        placeholder="email@example.com"
        required
        disabled={isLoading}
      />
      
      <FormInput
        label="Tên người dùng"
        type="text"
        name="username"
        value={formData.username}
        onChange={onChange}
        error={errors.username}
        placeholder="username123"
        required
        disabled={isLoading}
        minLength={3}
      />
      
      <FormInput
        label="Họ và tên"
        type="text"
        name="fullName"
        value={formData.fullName}
        onChange={onChange}
        error={errors.fullName}
        required
        placeholder="Nguyễn Văn A"
        disabled={isLoading}
      />
      
      <FormInput
        label="Mật khẩu"
        type="password"
        name="password"
        value={formData.password}
        onChange={onChange}
        error={errors.password}
        placeholder="••••••••"
        required
        disabled={isLoading}
        minLength={6}
      />
      
      <FormInput
        label="Xác nhận mật khẩu"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={onChange}
        error={errors.confirmPassword}
        placeholder="••••••••"
        required
        disabled={isLoading}
        minLength={6}
      />
    </>
  );
}
