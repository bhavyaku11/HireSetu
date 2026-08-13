import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/ui/GoogleAuthButton';
import logoMark from '../assets/logo-mark.png';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await register(formData.name, formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setApiError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
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
    <div className="min-h-screen bg-slate-50 dark:bg-[var(--void)] flex items-center justify-center p-4 font-body selection:bg-indigo-500/20 selection:text-indigo-700 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-32 -left-32 w-[450px] h-[450px] rounded-full bg-indigo-200/20 dark:bg-indigo-700/40/20 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[450px] h-[450px] rounded-full bg-indigo-100/30 dark:bg-indigo-800/30/30 blur-[90px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to={user ? '/dashboard' : '/'} className="inline-flex items-center space-x-2.5 group">
            <img
              src={logoMark}
              alt="HireSetu Logo"
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <span className="text-2xl font-extrabold font-display tracking-tight text-slate-900 dark:text-[var(--parchment)]">
              Hire<span className="text-indigo-500 dark:text-[var(--signal)]">Setu</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold font-display text-slate-900 dark:text-[var(--parchment)] tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-[var(--dust)]">
            Start building AI-enhanced ATS resumes in seconds
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

          {/* Google Sign-Up */}
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
              label="Full Name"
              type="text"
              name="name"
              isRequired
              leftIcon={<span>👤</span>}
              value={formData.name}
              onChange={handleChange}
              placeholder="Alex Morgan"
              error={errors.name}
            />

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
              placeholder="At least 8 characters"
              error={errors.password}
              helperText="Password must be at least 8 characters long."
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              isRequired
              leftIcon={<span>🔒</span>}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              error={errors.confirmPassword}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full shadow-soft-md"
              >
                {isSubmitting ? 'Creating Account...' : 'Get Started Free'}
              </Button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-600 dark:text-[var(--signal)] hover:text-indigo-700 dark:hover:text-[var(--signal-hover)] font-semibold hover:underline"
            >
              Log in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
