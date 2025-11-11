import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/common/FormInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/app/store/auth';
import toast from 'react-hot-toast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loginError, setLoginError] = useState('');
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

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
    // Không xóa loginError ở đây nữa, giữ nguyên để hiển thị nếu lỗi lại
    try {
      // Pass _skipRedirect to prevent global 401 redirect/reload on login failure
      const response = await authApi.login({ email, password, _skipRedirect: true });
      login(response.accessToken, response.user);
      toast.success('Đăng nhập thành công!');
      navigate('/home');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          'Đăng nhập thất bại';
      
      if (errorMessage.toLowerCase().includes('incorrect email or password')) {
        setLoginError('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.');
      } else {
        setLoginError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
           <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-[#FE2C55] to-[#00F2EA] rounded-3xl flex items-center justify-center shadow-2xl px-10 py-4">
              <span className="text-white font-bold text-5xl"> Toptop </span>
            </div>
          </div> 
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>Đăng nhập để khám phá video thú vị</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800">{loginError}</p>
              </div>
            )}
            
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
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
            
            <div className="text-center text-sm">
              <span className="text-gray-600">Chưa có tài khoản? </span>
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
