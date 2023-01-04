module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    'footer-max-line-length': [2, 'always', Infinity],
    'body-max-line-length': [2, 'always', Infinity],
  },
};
