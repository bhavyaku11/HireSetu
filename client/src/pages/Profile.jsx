import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Camera, User, Mail, Globe, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import Input, { TextArea } from '../components/ui/Input';
import Badge, { Pill } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import UserDropdown from '../components/ui/UserDropdown';
import logoMark from '../assets/logo-mark.png';

export default function Profile() {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    linkedin_url: user?.linkedin_url || '',
    github_url: user?.github_url || '',
    portfolio_url: user?.portfolio_url || '',
  });

  const [avatarUrl, setAvatarUrl] = useState(user?.profile_image_url || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [imgLoadError, setImgLoadError] = useState(false);

  const [saveStatus, setSaveStatus] = useState('All changes saved');
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);
  const saveTimerRef = useRef(null);

  // Sync formData if user object changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        linkedin_url: user.linkedin_url || '',
        github_url: user.github_url || '',
        portfolio_url: user.portfolio_url || '',
      });
      setAvatarUrl(user.profile_image_url || '');
    }
  }, [user]);

  // Client-side URL validator helper
  const validateUrl = (urlStr, fieldName) => {
    if (!urlStr || !urlStr.trim()) return '';
    const trimmed = urlStr.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return `Invalid URL format for ${fieldName}. Must start with http:// or https://`;
    }
    return '';
  };

  // API call to update profile
  const saveProfileToApi = useCallback(
    async (payload) => {
      setSaveStatus('Saving...');
      try {
        const response = await fetch('/api/auth/me', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          setSaveStatus('All changes saved');
          updateUser(data.user);
        } else {
          setSaveStatus('Failed to save');
        }
      } catch (err) {
        console.error('Failed to auto-save profile:', err);
        setSaveStatus('Failed to save');
      }
    },
    [token, updateUser]
  );

  // Handle input changes & trigger 1-sec debounced auto-save
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Enforce 200 char max on bio
    if (name === 'bio' && value.length > 200) return;

    const newFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(newFormData);

    // Validate URLs
    const newErrors = { ...errors };
    if (name === 'linkedin_url') newErrors.linkedin_url = validateUrl(value, 'LinkedIn URL');
    if (name === 'github_url') newErrors.github_url = validateUrl(value, 'GitHub URL');
    if (name === 'portfolio_url') newErrors.portfolio_url = validateUrl(value, 'Portfolio URL');
    if (name === 'name') newErrors.name = value.trim() ? '' : 'Name cannot be empty';

    setErrors(newErrors);

    // If there are validation errors, do not trigger auto-save
    const hasErr = Object.values(newErrors).some(Boolean);
    if (hasErr) {
      setSaveStatus('Failed to save');
      return;
    }

    setSaveStatus('Saving...');

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      saveProfileToApi({
        name: newFormData.name,
        bio: newFormData.bio,
        linkedin_url: newFormData.linkedin_url,
        github_url: newFormData.github_url,
        portfolio_url: newFormData.portfolio_url,
      });
    }, 1000);
  };

  // Avatar Upload Handler
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side file type check
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    // Client-side file size check (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('File size exceeds maximum limit of 2MB.');
      return;
    }

    setUploadingAvatar(true);
    setAvatarError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/auth/me/avatar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      const data = await response.json();

      if (response.ok) {
        setAvatarUrl(data.profile_image_url);
        setImgLoadError(false);
        updateUser({ profile_image_url: data.profile_image_url });
      } else {
        setAvatarError(data.message || 'Failed to upload profile photo');
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setAvatarError('Network error uploading profile photo');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Extract Initials
  const getInitials = (nameStr) => {
    if (!nameStr) return 'U';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  const initials = getInitials(formData.name || user?.name);

  return (
    <div className="min-h-screen bg-brand-canvas text-surface-900 flex flex-col font-body selection:bg-brand-500/20 selection:text-brand-700">
      {/* Navbar Header */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-surface-200/80 px-6 py-4 shadow-soft-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2.5 group">
            <img src={logoMark} alt="HireSetu Logo" className="w-9 h-9 object-contain group-hover:scale-105 transition-transform duration-200" />
            <span className="text-xl font-extrabold font-display tracking-tight text-surface-900">
              Hire<span className="text-brand-500">Setu</span>
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Dashboard
            </Button>
            <UserDropdown />
          </div>
        </div>
      </header>

      {/* Main Profile Body */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-10 space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold font-display text-surface-900 tracking-tight">Account Settings & Profile</h1>
            <p className="text-xs text-surface-500 mt-1">Manage your public profile details, social links, and avatar image.</p>
          </div>

          {/* Auto-Save Indicator */}
          <div>
            {saveStatus === 'Saving...' && <Badge variant="warning" size="md" dot>Saving...</Badge>}
            {saveStatus === 'All changes saved' && <Badge variant="success" size="md" dot>All changes saved</Badge>}
            {saveStatus === 'Failed to save' && (
              <Badge variant="danger" size="md" dot>
                Failed to save
              </Badge>
            )}
          </div>
        </div>

        {/* Profile Card Container */}
        <Card padding="p-8" className="bg-white border-surface-200 shadow-soft-lg space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-surface-200/80 pb-8">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-brand-500/30 shadow-soft-md bg-brand-500 text-white font-display font-extrabold text-2xl flex items-center justify-center relative">
                {avatarUrl && !imgLoadError ? (
                  <img src={avatarUrl} alt="Profile Avatar" className="w-full h-full object-cover" onError={() => setImgLoadError(true)} />
                ) : (
                  <span>{initials}</span>
                )}

                {/* Hover overlay button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 bg-surface-900/60 backdrop-blur-[1px] text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold gap-1"
                >
                  <Camera className="w-5 h-5" />
                  <span>Change</span>
                </button>
              </div>

              {uploadingAvatar && (
                <div className="absolute inset-0 bg-white/85 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-2">
                <h3 className="text-lg font-bold font-display text-surface-900">{formData.name || 'HireSetu User'}</h3>
                <Pill variant="brand" size="sm">Member</Pill>
              </div>
              <p className="text-xs text-surface-500">Upload a square JPEG, PNG, or WebP profile image (max 2MB).</p>
              
              <div className="pt-1">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} isLoading={uploadingAvatar} leftIcon={<Camera className="w-3.5 h-3.5" />}>
                  {uploadingAvatar ? 'Uploading photo...' : 'Change Photo'}
                </Button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarFileChange} className="hidden" />
              </div>

              {avatarError && <p className="text-xs font-semibold text-rose-600 animate-fadeIn">{avatarError}</p>}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                isRequired
                placeholder="Jane Doe"
                error={errors.name}
              />

              <Input
                label="Email Address"
                name="email"
                value={formData.email}
                isDisabled
                readOnly
                helperText="Email address cannot be changed"
              />
            </div>

            {/* Short Bio */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-surface-700 font-display">Short Bio</label>
                <span className={`text-[11px] font-semibold ${formData.bio.length >= 190 ? 'text-amber-600 font-bold' : 'text-surface-400'}`}>
                  {formData.bio.length}/200
                </span>
              </div>
              <TextArea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Brief professional summary, role, or background highlights (max 200 characters)..."
                helperText="Appears on your profile context and exported resume headers."
              />
            </div>

            {/* Social Links Divider */}
            <div className="border-t border-surface-200/80 pt-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-surface-500 font-display">Social & Portfolio Links</h4>
                <p className="text-xs text-surface-400 mt-0.5">Include your professional profiles for ATS analysis and recruiter verification.</p>
              </div>

              <div className="space-y-4">
                <Input
                  label="LinkedIn Profile URL"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourname"
                  error={errors.linkedin_url}
                />

                <Input
                  label="GitHub Profile URL"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  placeholder="https://github.com/yourname"
                  error={errors.github_url}
                />

                <Input
                  label="Portfolio / Personal Website"
                  name="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.dev"
                  error={errors.portfolio_url}
                />
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
