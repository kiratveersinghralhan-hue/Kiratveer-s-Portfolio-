import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const { fileURLToPath } = await import('node:url');
const directory = fileURLToPath(root);
const ignored = new Set(['node_modules', 'legacy', 'dist', 'test-results', '.git']);
const extensions = new Set(['.js', '.mjs', '.css', '.html', '.md', '.json', '.txt', '.svg']);
let count = 0;
let failed = false;
async function visit(folder) {
  for (const entry of await readdir(folder, {withFileTypes:true})) {
    if (ignored.has(entry.name)) continue;
    const path = join(folder,entry.name);
    if (entry.isDirectory()) { await visit(path); continue; }
    if (!extensions.has(extname(path))) continue;
    if (process.argv.includes('--fix')) {
      const before = await readFile(path,'utf8');
      const after = `${before.replace(/\r\n/g, '\n').replace(/[\t ]+$/gm, '').replace(/\s+$/, '')}\n`;
      if (before !== after) await writeFile(path,after);
    }
    const result = spawnSync('git',['-c','core.autocrlf=false','diff','--no-index','--check','--',process.platform==='win32'?'NUL':'/dev/null',path],{encoding:'utf8'});
    count++;
    if (result.stdout || result.stderr || result.error) {
      failed = true;
      console.error(relative(directory,path),result.stdout || result.stderr || result.error.message);
    }
  }
}
await visit(directory);
console.log(`${failed?'FAIL':'PASS'} Git no-index whitespace checks: ${count} text files. Original legacy files excluded.`);
if(failed)process.exitCode=1;
