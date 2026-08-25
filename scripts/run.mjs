#!/usr/bin/env node
/**
 * Ejecuta npm/ng con Node 20/22.
 * Si el sistema tiene Node 21, descarga Node 22 en vendor/node y lo usa.
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ensureNode } from './ensure-node.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '..');

function npmCmd(binDir) {
  if (process.platform === 'win32') {
    const local = path.join(binDir, 'npm.cmd');
    return existsSync(local) ? local : 'npm.cmd';
  }

  const local = path.join(binDir, 'npm');
  return existsSync(local) ? local : 'npm';
}

function ngEntry(cwd) {
  return path.join(
    cwd,
    'node_modules',
    '@angular',
    'cli',
    'bin',
    'ng.js'
  );
}

function run(command, args, options) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      ...options,
      stdio: 'inherit',
      shell: process.platform === 'win32' && !command.endsWith('node.exe') && !command.endsWith('node')
    });

    child.on('exit', (code, signal) => {
      resolve(signal ? 1 : (code ?? 1));
    });
  });
}

async function main() {
  const action = process.argv[2] || 'start';
  const rest = process.argv.slice(3);
  const cwd = APP_ROOT;

  const { nodePath, binDir, usingPortable } = await ensureNode();

  const env = {
    ...process.env,
    PATH: `${binDir}${path.delimiter}${process.env.PATH || ''}`
  };

  // Evita que npm vuelva a rechazar por engines del Node del sistema
  env.npm_config_engine_strict = 'false';

  if (usingPortable) {
    console.log('Usando Node 22 del proyecto (vendor/node)');
  }

  if (action === 'ensure') {
    process.exit(0);
  }

  if (action === 'install' || action === 'ci') {
    const code = await run(npmCmd(binDir), [action, ...rest], {
      cwd,
      env,
      shell: process.platform === 'win32'
    });
    process.exit(code);
  }

  const ngJs = ngEntry(cwd);

  if (!existsSync(ngJs)) {
    console.error('');
    console.error('Faltan dependencias. Ejecuta:');
    console.error('  npm install');
    console.error('');
    process.exit(1);
  }

  const ngArgsByAction = {
    start: ['serve', ...rest],
    serve: ['serve', ...rest],
    build: ['build', ...rest],
    watch: ['build', '--watch', '--configuration', 'development', ...rest],
    test: ['test', ...rest]
  };

  const ngArgs = ngArgsByAction[action];

  if (!ngArgs) {
    console.error(`Comando no soportado: ${action}`);
    process.exit(1);
  }

  const code = await run(nodePath, [ngJs, ...ngArgs], {
    cwd,
    env,
    shell: false
  });

  process.exit(code);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
