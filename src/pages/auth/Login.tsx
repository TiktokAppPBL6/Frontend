import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/auth/AuthCard';
import { LoginFormFields } from '@/components/auth/LoginFormFields';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/app/store/auth';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/config/api';

// Backend base URL for OAuth redirect
const BACKEND_URL = API_BASE_URL;

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const navigate = useNavigate();
  const { login, loginWithToken } = useAuthStore();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      // Pass _skipRedirect to prevent global 401 redirect/reload on login failure
      const response = await authApi.login({ email, password, _skipRedirect: true });
      
      // Check if we have valid token
      if (!response.accessToken) {
        console.error('Login response missing accessToken:', response);
        toast.error('Đăng nhập thất bại: Không nhận được token');
        setIsLoading(false);
        return;
      }
      
      // If we have user object, login directly
      if (response.user) {
        login(response.accessToken, response.user);
        toast.success('Đăng nhập thành công!');
        setIsLoading(false);
        // Use setTimeout to ensure state updates before navigation
        setTimeout(() => navigate('/home'), 100);
      } else {
        // If no user object, login with token and fetch user info
        await loginWithToken(response.accessToken);
        toast.success('Đăng nhập thành công!');
        setIsLoading(false);
        // Use setTimeout to ensure state updates before navigation
        setTimeout(() => navigate('/home'), 100);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message ||
                          error?.response?.data?.error ||
                          'Đăng nhập thất bại';
      
      // Handle specific backend errors
      if (errorMessage.toLowerCase().includes('google') || 
          errorMessage.toLowerCase().includes('oauth') ||
          errorMessage.toLowerCase().includes('login method')) {
        toast.error('Tài khoản này đăng ký bằng Google. Vui lòng sử dụng nút "Đăng nhập bằng Google".');
      } else if (errorMessage.toLowerCase().includes('incorrect') || 
          errorMessage.toLowerCase().includes('invalid') ||
          errorMessage.toLowerCase().includes('wrong')) {
        toast.error('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.');
      } else if (errorMessage.toLowerCase().includes('not found')) {
        toast.error('Tài khoản không tồn tại. Vui lòng kiểm tra lại email.');
      } else if (errorMessage.toLowerCase().includes('disabled') || 
                 errorMessage.toLowerCase().includes('deactivated')) {
        toast.error('Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleGoogleLogin = () => {
      window.location.href = `${BACKEND_URL}/api/v1/auth/google/login`;
  };

  return (
    <AuthCard title="Đăng nhập" description="Đăng nhập để khám phá video thú vị">
      <form onSubmit={handleSubmit} className="space-y-3">
        <LoginFormFields
          email={email}
          password={password}
          errors={errors}
          isLoading={isLoading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white mt-4" 
          disabled={isLoading}
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
        
        <AuthDivider />

        <GoogleLoginButton
          onClick={handleGoogleLogin}
          disabled={isLoading}
        />
        
        <div className="text-center text-sm pt-2">
          <span className="text-gray-400">Chưa có tài khoản? </span>
          <Link to="/auth/register" className="text-[#FE2C55] hover:underline font-semibold">
            Đăng ký ngay
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
