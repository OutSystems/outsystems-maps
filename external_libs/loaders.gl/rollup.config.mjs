import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/loaders.gl.js',
        format: 'umd',
        name: 'loaders',
        exports: 'named',
    },
    plugins: [
        resolve({ browser: true, preferBuiltins: false }),
        commonjs(),
        terser(),
    ],
};
