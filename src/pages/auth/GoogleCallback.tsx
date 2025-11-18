import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/app/store/auth';
import { toast } from 'react-hot-toast';

export function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(true);
  const [message, setMessage] = useState('Đang xử lý đăng nhập Google...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔍 Current URL:', window.location.href);
        
        const token = searchParams.get('access_token') || searchParams.get('token');
        const error = searchParams.get('error');
        
        if (error) {
          console.error('❌ OAuth error:', error);
          throw new Error(error);
        }
        
        if (!token) {
          console.error('❌ No token found in URL');
          throw new Error('Không tìm thấy token. Vui lòng thử lại.');
        }
        
        console.log('🔑 Token received, logging in...');
        setMessage('Đang hoàn tất đăng nhập...');
        
        await loginWithToken(token);
        
        console.log('✅ Login successful');
        toast.success('Đăng nhập Google thành công!');
        setIsProcessing(false);
        
        // Navigate to home
        window.location.href = '/home';
        
      } catch (error: any) {
        console.error('❌ Google OAuth error:', error);
        toast.error(error.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
        setIsProcessing(false);
        
        setTimeout(() => {
          navigate('/auth/login', { replace: true });
        }, 1500);
      }
    };

    handleCallback();
  }, [searchParams, navigate, loginWithToken]);

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <div className="text-center">
        <div className="relative group mb-4">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#FE2C55] via-[#00F2EA] to-[#FE2C55] rounded-3xl blur opacity-75 animate-pulse"></div>
          <div className="relative bg-[#1e1e1e] rounded-3xl flex items-center justify-center px-8 py-3">
            <span className="text-4xl font-black bg-gradient-to-r from-[#FE2C55] via-[#FF6B9D] to-[#00F2EA] text-transparent bg-clip-text">
              Toptop
            </span>
          </div>
        </div>
        <p className="text-gray-400 text-lg mb-4">{message}</p>
        {isProcessing && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FE2C55]"></div>
          </div>
        )}
      </div>
    </div>
  );
}
