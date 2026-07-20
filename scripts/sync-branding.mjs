/**
 * Synchronise branding.json vers le manifest PWA et index.html.
 * À lancer après toute modification de src/app/core/branding/branding.json.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const brandingPath = join(root, 'src', 'app', 'core', 'branding', 'branding.json');
const manifestPath = join(root, 'public', 'manifest.webmanifest');
const indexPath = join(root, 'src', 'index.html');

/**
 * Point d'entrée : lit le branding et met à jour manifest + index.html.
 */
async function syncBranding() {
  const branding = JSON.parse(await readFile(brandingPath, 'utf8'));

  // --- Manifest PWA (nom icône / description / couleurs) ---
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifest.name = branding.name;
  manifest.short_name = branding.shortName;
  manifest.description = branding.description;
  manifest.theme_color = branding.themeColor;
  manifest.background_color = branding.backgroundColor;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  // --- index.html (titre onglet, meta Apple, noscript) ---
  let indexHtml = await readFile(indexPath, 'utf8');
  indexHtml = indexHtml
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(branding.name)}</title>`)
    .replace(
      /<meta name="theme-color" content="[^"]*" \/>/,
      `<meta name="theme-color" content="${escapeHtml(branding.themeColor)}" />`,
    )
    .replace(
      /<meta name="apple-mobile-web-app-title" content="[^"]*" \/>/,
      `<meta name="apple-mobile-web-app-title" content="${escapeHtml(branding.shortName)}" />`,
    )
    .replace(
      /<noscript>.*?<\/noscript>/,
      `<noscript>Activez JavaScript pour utiliser ${escapeHtml(branding.name)}.</noscript>`,
    );
  await writeFile(indexPath, indexHtml, 'utf8');

  console.log(`Branding synchronisé : « ${branding.name} » / « ${branding.shortName} »`);
}

/**
 * Échappe les caractères HTML sensibles dans les attributs / texte.
 * @param value - Texte brut issu du branding.
 * @returns Texte sûr pour insertion HTML.
 */
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

syncBranding().catch((error) => {
  console.error(error);
  process.exit(1);
});
