/**
 * Génère les icônes PWA à partir du logo source.
 *
 * Usage :
 *   1. Placer le logo carré dans public/icons/logo-source.png (ou .jpg / .webp)
 *   2. npm run icons:generate
 */
import { access, mkdir, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');

/** Extensions acceptées pour le fichier source. */
const sourceExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

/** Tailles d'icônes attendues par le manifest PWA. */
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

/**
 * Localise le logo source (logo-source.*) dans public/icons.
 * @returns {Promise<string>} Chemin absolu du fichier source.
 */
async function resolveSourcePath() {
  for (const ext of sourceExtensions) {
    const candidate = join(iconsDir, `logo-source${ext}`);
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Essayer l'extension suivante.
    }
  }

  const files = await readdir(iconsDir).catch(() => []);
  console.error(
    'Logo introuvable : public/icons/logo-source.(png|jpg|jpeg|webp)\n' +
      `Fichiers présents : ${files.join(', ') || '(aucun)'}`,
  );
  process.exit(1);
}

/**
 * Redimensionne le logo source vers toutes les tailles PWA.
 */
async function generateIcons() {
  const sourcePath = await resolveSourcePath();
  console.log(`Source : ${sourcePath}`);

  await mkdir(iconsDir, { recursive: true });

  for (const size of sizes) {
    const outPath = join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(sourcePath)
      .resize(size, size, {
        fit: 'cover',
        position: 'centre',
      })
      .png()
      .toFile(outPath);
    console.log(`OK  icon-${size}x${size}.png`);
  }

  console.log('Icônes PWA régénérées.');
}

generateIcons().catch((error) => {
  console.error(error);
  process.exit(1);
});
