// Central API Base URL Configuration
// In production on Vercel, requests route through the vercel.json rewrite proxy ('')
// to prevent cross-origin issues and eliminate stale domain dependencies.
const envUrl = (import.meta.env.VITE_API_URL || '').trim();
// Ignore deprecated Railway domain if still configured in Vercel environment variables
const rawApiUrl = envUrl.includes('railway') ? '' : envUrl;

// Strip trailing slash if present
export const API_BASE = rawApiUrl.replace(/\/$/, '');

