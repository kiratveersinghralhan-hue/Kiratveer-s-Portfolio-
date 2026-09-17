import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/**', 'dist/**', 'legacy/**', 'public/**', 'work/**', 'test-results/**'] },
  {
    ...js.configs.recommended,
    files: ['src/**/*.js', 'scripts/**/*.mjs', 'tests/**/*.mjs', '*.config.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
    },
  },
  { files: ['src/**/*.js'], languageOptions: { globals: globals.browser } },
  { files: ['scripts/**/*.mjs', '*.config.js'], languageOptions: { globals: globals.node } },
  { files: ['tests/**/*.mjs'], languageOptions: { globals: { ...globals.node, ...globals.browser } } },
];
