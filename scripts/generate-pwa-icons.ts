/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE LUCY LOUNGE — PWA ICON GENERATION SCRIPT
 *
 * Generates all required PWA icons from a single source image using Sharp.
 *
 * Usage:
 *   npx ts-node scripts/generate-pwa-icons.ts
 *   OR
 *   node scripts/generate-pwa-icons.mjs
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SOURCE_ICON = path.join(PUBLIC_DIR, 'icon-512.png');
const BACKGROUND_COLOR = '#0b1f1a'; // App background color for maskable icons

interface IconConfig {
  size: number;
  filename: string;
  maskable?: boolean;
}

// Standard icons (purpose: any)
const STANDARD_ICONS: IconConfig[] = [
  { size: 16, filename: 'icon-16.png' },
  { size: 32, filename: 'icon-32.png' },
  { size: 48, filename: 'icon-48.png' },
  { size: 72, filename: 'icon-72.png' },
  { size: 96, filename: 'icon-96.png' },
  { size: 128, filename: 'icon-128.png' },
  { size: 144, filename: 'icon-144.png' },
  { size: 152, filename: 'icon-152.png' },
  { size: 180, filename: 'icon-180.png' },
  { size: 192, filename: 'icon-192.png' },
  { size: 256, filename: 'icon-256.png' },
  { size: 384, filename: 'icon-384.png' },
  { size: 512, filename: 'icon-512.png' }, // Will be skipped if source
  { size: 1024, filename: 'icon-1024.png' },
];

// Apple touch icons
const APPLE_ICONS: IconConfig[] = [
  { size: 180, filename: 'apple-touch-icon.png' },
  { size: 152, filename: 'apple-touch-icon-152x152.png' },
  { size: 120, filename: 'apple-touch-icon-120x120.png' },
];

// Maskable icons (with padding for Android adaptive icons)
const MASKABLE_ICONS: IconConfig[] = [
  { size: 192, filename: 'icon-maskable-192.png', maskable: true },
  { size: 384, filename: 'icon-maskable-384.png', maskable: true },
  { size: 512, filename: 'icon-maskable-512.png', maskable: true },
];

async function generateStandardIcon(sourceBuffer: Buffer, config: IconConfig): Promise<void> {
  const outputPath = path.join(PUBLIC_DIR, config.filename);

  // Skip if this is the source file
  if (config.filename === 'icon-512.png') {
    console.log(`  ⏭️  Skipping ${config.filename} (source file)`);
    return;
  }

  await sharp(sourceBuffer)
    .resize(config.size, config.size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outputPath);

  console.log(`  ✅ ${config.filename} (${config.size}x${config.size})`);
}

async function generateMaskableIcon(sourceBuffer: Buffer, config: IconConfig): Promise<void> {
  const outputPath = path.join(PUBLIC_DIR, config.filename);

  // For maskable icons, the safe zone is the center 80%
  // We resize the icon to 80% and place it on a solid background
  const iconSize = Math.floor(config.size * 0.8);
  const padding = Math.floor((config.size - iconSize) / 2);

  // Parse background color
  const bgColor = {
    r: parseInt(BACKGROUND_COLOR.slice(1, 3), 16),
    g: parseInt(BACKGROUND_COLOR.slice(3, 5), 16),
    b: parseInt(BACKGROUND_COLOR.slice(5, 7), 16),
  };

  // Resize the icon
  const resizedIcon = await sharp(sourceBuffer)
    .resize(iconSize, iconSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  // Create background and composite
  await sharp({
    create: {
      width: config.size,
      height: config.size,
      channels: 4,
      background: { ...bgColor, alpha: 1 },
    },
  })
    .composite([
      {
        input: resizedIcon,
        top: padding,
        left: padding,
      },
    ])
    .png()
    .toFile(outputPath);

  console.log(`  ✅ ${config.filename} (${config.size}x${config.size}, maskable)`);
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  PWA ICON GENERATOR - Lucy AI');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // Check if source exists
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`❌ Source icon not found: ${SOURCE_ICON}`);
    console.log('');
    console.log('Please ensure icon-512.png exists in the public folder.');
    process.exit(1);
  }

  console.log(`Source: ${SOURCE_ICON}`);
  console.log(`Output: ${PUBLIC_DIR}`);
  console.log(`Background (maskable): ${BACKGROUND_COLOR}`);
  console.log('');

  // Read source icon
  const sourceBuffer = fs.readFileSync(SOURCE_ICON);

  // Generate standard icons
  console.log('📦 Generating standard icons...');
  for (const config of STANDARD_ICONS) {
    await generateStandardIcon(sourceBuffer, config);
  }
  console.log('');

  // Generate Apple touch icons
  console.log('🍎 Generating Apple touch icons...');
  for (const config of APPLE_ICONS) {
    await generateStandardIcon(sourceBuffer, config);
  }
  console.log('');

  // Generate maskable icons
  console.log('🎭 Generating maskable icons...');
  for (const config of MASKABLE_ICONS) {
    await generateMaskableIcon(sourceBuffer, config);
  }
  console.log('');

  // Generate favicon.ico using sharp (just creates PNG, user needs to convert)
  console.log('🔖 Note: For favicon.ico, use https://realfavicongenerator.net');
  console.log('');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  ✅ ICON GENERATION COMPLETE!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Verify icons visually');
  console.log('  2. Test maskable icons at https://maskable.app/editor');
  console.log('  3. Test PWA install on iOS Safari + Android Chrome');
  console.log('');
}

main().catch(console.error);
