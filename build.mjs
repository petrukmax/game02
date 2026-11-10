// Ashen Crown — zero-dependency bundler.
//
// The game is written as ES modules so it stays testable with `node --test`.
// Browsers refuse to load ES modules from `file://` (CORS), which breaks
// double-clicking index.html. This script flattens the module graph into a
// single classic script, `js/ashen-crown.js`, that runs from file:// and from
// any static host (GitHub Pages included).
//
// Usage: node build.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = 'js/main.js';
const OUTPUT = 'js/ashen-crown.js';

const IMPORT_RE =
  /^[ \t]*import\s*\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"]\s*;?[ \t]*$/gm;
const EXPORT_DECL_RE =
  /^[ \t]*export\s+(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm;
const EXPORT_PREFIX_RE =
  /^[ \t]*export\s+(?=(?:async\s+)?(?:const|let|var|function|class)\s)/gm;

const ordered = [];
const visiting = new Set();
const visited = new Set();

function moduleId(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function resolveImport(fromFile, request) {
  if (!request.startsWith('.')) {
    throw new Error(
      `Bare import "${request}" in ${moduleId(fromFile)} is not supported by the bundler.`,
    );
  }
  const target = path.resolve(path.dirname(fromFile), request);
  if (!fs.existsSync(target)) {
    throw new Error(`Cannot resolve "${request}" from ${moduleId(fromFile)}.`);
  }
  return target;
}

function transform(file) {
  const id = moduleId(file);
  let source = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const imports = [];

  source = source.replace(IMPORT_RE, (_match, names, request) => {
    const target = resolveImport(file, request);
    const targetId = moduleId(target);
    imports.push(target);

    const bindings = names
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [imported, local] = part.split(/\s+as\s+/);
        return imported === local || !local ? imported : `${imported}: ${local}`;
      })
      .join(', ');

    return `const { ${bindings} } = __require(${JSON.stringify(targetId)});`;
  });

  if (/^[ \t]*import\b/m.test(source)) {
    throw new Error(`Unsupported import syntax left in ${id}.`);
  }

  const exported = [...source.matchAll(EXPORT_DECL_RE)].map((match) => match[1]);
  source = source.replace(EXPORT_PREFIX_RE, '');

  if (/^[ \t]*export\b/m.test(source)) {
    throw new Error(`Unsupported export syntax left in ${id}.`);
  }
  if (exported.length) {
    source += `\nObject.assign(exports, { ${exported.join(', ')} });\n`;
  }

  return { file, id, source, imports };
}

function visit(file) {
  if (visited.has(file)) return;
  if (visiting.has(file)) {
    throw new Error(`Circular import detected at ${moduleId(file)}.`);
  }
  visiting.add(file);

  const mod = transform(file);
  for (const dependency of mod.imports) visit(dependency);

  visiting.delete(file);
  visited.add(file);
  ordered.push(mod);
}

const entryFile = path.resolve(ROOT, ENTRY);
visit(entryFile);

const chunks = [
  '// Ashen Crown — generated bundle. Do not edit by hand.',
  '// Built from the ES modules in js/ by `node build.mjs`.',
  '// This is a classic script so the game runs from file:// and static hosting.',
  '(function () {',
  "  'use strict';",
  '',
  '  const __definitions = Object.create(null);',
  '  const __cache = Object.create(null);',
  '',
  '  function __define(id, factory) {',
  '    __definitions[id] = factory;',
  '  }',
  '',
  '  function __require(id) {',
  '    if (__cache[id]) return __cache[id].exports;',
  '    const factory = __definitions[id];',
  '    if (!factory) throw new Error("Module not found: " + id);',
  '    const module = { exports: {} };',
  '    __cache[id] = module;',
  '    factory(module, module.exports, __require);',
  '    return module.exports;',
  '  }',
  '',
];

for (const mod of ordered) {
  chunks.push(
    `  // ---- ${mod.id} ${'-'.repeat(Math.max(4, 64 - mod.id.length))}`,
    `  __define(${JSON.stringify(mod.id)}, function (module, exports, __require) {`,
    mod.source.replace(/[ \t]+$/gm, ''),
    '  });',
    '',
  );
}

chunks.push(`  __require(${JSON.stringify(moduleId(entryFile))});`, '})();', '');

const outputPath = path.resolve(ROOT, OUTPUT);
fs.writeFileSync(outputPath, chunks.join('\n'), 'utf8');

const sizeKb = (fs.statSync(outputPath).size / 1024).toFixed(1);
console.log(`Bundled ${ordered.length} modules -> ${OUTPUT} (${sizeKb} KB)`);
