import React from 'react';

export const PageBackdrop = ({ children }) => {
  return <div className="min-h-screen bg-[#050505] text-white">{children}</div>;
};

export default PageBackdrop;