#!/usr/bin/env node
/**
 * Usa Node 20/22 del sistema, o el Node portable en vendor/node.
 * Si no hay ninguno válido, descarga Node 22 LTS en vendor/node.
 */

import { spawnSync } from 'node:child_process';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  readFileSync
} from 'node:fs';
import { chmod } from 'node:fs/promises';
import https from 'node:https';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const NODE_VERSION = '22.23.2';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '..');
const VENDOR_DIR = path.join(APP_ROOT, 'vendor', 'node');
const ACTIVE_PATH_FILE = path.join(VENDOR_DIR, 'active-node-path.txt');

function majorOf(version) {
  return Number(String(version).replace(/^v/, '').split('.')[0]);
}

function isSupported(version) {
  const major = majorOf(version);
  return major === 20 || major === 22;
}

function platformBundle() {
  const { platform, arch } = process;

  if (platform === 'win32' && arch === 'x64') {
    return {
      dirName: `node-v${NODE_VERSION}-win-x64`,
      file: `node-v${NODE_VERSION}-win-x64.zip`,
      nodeRel: path.join(`node-v${NODE_VERSION}-win-x64`, 'node.exe')
    };
  }

  if (platform === 'darwin' && arch === 'arm64') {
    return {
      dirName: `node-v${NODE_VERSION}-darwin-arm64`,
      file: `node-v${NODE_VERSION}-darwin-arm64.tar.gz`,
      nodeRel: path.join(
        `node-v${NODE_VERSION}-darwin-arm64`,
        'bin',
        'node'
      )
    };
  }

  if (platform === 'darwin' && arch === 'x64') {
    return {
      dirName: `node-v${NODE_VERSION}-darwin-x64`,
      file: `node-v${NODE_VERSION}-darwin-x64.tar.gz`,
      nodeRel: path.join(
        `node-v${NODE_VERSION}-darwin-x64`,
        'bin',
        'node'
      )
    };
  }

  if (platform === 'linux' && arch === 'x64') {
    return {
      dirName: `node-v${NODE_VERSION}-linux-x64`,
      file: `node-v${NODE_VERSION}-linux-x64.tar.xz`,
      nodeRel: path.join(
        `node-v${NODE_VERSION}-linux-x64`,
        'bin',
        'node'
      )
    };
  }

  if (platform === 'linux' && arch === 'arm64') {
    return {
      dirName: `node-v${NODE_VERSION}-linux-arm64`,
      file: `node-v${NODE_VERSION}-linux-arm64.tar.xz`,
      nodeRel: path.join(
        `node-v${NODE_VERSION}-linux-arm64`,
        'bin',
        'node'
      )
    };
  }

  return null;
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const request = (currentUrl, redirects = 0) => {
      if (redirects > 5) {
        reject(new Error('Demasiados redirects al descargar Node'));
        return;
      }

      https
        .get(currentUrl, (res) => {
          if (
            res.statusCode &&
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            request(res.headers.location, redirects + 1);
            return;
          }

          if (res.statusCode !== 200) {
            reject(
              new Error(`No se pudo descargar Node (${res.statusCode})`)
            );
            return;
          }

          const out = createWriteStream(dest);
          pipeline(res, out).then(resolve).catch(reject);
        })
        .on('error', reject);
    };

    request(url);
  });
}

function extractArchive(archivePath, bundle) {
  mkdirSync(VENDOR_DIR, { recursive: true });

  if (bundle.file.endsWith('.zip')) {
    const ps = `
      Expand-Archive -LiteralPath '${archivePath.replace(/'/g, "''")}' -DestinationPath '${VENDOR_DIR.replace(/'/g, "''")}' -Force
    `;
    const result = spawnSync(
      'powershell.exe',
      ['-NoProfile', '-Command', ps],
      { stdio: 'inherit' }
    );
    if (result.status !== 0) {
      throw new Error('Falló la extracción de Node (zip)');
    }
    return;
  }

  const result = spawnSync(
    'tar',
    ['-xf', archivePath, '-C', VENDOR_DIR],
    { stdio: 'inherit' }
  );
  if (result.status !== 0) {
    throw new Error('Falló la extracción de Node (tar)');
  }
}

function readSavedNodePath() {
  if (!existsSync(ACTIVE_PATH_FILE)) {
    return null;
  }

  const saved = readFileSync(ACTIVE_PATH_FILE, 'utf8').trim();
  return existsSync(saved) ? saved : null;
}

async function downloadPortableNode() {
  const bundle = platformBundle();

  if (!bundle) {
    console.error(`
════════════════════════════════════════════════════════════
  No hay Node portable para: ${process.platform}/${process.arch}
  Instala Node 22 LTS desde https://nodejs.org
════════════════════════════════════════════════════════════
`);
    process.exit(1);
  }

  const nodePath = path.join(VENDOR_DIR, bundle.nodeRel);
  if (existsSync(nodePath)) {
    writeFileSync(ACTIVE_PATH_FILE, nodePath, 'utf8');
    return nodePath;
  }

  mkdirSync(VENDOR_DIR, { recursive: true });

  const url = `https://nodejs.org/dist/v${NODE_VERSION}/${bundle.file}`;
  const archivePath = path.join(VENDOR_DIR, bundle.file);

  console.log('');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`  Tu Node es v${process.versions.node} (no compatible).`);
  console.log(`  Descargando Node ${NODE_VERSION} para este proyecto...`);
  console.log('  Queda en vendor/node (solo este repo).');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`  ${url}`);
  console.log('');

  await download(url, archivePath);
  extractArchive(archivePath, bundle);

  try {
    rmSync(archivePath, { force: true });
  } catch {
    // ignore
  }

  if (!existsSync(nodePath)) {
    throw new Error(`Node descargado pero no encontrado en: ${nodePath}`);
  }

  if (process.platform !== 'win32') {
    await chmod(nodePath, 0o755);
  }

  writeFileSync(ACTIVE_PATH_FILE, nodePath, 'utf8');

  console.log('');
  console.log(`  Listo: Node ${NODE_VERSION} listo en vendor/node`);
  console.log('');

  return nodePath;
}

/**
 * @returns {Promise<{ nodePath: string; binDir: string; usingPortable: boolean }>}
 */
export async function ensureNode() {
  const saved = readSavedNodePath();
  if (saved) {
    return {
      nodePath: saved,
      binDir: path.dirname(saved),
      usingPortable: true
    };
  }

  const bundle = platformBundle();
  if (bundle) {
    const local = path.join(VENDOR_DIR, bundle.nodeRel);
    if (existsSync(local)) {
      writeFileSync(ACTIVE_PATH_FILE, local, 'utf8');
      return {
        nodePath: local,
        binDir: path.dirname(local),
        usingPortable: true
      };
    }
  }

  if (isSupported(process.versions.node)) {
    return {
      nodePath: process.execPath,
      binDir: path.dirname(process.execPath),
      usingPortable: false
    };
  }

  const nodePath = await downloadPortableNode();
  return {
    nodePath,
    binDir: path.dirname(nodePath),
    usingPortable: true
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  ensureNode()
    .then((info) => {
      console.log(
        info.usingPortable
          ? `Node del proyecto: ${info.nodePath}`
          : `Node del sistema OK: v${process.versions.node}`
      );
      process.exit(0);
    })
    .catch((err) => {
      console.error(err?.message || err);
      process.exit(1);
    });
}
