import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      '.vercel/',
      'dist/',
      'dist-server/',
      'coverage/',
      'node_modules/',
      'public/sw.js',
      'public/workbox-*.js',
      'server/generated/',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];
