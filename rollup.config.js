import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';

/**
 * Determine if we're in production mode
 */
const isProd = process.env.NODE_ENV === 'production';

/**
 * No external dependencies - bundle everything
 * This approach is similar to other working custom cards like button-card
 */
const external = [];

/**
 * Rollup configuration
 */
export default {
  input: 'src/card.ts',
  output: {
    file: 'dist/smhi-waterflow-card.js',
    format: 'es',                // ES module for HA compatibility
    sourcemap: !isProd,          // Source maps only in development
  },
  external,
  plugins: [
    // Handle JSON imports
    json(),
    
    // Replace process.env references with actual values
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development')
    }),
    resolve({
      browser: true,             // Browser compatible code
      preferBuiltins: false,     // Prefer browser versions of modules
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: !isProd,        // Source maps only in development
      inlineSources: !isProd     // Include source in source maps
    }),
    // Only minify in production
    ...(isProd ? [
      terser({
        format: {
          comments: false        // Remove comments in production
        }
      })
    ] : [])
  ]
};
