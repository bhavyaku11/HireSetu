import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
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

  const { register, user } = useAuth();
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

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4 font-body selection:bg-brand-500/20 selection:text-brand-700 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-32 -left-32 w-[450px] h-[450px] rounded-full bg-brand-200/20 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[450px] h-[450px] rounded-full bg-brand-100/30 blur-[90px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to={user ? '/dashboard' : '/'} className="inline-flex items-center space-x-2.5 group">
            <img
              src={logoMark}
              alt="HireSetu Logo"
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-200"
            />
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
