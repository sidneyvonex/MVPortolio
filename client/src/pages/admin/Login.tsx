import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Terminal, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authApi } from '../../services/adminApi';
import { setToken, isAuthenticated } from '../../lib/auth';
import { useAdminHead } from '../../hooks/useAdminHead';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useAdminHead('Admin Login — CodeSidney');

  useEffect(() => {
    if (isAuthenticated()) navigate({ to: '/admin/dashboard' });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await authApi.login(email, password);
      setToken(token);
      navigate({ to: '/admin/dashboard' });
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg, #1A56FF 0%, #0D2DB4 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-10 right-20 w-72 h-72 bg-[#FFD600] rounded-full opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-56 h-56 bg-white rounded-full opacity-5 blur-3xl pointer-events-none" />

      {/* Left panel — branding (hidden on small screens) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Terminal size={20} className="text-white" />
          </div>
          <span className="font-heading font-bold text-white text-lg tracking-tight">
            Code<span className="text-[#FFD600]">Sidney</span>
          </span>
        </div>

        <div className="flex flex-col gap-6">
          <h1 className="font-heading font-extrabold text-white leading-tight"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}>
            Manage your<br />
            <span className="text-[#FFD600]">portfolio</span> with ease.
          </h1>
          <p className="font-body text-white/60 text-base max-w-xs leading-relaxed">
            Add projects, update skills, upload your resume, and respond to messages — all in one place.
          </p>
          <div className="flex gap-4">
            {['Projects', 'Skills', 'Messages', 'Settings'].map(label => (
              <span key={label} className="px-3 py-1.5 rounded-full bg-white/10 text-white/70 font-body text-xs border border-white/15">
                {label}
              </span>
            ))}
          </div>
        </div>

        <p className="font-body text-white/30 text-xs">
          © {new Date().getFullYear()} CodeSidney Portfolio
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-black/20 p-8 lg:p-10">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-[#1A56FF] rounded-xl flex items-center justify-center">
              <Terminal size={18} className="text-white" />
            </div>
            <span className="font-heading font-bold text-[#0A0A0F] text-base tracking-tight">
              Code<span className="text-[#1A56FF]">Sidney</span>
            </span>
          </div>

          <h2 className="font-heading font-bold text-[#0A0A0F] text-2xl mb-1">Welcome back</h2>
          <p className="font-body text-[#8892A4] text-sm mb-8">Sign in to your admin dashboard</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <span className="font-body text-red-600 text-xs">{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-[#0A0A0F]/70 uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8892A4]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-[#F4F6FF] border border-[#E6EAF4] rounded-xl pl-9 pr-4 py-3
                             font-body text-sm text-[#0A0A0F] placeholder-[#C4CBDA] outline-none
                             focus:border-[#1A56FF] focus:ring-2 focus:ring-[#1A56FF]/10 transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-[#0A0A0F]/70 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8892A4]" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F4F6FF] border border-[#E6EAF4] rounded-xl pl-9 pr-10 py-3
                             font-body text-sm text-[#0A0A0F] placeholder-[#C4CBDA] outline-none
                             focus:border-[#1A56FF] focus:ring-2 focus:ring-[#1A56FF]/10 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8892A4] hover:text-[#0A0A0F] transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A56FF] hover:bg-[#0D2DB4] disabled:opacity-50
                         text-white font-body font-semibold text-sm py-3.5 rounded-xl
                         shadow-lg shadow-[#1A56FF]/30 transition-all mt-1"
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <a
            href="/"
            className="block text-center mt-6 font-body text-xs text-[#8892A4] hover:text-[#1A56FF] transition-colors"
          >
            ← Back to portfolio
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

