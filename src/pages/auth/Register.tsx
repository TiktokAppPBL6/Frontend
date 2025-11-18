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

export function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const { login, loginWithToken } = useAuthStore();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Email validation
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    } else if (formData.email.length > 255) {
      newErrors.email = 'Email không được vượt quá 255 ký tự';
    }
    
    // Username validation
    if (!formData.username || formData.username.trim() === '') {
      newErrors.username = 'Tên người dùng là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
    } else if (formData.username.length > 50) {
      newErrors.username = 'Tên người dùng không được vượt quá 50 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Tên người dùng chỉ chứa chữ, số và dấu gạch dưới';
    }
    
    // Full name validation (optional but has max length)
    if (formData.fullName && formData.fullName.length > 100) {
      newErrors.fullName = 'Họ và tên không được vượt quá 100 ký tự';
    }
    
    // Password validation
    if (!formData.password || formData.password.trim() === '') {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (formData.password.length > 100) {
      newErrors.password = 'Mật khẩu không được vượt quá 100 ký tự';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword || formData.confirmPassword.trim() === '') {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      const response = await authApi.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName || undefined,
      });
      
      // Auto login with the access_token from registration response
      if (response.accessToken) {
        if (response.user) {
          // If we have user object, login directly
          login(response.accessToken, response.user);
        } else {
          // If no user object, login with token and fetch user info
          await loginWithToken(response.accessToken);
        }
        toast.success('Đăng ký thành công!');
        setIsLoading(false);
        // Use setTimeout to ensure state updates before navigation
        setTimeout(() => navigate('/home'), 100);
      } else {
        // Fallback: if no token, redirect to login
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsLoading(false);
        setTimeout(() => navigate('/auth/login'), 100);
      }
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.detail ||
                          error?.response?.data?.error ||
                          'Đăng ký thất bại';
      
      console.error('Register error:', errorMessage);
      
      // Handle specific backend errors
      if (errorMessage.toLowerCase().includes('google') || 
          errorMessage.toLowerCase().includes('oauth') ||
          errorMessage.toLowerCase().includes('login method')) {
        toast.error('Email này đã đăng ký bằng Google. Vui lòng sử dụng nút "Đăng nhập bằng Google".');
      } else if (errorMessage.toLowerCase().includes('email') && 
                 errorMessage.toLowerCase().includes('exist')) {
        toast.error('Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.');
      } else if (errorMessage.toLowerCase().includes('email')) {
        toast.error('Email này đã được sử dụng. Vui lòng chọn email khác.');
      } else if (errorMessage.toLowerCase().includes('username') && 
                 errorMessage.toLowerCase().includes('exist')) {
        toast.error('Tên người dùng đã tồn tại. Vui lòng chọn tên khác.');
      } else if (errorMessage.toLowerCase().includes('user')) {
        toast.error('Tên người dùng đã tồn tại. Vui lòng chọn tên khác.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    // Backend will redirect to Google, then Google redirects back to backend callback
    // Backend should then redirect to: http://localhost:3000/auth/google/callback?code={code}
    // OR frontend will handle the backend callback URL directly
    window.location.href = `${BACKEND_URL}/api/v1/auth/google/login`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Validate realtime khi người dùng nhập
    const newErrors: Record<string, string> = {};
    
    if (name === 'email') {
      if (value.length > 255) {
        newErrors.email = 'Email không được vượt quá 255 ký tự';
      } else if (value && !/\S+@\S+\.\S+/.test(value)) {
        newErrors.email = 'Email không hợp lệ';
      }
    } else if (name === 'username') {
      if (value.length > 50) {
        newErrors.username = 'Tên người dùng không được vượt quá 50 ký tự';
      } else if (value.length > 0 && value.length < 3) {
        newErrors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
      } else if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
        newErrors.username = 'Tên người dùng chỉ chứa chữ, số và dấu gạch dưới';
      }
    } else if (name === 'fullName') {
      if (value.length > 100) {
        newErrors.fullName = 'Họ và tên không được vượt quá 100 ký tự';
      }
    } else if (name === 'password') {
      if (value.length > 100) {
        newErrors.password = 'Mật khẩu không được vượt quá 100 ký tự';
      } else if (value.length > 0 && value.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
    } else if (name === 'confirmPassword') {
      if (value !== formData.password) {
        newErrors.confirmPassword = 'Mật khẩu không khớp';
      }
    }
    
    // Update errors
    setErrors((prev) => {
      const updatedErrors = { ...prev };
      // Xóa lỗi cũ của field này
      delete updatedErrors[name];
      // Thêm lỗi mới nếu có
      if (newErrors[name]) {
        updatedErrors[name] = newErrors[name];
      }
      return updatedErrors;
    });
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
          <CardTitle className="text-xl text-white">Đăng ký</CardTitle>
          <CardDescription className="text-gray-400 text-sm">Tạo tài khoản để bắt đầu</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-3">
            <FormInput
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="••••••••"
              required
              disabled={isLoading}
              minLength={6}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white mt-4" 
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
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
              Đăng ký bằng Google
            </Button>
            
            <div className="text-center text-sm pt-2">
              <span className="text-gray-400">Đã có tài khoản? </span>
              <Link to="/auth/login" className="text-[#FE2C55] hover:underline font-semibold">
                Đăng nhập
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
