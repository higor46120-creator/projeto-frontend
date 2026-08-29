// src/shared/components/SplashScreen.js
import { useState, useEffect } from 'react';

export const SplashScreen = ({ logoSrc, title = 'Meu App', duration = 2500, onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFinish]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 transition-opacity duration-500">
      <div className="flex flex-col items-center gap-4 animate-slideDown">
        <img
          src={logoSrc}
          alt="Logo"
          className="w-100 h-300 object-contain drop-shadow-lg opacity-50"
        />
        {title && (
          <h1 className="text-2xl font-bold text-white tracking-wide">
            {title}
          </h1>
        )}
      </div>
    </div>
  );
};