import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLogo } from './AuthLogo';

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4">
      <Card className="w-full max-w-md bg-[#1e1e1e] border-gray-800">
        <CardHeader className="text-center pb-4">
          <AuthLogo />
          <CardTitle className="text-xl text-white">{title}</CardTitle>
          <CardDescription className="text-gray-400 text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
