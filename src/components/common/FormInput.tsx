import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function FormInput({ label, error, className, ...props }: FormInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-300">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Input className={cn(
        'bg-[#121212] border-gray-700 text-white placeholder:text-gray-500',
        error && 'border-red-500', 
        className
      )} {...props} />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
