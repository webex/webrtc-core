import { terser } from 'rollup-plugin-terser';

export default {
  input: 'dist/index.js',
  output: [
    {
      format: 'umd',
      file: 'build/bundle.js',
      indent: '\t',
      name: 'Build',
    },
    {
      format: 'umd',
      file: 'build/bundle.min.js',
      name: 'Build',
      plugins: [
        terser(),
      ],
      sourcemap: true,
    },
  ],
  watch: {
    include: './dist/**/*.js',
  },
};