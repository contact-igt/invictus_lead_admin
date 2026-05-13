import React from 'react';
import useColorMode from 'hooks/useColorMode';

const PageHeader: React.FC<{ subtitle?: string }> = ({ subtitle }) => {
  const { mode } = useColorMode();
  
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        mode === 'dark' ? 'bg-[#DCFCE7]' : 'bg-green-100'
      }`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 4v16" stroke="#16A34A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div>
        <h1 className={`text-2xl font-extrabold leading-tight ${
          mode === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Overview</h1>
        {subtitle && <div className={`text-sm ${
          mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-600'
        }`}>{subtitle}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
