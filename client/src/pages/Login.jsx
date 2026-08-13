import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import GoogleAuthButton from '../components/ui/GoogleAuthButton';
import logoMark from '../assets/logo-mark.png';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsSubmitting(true);
    const result = await login(formData.email.trim(), formData.password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setApiError(result.message);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setApiError('');
    const result = await loginWithGoogle(credential);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setApiError(result.message);
    }
  };

  const handleGoogleError = (message) => {
    setApiError(message);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[var(--void)] relative flex items-center justify-center p-4 font-body selection:bg-indigo-500/20 selection:text-indigo-400">
      {/* Background Dot Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#d4ccff_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Decorative Blur Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-300/20 dark:bg-[var(--signal)]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Auth Card */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to={user ? '/dashboard' : '/'} className="inline-flex items-center space-x-2.5 group">
            <img 
              src={logoMark} 
              alt="HireSetu" 
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" 
            />
            <span className="text-2xl font-extrabold font-display tracking-tight text-slate-900 dark:text-[var(--parchment)]">
              Hire<span className="text-indigo-500 dark:text-[var(--signal)]">Setu</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold font-display text-slate-900 dark:text-[var(--parchment)] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-500 dark:text-[var(--dust)]">
            Sign in to access your resumes and career tools
          </p>
        </div>

        <Card padding="p-8" className="bg-white border-slate-200/90 dark:border-[var(--border-glass)] dark:bg-[var(--ink)] shadow-soft-xl">
          {/* API Error Alert */}
          {apiError && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-700 text-xs font-medium flex items-center space-x-2 shadow-soft-xs">
              <span className="text-sm">⚠️</span>
              <span>{apiError}</span>
            </div>
          )}

          {/* Google Sign-In */}
          <GoogleAuthButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            isLoading={isSubmitting}
          />

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email Address"
              type="email"
              name="email"
              isRequired
              leftIcon={<span>✉️</span>}
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              isRequired
              leftIcon={<span>🔒</span>}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full shadow-soft-md"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-indigo-600 dark:text-[var(--signal)] hover:text-indigo-700 dark:hover:text-[var(--signal-hover)] font-semibold hover:underline"
            >
              Sign up
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
