import { useEffect, useState } from 'react';
// Importação da sua imagem personalizada
import bgImage from '../assets/Gemini-image.png';

// ✅ Exportação Nomeada (Obrigatório para o import com chavetas {} no App.jsx)
export function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 5000 milissegundos = 5 segundos exatos de espera
    const totalTime = 5000;
    const intervalTime = 50; 
    const steps = totalTime / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);
      
      // Ao atingir os 100%, paramos o relógio e avisamos o App.jsx
      if (currentStep >= steps) {
        clearInterval(timer);
        onFinish();           
      }
    }, intervalTime);

    // Limpeza da memória (Cleanup function)
    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      
      {/* Imagem de Fundo Dinâmica */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Película Escura para Legibilidade */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Conteúdo Frontal */}
      <div className="relative z-20 flex flex-col items-center mt-64 w-full max-w-md px-6">
        <h2 className="text-white text-xl font-bold tracking-wide mb-2 shadow-sm">
          Acedendo ao Sistema
        </h2>
        <p className="text-gray-300 text-sm font-medium mb-4">
          A preparar o seu ambiente de trabalho... {Math.round(progress)}%
        </p>
        
        {/* Barra de Progresso */}
        <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-md shadow-inner border border-white/10">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 transition-all duration-75 ease-linear shadow-[0_0_15px_rgba(168,85,247,0.7)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}