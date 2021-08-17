import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

// `yarn build` -> `production` is true
// `yarn dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

const plugins = [
  typescript({ useTsconfigDeclarationDir: true }),
  nodePolyfills({ include: ['events'] }),
  nodeResolve({ browser: true, extensions: ['.js', '.ts'] }),
  commonjs(),
];

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        format: 'esm',
        file: pkg.module,
      },
    ],
    plugins,
    watch: {
      include: 'src/**',
    },
  },
  // NOTE: Currently only building ES module when running `yarn dev` to speed up re-builds.
  {
    input: 'src/index.ts',
    output: [
      {
        format: 'cjs',
        file: pkg.main,
      },
      {
        format: 'umd',
        file: pkg.browser,
        indent: '\t',
        name: 'Build',
        sourcemap: !production,
      },
      {
        format: 'umd',
        file: pkg.browser.replace('.js', '.min.js'),
        indent: '\t',
        name: 'Build',
        sourcemap: !production,
        plugins: [terser()],
      },
    ],
    plugins,
    watch: false,
  },
];
