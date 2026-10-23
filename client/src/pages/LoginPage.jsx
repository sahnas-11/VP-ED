import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Heart, Lock, Mail } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('vpe@sliitgavel.org');
  const [password, setPassword] = useState('Gavel@2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pastel-100 via-blush to-white dark:from-darkpink-bg dark:to-darkpink-card">
      <div className="w-full max-w-md bg-white dark:bg-darkpink-card rounded-super shadow-2xl border border-pastel-200 dark:border-darkpink-border p-8 animate-in fade-in zoom-in-95">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pastel-400 to-pastel-600 flex items-center justify-center text-white mx-auto shadow-cute mb-3">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-mauve-900 dark:text-pastel-100">
            SLIIT Gavel Club 🌸
          </h1>
          <p className="text-xs text-mauve-500 dark:text-mauve-200 mt-1 font-semibold">
            Vice President Education Portal
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold text-center border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-mauve-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-mauve-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-pastel-50 dark:bg-darkpink-hover text-[11px] text-mauve-600 dark:text-pastel-300 text-center">
            Demo Credentials: <span className="font-bold">vpe@sliitgavel.org</span> / <span className="font-bold">Gavel@2026</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-xs font-extrabold bg-pastel-500 hover:bg-pastel-600 text-white shadow-cute transition-all"
          >
            {loading ? 'Signing in...' : 'Sign In to VPE Portal ✨'}
          </button>
        </form>

        <p className="text-center text-[10px] text-mauve-400 mt-6 italic">
          #GAVELNEVERSTOPS
        </p>
      </div>
    </div>
  );
};
