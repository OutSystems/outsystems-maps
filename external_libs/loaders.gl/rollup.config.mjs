import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const bundledPackages = Object.entries(pkg.dependencies)
	.map(([name, version]) => `${name}@${version}`)
	.join(', ');

const banner = `/*!
 * loaders.gl UMD bundle v${pkg.version}
 * Packages: ${bundledPackages}
 * Generated: ${new Date().toISOString()}
 */`;

export default {
	input: 'src/index.js',
	output: {
		file: 'dist/loaders.gl.js',
		format: 'umd',
		name: 'loaders',
		exports: 'named',
		banner,
	},
	plugins: [resolve({ browser: true, preferBuiltins: false }), commonjs(), terser()],
};
