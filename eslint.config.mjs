import js from '@eslint/js';

const commonNodeGlobals = {
  require: 'readonly',
  module: 'readonly',
  __dirname: 'readonly',
  process: 'readonly',
  console: 'readonly'
};

export default [
  js.configs.recommended,
  {
    files: ['app/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...commonNodeGlobals,
        fetch: 'readonly'
      }
    }
  },
  {
    files: ['k6/**/*.js'],
    languageOptions: {
      globals: {
        __ENV: 'readonly',
        console: 'readonly'
      }
    }
  }
];
