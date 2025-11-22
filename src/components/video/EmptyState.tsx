import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  primaryAction,
  secondaryAction 
}: EmptyStateProps) {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-[#1e1e1e] mb-8">
          <Icon className="h-16 w-16 text-gray-600" strokeWidth={1.5} />
        </div>
        
        <h3 className="text-white font-bold text-2xl mb-3">{title}</h3>
        
        <p className="text-gray-400 text-base text-center mb-8 leading-relaxed">
          {description}
        </p>
        
        <div className="flex gap-3 justify-center">
          {secondaryAction && (
            <Link 
              to={secondaryAction.href}
              className="px-6 py-3 bg-[#1e1e1e] hover:bg-gray-800 text-white rounded-lg font-semibold transition-colors"
            >
              {secondaryAction.label}
            </Link>
          )}
          {primaryAction && (
            <Link 
              to={primaryAction.href}
              className="px-6 py-3 bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white rounded-lg font-semibold transition-colors"
            >
              {primaryAction.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
