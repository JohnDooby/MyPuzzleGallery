/**
 * Génère les fichiers d'environnement Angular à partir de .env (local) ou des variables CI.
 *
 * Usage local :
 *   npm run env:sync
 *   → src/environments/environment.development.ts
 *
 * Usage CI (GitHub Actions) :
 *   npm run env:sync:ci
 *   → src/environments/environment.ts (production)
 *   Variables requises : SUPABASE_URL, SUPABASE_ANON_KEY
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const envPath = join(root, '.env');
const isProduction = process.argv.includes('--production');

/**
 * Parse un fichier .env simple (KEY=VALUE).
 * @param content - Contenu brut du fichier.
 * @returns Map clé → valeur.
 */
function parseEnv(content) {
  /** @type {Record<string, string>} */
  const result = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    result[key] = value;
  }
  return result;
}

/**
 * Valide URL + clé anon.
 * @param url - URL Supabase.
 * @param anon - Clé anon.
 */
function assertValidConfig(url, anon) {
  if (!url || !anon || url.includes('YOUR_PROJECT') || anon.includes('YOUR_SUPABASE')) {
    console.error('SUPABASE_URL / SUPABASE_ANON_KEY manquants ou encore placeholders.');
    process.exit(1);
  }
}

/**
 * Écrit un fichier environment.*.ts.
 * @param outPath - Chemin de sortie.
 * @param production - Flag production.
 * @param url - URL Supabase.
 * @param anon - Clé anon.
 * @param headerComment - Commentaire d'en-tête.
 */
async function writeEnvironmentFile(outPath, production, url, anon, headerComment) {
  const file = `${headerComment}
export const environment = {
  production: ${production ? 'true' : 'false'},
  supabaseUrl: ${JSON.stringify(url)},
  supabaseAnonKey: ${JSON.stringify(anon)},
};
`;
  await writeFile(outPath, file, 'utf8');
  console.log(`OK  ${outPath}`);
}

/**
 * Mode CI : lit les variables d'environnement process et écrit environment.ts (prod).
 */
async function syncProductionFromProcessEnv() {
  const url = process.env.SUPABASE_URL ?? '';
  const anon = process.env.SUPABASE_ANON_KEY ?? '';
  assertValidConfig(url, anon);

  const outPath = join(root, 'src', 'environments', 'environment.ts');
  await writeEnvironmentFile(
    outPath,
    true,
    url,
    anon,
    `/**
 * Environnement production — généré en CI depuis les secrets GitHub.
 * Ne pas committer de vraies clés dans ce fichier source versionné.
 */
`,
  );
}

/**
 * Mode local : lit .env et écrit environment.development.ts.
 */
async function syncDevelopmentFromDotEnv() {
  let raw;
  try {
    raw = await readFile(envPath, 'utf8');
  } catch {
    console.error('Fichier .env introuvable. Copier .env.example vers .env puis réessayer.');
    process.exit(1);
  }

  const env = parseEnv(raw);
  const url = env.SUPABASE_URL ?? '';
  const anon = env.SUPABASE_ANON_KEY ?? '';
  assertValidConfig(url, anon);

  const outPath = join(root, 'src', 'environments', 'environment.development.ts');
  await writeEnvironmentFile(
    outPath,
    false,
    url,
    anon,
    `/**
 * Environnement de développement local (non versionné).
 * Généré par npm run env:sync — ne pas committer.
 */
`,
  );
}

/**
 * Point d'entrée.
 */
async function main() {
  if (isProduction) {
    await syncProductionFromProcessEnv();
  } else {
    await syncDevelopmentFromDotEnv();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
