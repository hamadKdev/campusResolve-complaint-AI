import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatApiErrorMessage } from '../../services/apiClient';
import heroImage from '../../assets/images/campus_ops_hero_1791972571268.jpg';
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (fullName.trim().length < 2) {
      setErrorMessage('Full name must be at least 2 characters long.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });

      success('Registration Successful', 'Account created! Please sign in with your email and password.');
      navigate('/login');
    } catch (err: any) {
      const msg = formatApiErrorMessage(err);
      setErrorMessage(msg);
      error('Registration failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D1B] flex flex-col justify-center selection:bg-cyan-500/20 selection:text-cyan-300">
      <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden bg-[#10182B] border border-white/10 shadow-2xl">
          {/* Left Column: Signup Form */}
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
                Create Student Account
              </h1>
              <p className="text-xs sm:text-sm text-[#A7B4CC] mt-2">
                Register to submit grievances, receive real-time updates, and monitor university resolution progress.
              </p>

              {errorMessage && (
                <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div className="leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#A7B4CC] mb-1.5" htmlFor="fullName">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#A7B4CC] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="fullName"
                      type="text"
                      required
                      minLength={2}
                      maxLength={100}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-[#151F35] border border-white/10 rounded-xl px-10 py-2.5 text-xs sm:text-sm text-[#F1F5F9] placeholder:text-[#A7B4CC]/40 focus:outline-hidden focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                    />
                  </div>
                </div>

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
                  <label className="block text-xs font-medium text-[#A7B4CC] mb-1.5" htmlFor="password">
                    Password (min 8 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A7B4CC] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      maxLength={128}
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

                <div>
                  <label className="block text-xs font-medium text-[#A7B4CC] mb-1.5" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A7B4CC] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#151F35] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#F1F5F9] placeholder:text-[#A7B4CC]/40 focus:outline-hidden focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                    />
                  </div>
                </div>

                {/* Default Student Role notice */}
                <div className="p-3 rounded-xl bg-[#151F35] border border-white/5 flex items-center gap-2.5 text-xs text-[#A7B4CC]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    New public registrations receive the <strong className="text-emerald-400">Student</strong> role by default. Staff/Admin roles are assigned by campus administration.
                  </span>
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
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-[#A7B4CC]">
                  Already have an account?{' '}
                  <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
                    Sign In
                  </Link>
                </p>
              </div>
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
                Student Empowerment
              </span>
              <h2 className="text-2xl font-bold text-[#F1F5F9] leading-snug">
                Transparent Resolution at Every Step
              </h2>
              <p className="text-xs text-[#A7B4CC] leading-relaxed max-w-sm">
                Track every stage from automated AI triage to department assignment and field resolution.
              </p>
            </div>

            <div className="relative z-10 p-5 rounded-2xl bg-[#080D1B]/80 backdrop-blur-md border border-white/10 space-y-2">
              <div className="text-xs font-semibold text-[#F1F5F9]">Student Privileges</div>
              <ul className="text-xs text-[#A7B4CC] space-y-1 list-disc list-inside">
                <li>Submit issues with photos and locations</li>
                <li>Live timeline updates from assigned departments</li>
                <li>Cancellation rights for eligible pending tickets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
