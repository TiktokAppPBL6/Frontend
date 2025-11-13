import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/common/FormInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/app/store/auth';
import toast from 'react-hot-toast';

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
  const login = useAuthStore((state) => state.login);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.username) {
      newErrors.username = 'Tên người dùng là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Tên người dùng chỉ chứa chữ, số và dấu gạch dưới';
    }
    
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (formData.password !== formData.confirmPassword) {
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
      login(response.accessToken, response.user);
      toast.success('Đăng ký thành công!');
      navigate('/home');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
            />
            
            <FormInput
              label="Họ và tên"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
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
            />
            
            <Button 
              type="submit" 
              className="w-full bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white mt-4" 
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
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
