import type { SocialAuthProvider } from '../auth/supabase';

type SocialAuthProviderIconProps = {
  provider: SocialAuthProvider['id'];
};

export const SocialAuthProviderIcon = ({
  provider,
}: SocialAuthProviderIconProps) => {
  if (provider === 'google') {
    return (
      <svg
        aria-hidden="true"
        className="auth-panel__provider-icon"
        data-provider-icon={provider}
        focusable="false"
        viewBox="0 0 24 24"
      >
        <path
          d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.15c1.84-1.7 2.9-4.2 2.9-7.42Z"
          fill="#4285F4"
        />
        <path
          d="M12 21.99c2.62 0 4.82-.87 6.43-2.35l-3.15-2.45c-.87.58-1.98.92-3.28.92-2.53 0-4.67-1.71-5.44-4.01H3.3v2.53A9.72 9.72 0 0 0 12 21.99Z"
          fill="#34A853"
        />
        <path
          d="M6.56 14.1a5.85 5.85 0 0 1 0-3.76V7.81H3.3a9.98 9.98 0 0 0 0 8.82l3.26-2.53Z"
          fill="#FBBC05"
        />
        <path
          d="M12 6.33c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.81 3.41 14.62 2.5 12 2.5a9.72 9.72 0 0 0-8.7 5.31l3.26 2.53C7.33 8.04 9.47 6.33 12 6.33Z"
          fill="#EA4335"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="auth-panel__provider-icon"
      data-provider-icon={provider}
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path
        d="M17.05 12.98c.02 2.17 1.9 2.89 1.92 2.9-.02.05-.3 1.03-1 2.05-.6.88-1.23 1.76-2.22 1.78-.97.02-1.29-.57-2.41-.57-1.12 0-1.48.55-2.4.59-.96.04-1.69-.95-2.3-1.83-1.25-1.8-2.2-5.09-.92-7.31.63-1.1 1.76-1.8 2.98-1.82.93-.02 1.8.63 2.4.63.6 0 1.7-.78 2.87-.67.49.02 1.86.2 2.74 1.49-.07.04-1.64.96-1.66 2.86ZM15.07 5.47c.51-.62.85-1.48.76-2.34-.74.03-1.63.49-2.16 1.11-.47.54-.88 1.42-.77 2.25.82.06 1.66-.41 2.17-1.02Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default SocialAuthProviderIcon;
