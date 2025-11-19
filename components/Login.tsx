import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, User as UserIcon, UserPlus } from 'lucide-react';
import { loginUser, registerUser } from '../services/storageService';

interface LoginProps {
  onLogin: (user: { email: string; name: string; id: string }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || (isRegistering && !name)) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    // Simula delay de rede
    setTimeout(() => {
      if (isRegistering) {
        // Register Flow
        const result = registerUser({ email, password, name });
        setIsLoading(false);
        if (result.success && result.user) {
          onLogin(result.user);
        } else {
          setError(result.message || 'Erro ao criar conta.');
        }
      } else {
        // Login Flow
        const result = loginUser(email, password);
        setIsLoading(false);
        if (result.success && result.user) {
          onLogin(result.user);
        } else {
          setError(result.message || 'Erro ao entrar.');
        }
      }
    }, 1000);
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Header Visual */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-2xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-2xl opacity-10 translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 flex justify-center mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white shadow-lg ring-1 ring-white/30">
              <ShieldCheck size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white relative z-10">
            {isRegistering ? 'Crie sua conta' : 'Bem-vindo de volta'}
          </h2>
          <p className="text-brand-100 text-sm mt-1 relative z-10">
            {isRegistering ? 'Comece a organizar seus processos hoje' : 'Acesse seus processos e documentos'}
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            {isRegistering && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2">
                <label className="text-sm font-medium text-slate-700 ml-1">Nome Completo</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                    <UserIcon size={20} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">E-mail Corporativo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isRegistering && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <input id="remember-me" type="checkbox" className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-slate-500">Lembrar de mim</label>
                </div>
                <button type="button" className="text-brand-600 hover:text-brand-700 font-medium">Esqueceu a senha?</button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <span>{isRegistering ? 'Criar Conta' : 'Acessar Plataforma'}</span>
                  {isRegistering ? <UserPlus size={18} /> : <ArrowRight size={18} />}
                </>
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                {isRegistering ? 'Já tem uma conta?' : 'Não tem uma conta?'}
                <button 
                  type="button"
                  onClick={toggleMode}
                  className="ml-1 font-bold text-brand-600 hover:text-brand-800 transition-colors"
                >
                  {isRegistering ? 'Fazer Login' : 'Cadastre-se'}
                </button>
              </p>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-xs text-slate-400">
              ProcessFlow &copy; 2024 • Protegido por criptografia local.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};