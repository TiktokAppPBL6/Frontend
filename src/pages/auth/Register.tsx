import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/auth/AuthCard';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { RegisterFormFields } from '@/components/auth/RegisterFormFields';
import { authApi } from '@/api/auth.api';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/config/api';

// Backend base URL for OAuth redirect
const BACKEND_URL = API_BASE_URL;

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
      // OpenAPI spec: register returns User object only (no auto-login)
      await authApi.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName || undefined,
      });
      
      // Registration successful - redirect to login
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      setIsLoading(false);
      setTimeout(() => navigate('/auth/login'), 100);
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
    <AuthCard title="Đăng ký" description="Tạo tài khoản để bắt đầu">
      <form onSubmit={handleSubmit} className="space-y-3">
        <RegisterFormFields
          formData={formData}
          errors={errors}
          isLoading={isLoading}
          onChange={handleChange}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white mt-4" 
          disabled={isLoading}
        >
          {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
        </Button>
        
        <AuthDivider />

        <GoogleLoginButton
          onClick={handleGoogleLogin}
          disabled={isLoading}
          text="Đăng ký bằng Google"
        />
        
        <div className="text-center text-sm pt-2">
          <span className="text-gray-400">Đã có tài khoản? </span>
          <Link to="/auth/login" className="text-[#FE2C55] hover:underline font-semibold">
            Đăng nhập
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
