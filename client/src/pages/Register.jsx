import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, user } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
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
    const result = await register(formData.name.trim(), formData.email.trim(), formData.password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setApiError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-brand-canvas relative flex items-center justify-center p-4 font-body selection:bg-brand-500/20 selection:text-brand-700">
      {/* Background Dot Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#d4ccff_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Decorative Blur Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Auth Card */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to={user ? '/dashboard' : '/'} className="inline-flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-extrabold font-display text-xl shadow-soft-sm group-hover:scale-105 transition-transform">
              H
            </div>
            <span className="text-2xl font-extrabold font-display tracking-tight text-surface-900">
              Hire<span className="text-brand-500">Setu</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold font-display text-surface-900 tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-surface-500">
            Start building AI-enhanced ATS resumes in seconds
          </p>
        </div>

        <Card padding="p-8" className="bg-white border-surface-200/90 shadow-soft-xl">
          {/* API Error Alert */}
          {apiError && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-700 text-xs font-medium flex items-center space-x-2 shadow-soft-xs">
              <span className="text-sm">⚠️</span>
              <span>{apiError}</span>
            </div>
          )}

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
          <div className="mt-6 pt-5 border-t border-surface-100 text-center text-xs text-surface-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-brand-600 hover:text-brand-700 font-semibold hover:underline"
            >
              Log in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
