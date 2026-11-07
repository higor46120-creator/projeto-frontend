import React from 'react';

export const TopBar = ({ title }) => {
  return (
    <header className="w-full p-4 bg-[#111] text-white border-b border-gray-800 flex justify-between items-center">
      <h1 className="text-xl font-bold">{title || 'HelpTec'}</h1>
    </header>
  );
};

export default TopBar;