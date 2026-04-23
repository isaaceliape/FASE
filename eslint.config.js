import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Global ignores - must be first
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'bin/**',
      'src/hooks/**', // JavaScript files not in TypeScript project
    ],
  },
  // TypeScript recommended config
  tseslint.configs.recommended,
  // Custom rules
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  // Special handling for install.ts which has @ts-nocheck (Phase 3 will address this)
  {
    files: ['src/install.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/ban-ts-comment': 'off', // Allow @ts-nocheck for now
    },
  }
);