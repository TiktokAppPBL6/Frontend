import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, TrendingUp, Users, Heart } from 'lucide-react';

export function Intro() {
  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-[#FE2C55] to-[#00F2EA] rounded-3xl flex items-center justify-center shadow-2xl px-10 py-4">
              <span className="text-white font-bold text-5xl"> Toptop </span>
            </div>
          </div>         
          <p className="text-xl md:text-2xl text-gray-400 mb-12">
            Khám phá video thú vị, kết nối với cộng đồng, và chia sẻ khoảnh khắc của bạn
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth/register">
              <Button size="lg" className="text-lg px-8 py-6 bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white">
                Đăng ký ngay
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent border-gray-700 text-white hover:bg-gray-800">
                Đăng nhập
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-24 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Play className="h-10 w-10" />}
            title="Video ngắn"
            description="Xem hàng triệu video sáng tạo từ cộng đồng"
          />
          <FeatureCard
            icon={<TrendingUp className="h-10 w-10" />}
            title="Xu hướng"
            description="Theo dõi các xu hướng mới nhất và viral"
          />
          <FeatureCard
            icon={<Users className="h-10 w-10" />}
            title="Cộng đồng"
            description="Kết nối với người sáng tạo và người theo dõi"
          />
          <FeatureCard
            icon={<Heart className="h-10 w-10" />}
            title="Tương tác"
            description="Thích, bình luận và chia sẻ video yêu thích"
          />
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
    <div className="bg-[#1e1e1e] border border-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:border-gray-700 transition-all">
      <div className="text-[#FE2C55] mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
