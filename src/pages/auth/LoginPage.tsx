import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatApiErrorMessage } from '../../services/apiClient';
import heroImage from '../../assets/images/campus_ops_hero_1791972571268.jpg';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, role } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If a valid session already exists, immediately redirect to correct role dashboard
  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === 'admin') navigate('/admin', { replace: true });
      else if (role === 'staff') navigate('/staff', { replace: true });
      else if (role === 'student') navigate('/student', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Please provide both your university email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const profile = await login({ email: cleanEmail, password });
      success('Welcome back!', `Signed in as ${profile.full_name || profile.email}`);

      const userRole = (profile.role || '').toLowerCase();
      if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else if (userRole === 'staff') {
        navigate('/staff', { replace: true });
      } else if (userRole === 'student') {
        navigate('/student', { replace: true });
      } else {
        throw new Error(`Unrecognized user role received from database: ${profile.role}`);
      }
    } catch (err: any) {
      const msg = formatApiErrorMessage(err);
      setErrorMessage(msg);
      error('Sign in failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D1B] flex flex-col justify-center selection:bg-cyan-500/20 selection:text-cyan-300">
      <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden bg-[#10182B] border border-white/10 shadow-2xl">
          {/* Left Column: Form */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between">
            <div>
              {/* Header */}
              <Link to="/" className="inline-flex items-center gap-2.5 mb-8 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center p-0.5">
                  <div className="w-full h-full bg-[#080D1B] rounded-[6px] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <span className="text-base font-bold tracking-tight text-[#F1F5F9]">
                  CampusResolve <span className="text-cyan-400">AI</span>
                </span>
              </Link>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
                Sign in to your account
              </h1>
              <p className="text-xs sm:text-sm text-[#A7B4CC] mt-2">
                Enter your university credentials to access real-time complaint tracking and operations.
              </p>

              {errorMessage && (
                <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div className="leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#A7B4CC] mb-1.5" htmlFor="email">
                    University Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#A7B4CC] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@university.edu"
                      className="w-full bg-[#151F35] border border-white/10 rounded-xl px-10 py-2.5 text-xs sm:text-sm text-[#F1F5F9] placeholder:text-[#A7B4CC]/40 focus:outline-hidden focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-[#A7B4CC]" htmlFor="password">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A7B4CC] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#151F35] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#F1F5F9] placeholder:text-[#A7B4CC]/40 focus:outline-hidden focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A7B4CC] hover:text-[#F1F5F9] transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#22D3EE] hover:bg-[#67e8f9] text-[#080D1B] font-semibold text-xs sm:text-sm transition-all shadow-md shadow-cyan-500/20 inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-[#080D1B] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-[#A7B4CC]">
                  New to CampusResolve?{' '}
                  <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium">
                    Register as Student
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-[11px] text-[#A7B4CC] text-center">
                Role authorization is determined strictly by the central university database.
              </p>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-6 relative hidden lg:flex flex-col justify-between p-12 bg-[#151F35] overflow-hidden">
            <img
              src={heroImage}
              alt="Campus Operations"
              className="absolute inset-0 w-full h-full object-cover opacity-35"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#10182B] via-[#10182B]/60 to-transparent" />

            <div className="relative z-10 space-y-4">
              <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-400">
                Agentic Architecture
              </span>
              <h2 className="text-2xl font-bold text-[#F1F5F9] leading-snug">
                Transparent Resolution Infrastructure
              </h2>
              <p className="text-xs text-[#A7B4CC] leading-relaxed max-w-sm">
                Real-time connection to backend API at <code className="text-cyan-300">university-complain-system.vercel.app</code>. Role-based authorization enforced on every endpoint.
              </p>
            </div>

            <div className="relative z-10 p-5 rounded-2xl bg-[#080D1B]/80 backdrop-blur-md border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A7B4CC]">API Status</span>
                <span className="text-emerald-400 font-semibold">Live Production</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A7B4CC]">Follow-up Agent</span>
                <span className="text-cyan-400 font-semibold">n8n Connected</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A7B4CC]">Human Approvals</span>
                <span className="text-violet-400 font-semibold">Enforced</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
