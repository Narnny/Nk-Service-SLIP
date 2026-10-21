import React from 'react';

interface NkLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
}

export const NkLogo: React.FC<NkLogoProps> = ({ className = '', size = 'md', showSlogan = true }) => {
  const sizeClasses = {
    sm: 'w-24',
    md: 'w-36',
    lg: 'w-48'
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
        {/* SVG Recreation of the NK SERVICE circular shield mark */}
        <svg viewBox="0 0 240 180" className="w-full h-auto drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="nkBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#075985" />
            </linearGradient>
            <linearGradient id="nkOrbitGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>
          
          {/* Swoosh orbit ring */}
          <path 
            d="M 30,120 C 10,80 50,20 130,20 C 190,20 225,55 220,95 C 215,135 160,150 120,150 C 70,150 35,130 30,120" 
            stroke="url(#nkOrbitGrad)" 
            strokeWidth="11" 
            strokeLinecap="round" 
            fill="none" 
          />

          {/* Bold stylized N */}
          <path 
            d="M 52,125 L 52,40 L 75,40 L 108,98 L 108,40 L 126,40 L 126,125 L 103,125 L 70,68 L 70,125 Z" 
            fill="url(#nkBlueGrad)" 
          />

          {/* Bold stylized K integrated */}
          <path 
            d="M 132,125 L 132,40 L 152,40 L 152,76 L 180,40 L 206,40 L 168,85 L 208,125 L 181,125 L 152,93 L 152,125 Z" 
            fill="url(#nkBlueGrad)" 
          />

          {/* SERVICE text in bold navy */}
          <text 
            x="120" 
            y="172" 
            textAnchor="middle" 
            fill="#0b3b60" 
            fontSize="26" 
            fontWeight="900" 
            fontFamily="'Outfit', sans-serif" 
            letterSpacing="5"
          >
            SERVICE
          </text>
        </svg>
      </div>
      {showSlogan && (
        <p className="text-[11px] sm:text-[12px] font-semibold text-[#0369a1] italic mt-0.5 tracking-tight text-center">
          “ເບິ່ງແຍງທຸກອຸປະກອນ ດ້ວຍໃຈບໍລິການ”
        </p>
      )}
    </div>
  );
};
