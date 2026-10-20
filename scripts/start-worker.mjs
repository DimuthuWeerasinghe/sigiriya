import { readFile, writeFile, mkdir, mkdtemp, unlink } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { parseArgs } from 'node:util';
import path from 'node:path';

const { values } = parseArgs({ options: { port: { type: 'string', default: '3000' }, hostname: { type: 'string', default: '127.0.0.1' } } });
const port = Number(values.port);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Choose a port between 1 and 65535.');
const buildRoot = path.resolve('dist/server');
const config = JSON.parse(await readFile(path.join(buildRoot, 'wrangler.json'), 'utf8'));
config.main = path.resolve(buildRoot, config.main);
if (config.assets?.directory) config.assets.directory = path.resolve(buildRoot, config.assets.directory);
for (const database of config.d1_databases ?? []) if (database.migrations_dir) database.migrations_dir = path.resolve(database.migrations_dir);
delete config.build;

// Keep preview secrets out of built/deployable artifacts. Wrangler reads its
// local secret file next to this temporary, ignored configuration.
await mkdir('.wrangler', { recursive: true });
const previewRoot = await mkdtemp(path.resolve('.wrangler/production-preview-'));
const secretPath = path.join(previewRoot, '.dev.vars');
try { await writeFile(secretPath, await readFile('.dev.vars', 'utf8'), { mode: 0o600 }); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const configPath = path.join(previewRoot, 'wrangler.json');
await writeFile(configPath, JSON.stringify(config));
console.log(`Starting the built Worker locally at http://${values.hostname}:${port}`);
const child = spawn(process.execPath, [path.resolve('node_modules/wrangler/bin/wrangler.js'), 'dev', '--local', '--config', configPath,
  '--persist-to', path.resolve('.wrangler/state'), '--ip', values.hostname, '--port', String(port), '--log-level', 'warn'], {
  stdio: 'inherit', env: { ...process.env, WRANGLER_SEND_METRICS: 'false', WRANGLER_WRITE_LOGS: 'false', WRANGLER_LOG_PATH: path.resolve('.wrangler/logs'), MINIFLARE_REGISTRY_PATH: path.resolve('.wrangler/registry'), CLOUDFLARE_CF_FETCH_ENABLED: 'false' },
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', async (error) => { await unlink(secretPath).catch(() => {}); console.error(error.message); process.exitCode = 1; });
child.on('exit', async (code) => { await unlink(secretPath).catch(() => {}); process.exitCode = code ?? 0; });
