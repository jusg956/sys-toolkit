import { build } from 'esbuild'

await build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist-electron/backend/index.mjs',
  external: ['systeminformation'],
  banner: {
    js: `
import { createRequire } from 'module';
import { fileURLToPath as __fileURLToPath } from 'url';
import { dirname as __dirnameFn } from 'path';
const require = createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameFn(__filename);
`,
  },
})

console.log('Backend bundled to dist-electron/backend/index.mjs')
