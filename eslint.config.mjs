import js from '@eslint/js';
import cypress from 'eslint-plugin-cypress';

export default [
  js.configs.recommended,
  {
    files: ['cypress/**/*.ts'],
    plugins: { cypress },
    languageOptions: {
      globals: {
        cy: 'readonly',
        Cypress: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        expect: 'readonly'
      }
    },
    rules: {
      'no-console': 'off'
    }
  }
];
