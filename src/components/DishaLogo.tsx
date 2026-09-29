import React from 'react';

interface DishaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  lightMode?: boolean;
}

export const DishaLogo: React.FC<DishaLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  lightMode = false,
}) => {
  const iconSize = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  }[size];

  const titleSize = {
    sm: 'text-base font-extrabold tracking-tight',
    md: 'text-xl font-black tracking-tight',
    lg: 'text-2xl font-black tracking-tight',
    xl: 'text-3xl font-black tracking-tight',
  }[size];

  return (
    <div className="flex items-center gap-3">
      {/* Visual Logo: Shield + Location Pin + Evacuation Route + Alert Flare */}
      <div className={`relative ${iconSize} flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-900 shadow-md shadow-emerald-950/20 text-white`}>
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5" stroke="currentColor">
          {/* Shield Outline */}
          <path
            d="M24 4L8 10V22C8 33 24 42 24 42C24 42 40 33 40 22V10L24 4Z"
            className="text-emerald-400 stroke-[2.5]"
            fill="rgba(16, 185, 129, 0.2)"
            strokeLinejoin="round"
          />
          {/* Location Pin */}
          <path
            d="M24 12C20.686 12 18 14.686 18 18C18 22.5 24 28 24 28C24 28 30 22.5 30 18C30 14.686 27.314 12 24 12Z"
            fill="#eab308"
            className="text-amber-400"
          />
          {/* Evacuation Route Path */}
          <path
            d="M17 32C19 30 22 34 26 31C29 29 31 33 34 32"
            stroke="#f87171"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="2 2"
          />
          {/* Disaster Warning Center Core */}
          <circle cx="24" cy="18" r="2" fill="#dc2626" />
        </svg>
      </div>

      <div className="leading-tight">
        <div className="flex items-center gap-2">
          <span className={`${titleSize} font-sans ${lightMode ? 'text-white' : 'text-slate-900'}`}>
            DISHA
          </span>
          
        </div>
        
      </div>
    </div>
  );
};
