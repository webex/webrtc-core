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
    'import/prefer-default-export': 0,
    'jest/no-hooks': [
      'error',
      {
        allow: ['afterAll', 'afterEach', 'beforeAll', 'beforeEach'],
      },
    ],
    'jest/lowercase-name': 0,
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
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
  },
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
