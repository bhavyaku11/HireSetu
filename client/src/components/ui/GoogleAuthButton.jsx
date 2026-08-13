import React, { useEffect, useRef, useState } from 'react';

/**
 * GoogleAuthButton
 *
 * Loads Google Identity Services, initializes the credential callback, and
 * renders a custom-styled "Continue with Google" button that fits our design
 * system in both light and dark mode.
 *
 * Props:
 *   onSuccess(credential: string) — called with the raw Google ID token string
 *   onError(message: string)      — called on verifiable failures only;
 *                                   a cancelled popup is silently ignored
 *   isLoading?: boolean           — disable button while a parent request runs
 */
export default function GoogleAuthButton({ onSuccess, onError, isLoading = false }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [gsiReady, setGsiReady] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const initialized = useRef(false);

  // Load the GSI script once, then initialize the credential flow.
  useEffect(() => {
    if (!clientId) {
      console.warn('[GoogleAuthButton] VITE_GOOGLE_CLIENT_ID is not set — Google button hidden.');
      return;
    }

    // If the script is already present (e.g. HMR remount), skip injection.
    if (document.getElementById('google-gsi-script')) {
      if (window.google?.accounts) {
        initializeGsi();
        setGsiReady(true);
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGsi();
      setGsiReady(true);
    };
    script.onerror = () => {
      console.error('[GoogleAuthButton] Failed to load GSI script.');
    };
    document.head.appendChild(script);
  }, [clientId]); // eslint-disable-line react-hooks/exhaustive-deps

  function initializeGsi() {
    if (initialized.current) return;
    initialized.current = true;

    window.google.accounts.id.initialize({
      client_id: clientId,
      // callback receives the credential response from the One Tap / popup
      callback: handleCredentialResponse,
      // Disable One Tap auto-prompt — we control when the popup appears
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: true,
    });
  }

  function handleCredentialResponse(response) {
    setIsPending(false);
    if (response?.credential) {
      onSuccess(response.credential);
    } else {
      // This fires if the popup closes without a credential (user cancelled).
      // We deliberately do NOT call onError here — a cancelled popup is not an
      // error the user needs to see.
    }
  }

  function handleClick() {
    if (!gsiReady || isPending || isLoading) return;
    setIsPending(true);
    // prompt() opens the Google One Tap / popup selector.
    // The notification callback fires when the user dismisses without selecting.
    window.google.accounts.id.prompt((notification) => {
      if (
        notification.isNotDisplayed() ||
        notification.isSkippedMoment() ||
        notification.isDismissedMoment()
      ) {
        // Popup was blocked or user closed it — reset loading state silently.
        setIsPending(false);
      }
    });
  }

  // Hide the button entirely if the env var is not configured.
  if (!clientId) return null;

  const busy = isPending || isLoading;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy || !gsiReady}
      aria-label="Continue with Google"
      className={[
        // Layout
        'w-full flex items-center justify-center gap-3',
        'px-4 py-2.5 rounded-xl',
        // Border & background — matches our Card/Input aesthetic
        'border border-slate-200 dark:border-slate-700',
        'bg-white dark:bg-slate-800',
        // Text
        'text-[13.5px] font-semibold text-slate-700 dark:text-slate-200',
        // Transitions
        'transition-all duration-150',
        // Hover (only when not busy)
        !busy && gsiReady
          ? 'hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-soft-sm cursor-pointer'
          : 'opacity-60 cursor-not-allowed',
        // Focus ring
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
      ].join(' ')}
    >
      {busy ? (
        /* Spinner while waiting for Google popup / backend */
        <svg
          className="w-4 h-4 animate-spin text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        /* Official Google "G" logo SVG — per Google brand guidelines */
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
          />
        </svg>
      )}
      <span>{busy ? 'Signing in…' : 'Continue with Google'}</span>
    </button>
  );
}
