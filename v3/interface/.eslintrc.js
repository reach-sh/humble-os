module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:cypress/recommended',
    'plugin:react/recommended',
    'airbnb',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  ignorePatterns: ['docs/**/*'],
  plugins: ['react', '@typescript-eslint', 'prettier'],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-nested-ternary': 'off',
    'react/jsx-props-no-spreading': 'off',
    'jsx-a11y/alt-text': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'react/no-array-index-key': 'off',
    'max-len': ['error', { code: 140 }],
    'react/require-default-props': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'linebreak-style': ['error', 'unix'],
    'jsx-quotes': ['error', 'prefer-single'],
    'no-constant-condition': 'off',
    quotes: ['error', 'single'],
    semi: [2, 'never'],
    'no-unused-vars': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['warn'],
    '@typescript-eslint/no-unused-vars': ['warn'],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        tsx: 'never',
      },
    ],
    'prettier/prettier': [
      'error',
      {
        semi: false,
        trailingComma: 'all',
        singleQuote: true,
        jsxSingleQuote: true,
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  globals: {
    JSX: true,
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
}
