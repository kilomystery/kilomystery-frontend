// Read-only. Uses the exact import client, OAuth grant, token cache and environment.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
require('@next/env').loadEnvConfig(process.cwd());
const lib = path.resolve(__dirname, '../app/lib') + path.sep;
require.extensions['.ts'] = (module, filename) => {
  if (!filename.startsWith(lib)) throw new Error('Unexpected diagnostic module');
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, filename);
};
const { shopifyDiagnostics } = require('../app/lib/poporama-shopify-diagnostics.ts');
const { safeShopifyText } = require('../app/lib/poporama-shopify-scopes.ts');
shopifyDiagnostics({ refresh: process.argv.includes('--refresh') })
  .then(report => console.log(JSON.stringify(report, null, 2)))
  .catch(error => { console.error(JSON.stringify({ ok: false, error: safeShopifyText(error instanceof Error ? error.message : 'Diagnostic failed') })); process.exitCode = 1; });
