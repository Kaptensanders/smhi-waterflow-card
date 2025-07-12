import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/card.ts',                  // Entry point
  output: {
    file: 'dist/waterflow-card.js',      // Final output bundle
    format: 'es',                         // ES module for HA compatibility
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json'
    }),
    terser() // Minifies for production
  ]
};
