import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, TrendingUp, Users, Heart } from 'lucide-react';
import { useAuthStore } from '@/app/store/auth';

export function Intro() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // If user is already logged in, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#FE2C55] via-[#00F2EA] to-[#FE2C55] rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <div className="relative bg-[#121212] rounded-3xl flex items-center justify-center px-10 py-4 border-2 border-transparent">
                  <span className="text-5xl md:text-6xl font-black bg-gradient-to-r from-[#FE2C55] via-[#FF6B9D] to-[#00F2EA] text-transparent bg-clip-text">
                    Toptop
                  </span>
                </div>
              </div>
            </div>

            {/* Tagline */}
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight">
              Nền tảng video ngắn<br />
              <span className="bg-gradient-to-r from-[#FE2C55] to-[#00F2EA] text-transparent bg-clip-text">
                Sáng tạo & Giải trí
              </span>
            </h1>
            
            <p className="text-base md:text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Khám phá video thú vị, kết nối với cộng đồng, và chia sẻ khoảnh khắc của bạn
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
              <Link to="/auth/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-5 bg-gradient-to-r from-[#FE2C55] to-[#F50057] hover:from-[#FE2C55]/90 hover:to-[#F50057]/90 text-white font-semibold shadow-lg shadow-[#FE2C55]/50 hover:shadow-xl hover:shadow-[#FE2C55]/60 transition-all">
                  Đăng ký ngay
                </Button>
              </Link>
              <Link to="/auth/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-5 bg-transparent border-2 border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600 transition-all">
                  Đăng nhập
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              <FeatureCard
                icon={<Play className="h-8 w-8" />}
                title="Video ngắn"
                description="Xem hàng triệu video sáng tạo từ cộng đồng"
              />
              <FeatureCard
                icon={<TrendingUp className="h-8 w-8" />}
                title="Xu hướng"
                description="Theo dõi các xu hướng mới nhất và viral"
              />
              <FeatureCard
                icon={<Users className="h-8 w-8" />}
                title="Cộng đồng"
                description="Kết nối với người sáng tạo và người theo dõi"
              />
              <FeatureCard
                icon={<Heart className="h-8 w-8" />}
                title="Tương tác"
                description="Thích, bình luận và chia sẻ video yêu thích"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 text-sm">
            © 2025 Toptop. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative bg-[#1e1e1e] border border-gray-800 rounded-2xl p-4 shadow-lg hover:shadow-2xl hover:border-[#FE2C55]/50 transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE2C55]/5 to-[#00F2EA]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative">
        <div className="text-[#FE2C55] mb-3 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-base font-bold mb-1 text-white group-hover:text-[#FE2C55] transition-colors">{title}</h3>
        <p className="text-gray-400 text-xs leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
