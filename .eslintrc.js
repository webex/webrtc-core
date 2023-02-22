module.exports = {
  env: {
    browser: true,
    es2021: true,
    'jest/globals': true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'plugin:jest/all',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsdoc/recommended',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
  ],
  ignorePatterns: ['dist/**/*.*', 'docs/**/*.*'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'jest', 'jsdoc', 'prettier'],
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        ts: 'never',
      },
    ],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'import/prefer-default-export': 0,
    'jest/no-hooks': [
      'error',
      {
        allow: ['afterAll', 'afterEach', 'beforeAll', 'beforeEach'],
      },
    ],
    'jest/lowercase-name': 0,
    'jest/prefer-lowercase-title': 0,
    'jest/require-hook': 0,
    'jsdoc/check-tag-names': [
      1,
      {
        definedTags: [
          'alpha',
          'beta',
          'defaultValue',
          'deprecated',
          'eventProperty',
          'example',
          'inheritDoc',
          'internal',
          'link',
          'override',
          'packageDocumentation',
          'param',
          'preapproved',
          'preivateRemarks',
          'public',
          'readonly',
          'remarks',
          'returns',
          'sealed',
          'typeParam',
          'virtual',
        ],
      },
    ],
    'jsdoc/no-types': 1,
    'jsdoc/no-undefined-types': 0,
    'jsdoc/require-description': 1,
    'jsdoc/require-description-complete-sentence': 1,
    'jsdoc/require-hyphen-before-param-description': 1,
    'jsdoc/require-jsdoc': [
      2,
      {
        require: {
          ArrowFunctionExpression: true,
          ClassDeclaration: true,
          ClassExpression: true,
          FunctionDeclaration: true,
          FunctionExpression: true,
          MethodDefinition: true,
        },
      },
    ],
    'jsdoc/require-param-type': 0,
    'jsdoc/require-returns-type': 0,
    'jsdoc/valid-types': 1,
    'no-underscore-dangle': 0,
    'no-shadow': 0,
    '@typescript-eslint/no-shadow': ['error'],
  },
  overrides: [
    {
      files: ['samples/**/*.jsx', 'samples/**/*.[tj]s'],
      rules: {
        'jsdoc/require-description': 0,
        '@typescript-eslint/no-shadow': 0,
        'jsdoc/require-jsdoc': 0,
        'react/display-name': 0,
        'react/prop-types': 0,
        'react/react-in-jsx-scope': 0,
      },
    },
    {
      files: ['**/*.spec.ts'],
      rules: {
        'jsdoc/require-description': 0,
        '@typescript-eslint/no-shadow': 0,
        'jsdoc/require-jsdoc': 0,
        'react/display-name': 0,
        'react/prop-types': 0,
        'react/react-in-jsx-scope': 0,
      },
    },
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.js', '.ts'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
        paths: ['src'],
      },
    },
  },
};
