import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: 'p-et-alia.js',
    output: {
        dir: 'dist/',
        format: 'es'
    },
    plugins: [nodeResolve()]
}