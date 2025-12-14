import { FormInput } from '@/components/common/FormInput';
import { Link } from 'react-router-dom';

interface LoginFormFieldsProps {
  email: string;
  password: string;
  errors: { email?: string; password?: string };
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}

export function LoginFormFields({ 
  email, 
  password, 
  errors, 
  isLoading, 
  onEmailChange, 
  onPasswordChange 
}: LoginFormFieldsProps) {
  return (
    <>
      <FormInput
        label="Email"
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        error={errors.email}
        placeholder="email@example.com"
        disabled={isLoading}
      />
      
      <FormInput
        label="Mật khẩu"
        type="password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        error={errors.password}
        placeholder="••••••••"
        disabled={isLoading}
      />
      
      <div className="text-right">
        <Link 
          to="/auth/forgot-password" 
          className="text-sm text-gray-400 hover:text-[#FE2C55] transition-colors"
        >
          Quên mật khẩu?
        </Link>
      </div>
    </>
  );
}
