import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Image - Using logo2.jpg */}
      <div className={`${sizeClasses[size]} relative`}>
        <img 
          src="/src/assets/images/logo2.jpg" 
          alt="Opsless Logo"
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Opsless Text */}
      {showText && (
        <span className={`ml-2 font-bold text-gray-900 ${textSizes[size]}`}>
          Opsless
        </span>
      )}
    </div>
  );
};

export default Logo; 