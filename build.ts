import { buildSync } from 'esbuild';

buildSync({
  entryPoints: ['dist/*.js'],
  bundle: true,
  platform: 'node',
  target: 'node16',
  outdir: 'dist',
  minify: true,
  allowOverwrite: true
});
