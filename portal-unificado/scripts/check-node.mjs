#!/usr/bin/env node
/**
 * Bloquea Node incompatible (p. ej. 21) antes de npm install / npm start.
 * Angular CLI falla con ERR_REQUIRE_ESM en versiones impares no LTS.
 */

const major = Number(process.versions.node.split('.')[0]);
const ok = major === 20 || major === 22;

if (ok) {
  process.exit(0);
}

const lines = [
  '',
  '════════════════════════════════════════════════════════════',
  '  Node.js incompatible con este proyecto',
  '════════════════════════════════════════════════════════════',
  '',
  `  Versión detectada: v${process.versions.node}`,
  '  Se requiere:       Node.js 20 o 22 (recomendado: 22 LTS)',
  '',
  '  Node 21 y otras versiones impares rompen Angular CLI',
  '  (error ERR_REQUIRE_ESM con yargs).',
  '',
  '  Qué hacer:',
  '  1. Instala Node 22 LTS desde https://nodejs.org',
  '  2. Cierra y vuelve a abrir la terminal',
  '  3. Verifica:  node -v   (debe empezar por v20 o v22)',
  '  4. En portal-unificado ejecuta:',
  '       npm install',
  '       npm start',
  '',
  '  Si usas nvm / nvm-windows / fnm:',
  '       nvm install 22',
  '       nvm use 22',
  '',
  '════════════════════════════════════════════════════════════',
  ''
];

console.error(lines.join('\n'));
process.exit(1);
