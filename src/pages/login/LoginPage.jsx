
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginFormComponent from './components/LoginFormComponent';
import RegisterFormComponent from './components/RegisterFormComponent';

const LoginPage = () => {
    const navigator = useNavigate()
    const [isLogin, setIsLogin] = useState(true);

  const goToHome = () => {
    navigator("/home")
  }
  return (
    <div>
         <h1 className="text-3xl font-bold text-gray-800">
          Aplicação Carregada
        </h1>
        {isLogin ? 
        <LoginFormComponent /> :
        <RegisterFormComponent /> 

        
        }
        <button
  type="button"
  onClick={() => setIsLogin(isLogin => !isLogin)}
  className="w-full mt-3 py-2.5 px-4 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg text-sm border border-indigo-200 dark:border-indigo-900/50 transition-all duration-200 shadow-sm focus:ring-4 focus:ring-indigo-600/10 active:bg-slate-200 dark:active:bg-slate-700 flex items-center justify-center gap-2 group"
>
  <span>Ir para {isLogin ? "Cadastro": "Login"}</span>
  {/* Ícone de seta com efeito de hover (desliza para a direita ao passar o mouse) */}
  <svg 
    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
</button>
    </div>
  )
}


export default LoginPage