// Central API Base URL Configuration
// In production, this will use VITE_API_URL if set, or fall back to empty string (which uses vercel.json rewrite proxy).
const rawApiUrl = import.meta.env.VITE_API_URL || '';
// Strip trailing slash if present
export const API_BASE = rawApiUrl.replace(/\/$/, '');
