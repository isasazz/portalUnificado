#!/usr/bin/env node
/** Prepara Node 22 del proyecto si el Node del sistema no sirve. */
import { ensureNode } from './ensure-node.mjs';

ensureNode()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err?.message || err);
    process.exit(1);
  });
