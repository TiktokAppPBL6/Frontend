import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/common/FormInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/app/store/auth';
import toast from 'react-hot-toast';

// Backend base URL for OAuth redirect
const BACKEND_URL = 'http://localhost:8000';

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
    // Redirect to backend Google OAuth endpoint
    // Backend will redirect to Google, then Google redirects back to backend callback
    // Backend should then redirect to: http://localhost:3000/auth/google/callback?code={code}
    // OR frontend will handle the backend callback URL directly
    window.location.href = `${BACKEND_URL}/api/v1/auth/google/login`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4">
      <Card className="w-full max-w-md bg-[#1e1e1e] border-gray-800">
        <CardHeader className="text-center pb-4">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FE2C55] via-[#00F2EA] to-[#FE2C55] rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative bg-[#1e1e1e] rounded-3xl flex items-center justify-center px-8 py-3">
                <span className="text-4xl font-black bg-gradient-to-r from-[#FE2C55] via-[#FF6B9D] to-[#00F2EA] text-transparent bg-clip-text">
                  Toptop
                </span>
              </div>
            </div>
          </div>
          <CardTitle className="text-xl text-white">Đăng nhập</CardTitle>
          <CardDescription className="text-gray-400 text-sm">Đăng nhập để khám phá video thú vị</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-3">
            <FormInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Giữ nguyên thông báo lỗi cho đến lần submit tiếp theo
              }}
              error={errors.email}
              placeholder="email@example.com"
              disabled={isLoading}
            />
            
            <FormInput
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                // Giữ nguyên thông báo lỗi cho đến lần submit tiếp theo
              }}
              error={errors.password}
              placeholder="••••••••"
              disabled={isLoading}
            />
            
            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                to="/auth/forgot-password" 
                className="text-sm text-gray-400 hover:text-[#FE2C55] transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white mt-4" 
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
            
            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1e1e1e] text-gray-400">Hoặc</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <Button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng nhập bằng Google
            </Button>
            
            <div className="text-center text-sm pt-2">
              <span className="text-gray-400">Chưa có tài khoản? </span>
              <Link to="/auth/register" className="text-[#FE2C55] hover:underline font-semibold">
                Đăng ký ngay
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
