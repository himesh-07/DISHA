import React, { useState } from 'react';
import { DishaLogo } from './DishaLogo';
import { ShieldAlert, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBackToLanding,
}) => {
  const [email, setEmail] = useState('authority.officer@ndma.gov.in');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess();
  };

  const handleDemoLogin = () => {
    setEmail('command.incharge@cg.gov.in');
    setPassword('DishaAdmin2026!');
    setTimeout(() => {
      onLoginSuccess();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 font-sans text-slate-100">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 text-slate-900 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <DishaLogo size="lg" showSubtitle={false} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            DISHA Authority Access
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Disaster Intelligence & Relocation Assistant — Operational Sign-In
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Authorized Official Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Command Access Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In to Disaster Command</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Authority Login (Section 41) */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">
            Development & Presentation Mode:
          </div>
          <button
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>1-Click Demo Authority Sign-In</span>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={onBackToLanding}
            className="text-[11px] text-slate-400 hover:underline cursor-pointer"
          >
            ← Return to Public Homepage
          </button>
        </div>
      </div>
    </div>
  );
};
