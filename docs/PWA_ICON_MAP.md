# PWA Icon Generation Map — Lucy AI

This document provides a complete reference for all PWA icons used in the Lucy AI application.

## Source Icon

- **File**: `public/icon-512.png`
- **Recommended source size**: 1024×1024 PNG with transparency
- **Safe zone for maskable**: Center 80% of the icon (leave 10% padding on all sides)

## Generated Icons

Run the icon generation script to regenerate all icons from the source:

```bash
npx tsx scripts/generate-pwa-icons.ts
```

### Standard Icons (purpose: `any`)

| File                | Size      | Used By                          |
|---------------------|-----------|----------------------------------|
| `icon-16.png`       | 16×16     | favicon, browser tab             |
| `icon-32.png`       | 32×32     | favicon, browser tab             |
| `icon-48.png`       | 48×48     | Windows taskbar                  |
| `icon-72.png`       | 72×72     | Android older devices            |
| `icon-96.png`       | 96×96     | Android older devices            |
| `icon-128.png`      | 128×128   | Chrome Web Store                 |
| `icon-144.png`      | 144×144   | Windows Metro tiles              |
| `icon-152.png`      | 152×152   | iPad (retina)                    |
| `icon-180.png`      | 180×180   | iPhone 6+ (retina)               |
| `icon-192.png`      | 192×192   | **PWA manifest primary**         |
| `icon-256.png`      | 256×256   | Windows icons                    |
| `icon-384.png`      | 384×384   | Android splash                   |
| `icon-512.png`      | 512×512   | **PWA manifest large**           |
| `icon-1024.png`     | 1024×1024 | App Store / Play Store           |

### Apple Touch Icons

| File                           | Size      | Used By                      |
|--------------------------------|-----------|------------------------------|
| `apple-touch-icon.png`         | 180×180   | iOS home screen (default)    |
| `apple-touch-icon-152x152.png` | 152×152   | iPad (non-retina)            |
| `apple-touch-icon-120x120.png` | 120×120   | iPhone (non-retina)          |

### Maskable Icons (purpose: `maskable`)

Maskable icons have the Lucy logo centered at 80% size with the app background color (`#0b1f1a`) filling the remaining 20% safe zone. This ensures the icon displays correctly on Android adaptive icon systems.

| File                    | Size      | Background   |
|-------------------------|-----------|--------------|
| `icon-maskable-192.png` | 192×192   | `#0b1f1a`    |
| `icon-maskable-384.png` | 384×384   | `#0b1f1a`    |
| `icon-maskable-512.png` | 512×512   | `#0b1f1a`    |

### Favicon

| File           | Sizes                    | Used By            |
|----------------|--------------------------|---------------------|
| `favicon.ico`  | 16, 32, 48, 64, 128, 256 | Browser tab, legacy |

## manifest.json Icon Array

```json
"icons": [
  { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
  { "src": "/icon-256.png", "sizes": "256x256", "type": "image/png", "purpose": "any" },
  { "src": "/icon-384.png", "sizes": "384x384", "type": "image/png", "purpose": "any" },
  { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
  { "src": "/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
  { "src": "/icon-maskable-384.png", "sizes": "384x384", "type": "image/png", "purpose": "maskable" },
  { "src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
]
```

## index.html References

```html
<!-- PWA CORE — MANIFEST + ICONS -->
<link rel="manifest" href="/manifest.json" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/icon-16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

## Testing

1. **Maskable icons**: Test at [maskable.app/editor](https://maskable.app/editor)
2. **PWA manifest**: Test at Chrome DevTools → Application → Manifest
3. **iOS install**: Safari → Share → Add to Home Screen
4. **Android install**: Chrome → Menu → Install App

## Color Reference

| Property           | Value     | Used In                           |
|--------------------|-----------|-----------------------------------|
| `background_color` | `#0b1f1a` | manifest.json, splash screens     |
| `theme_color`      | `#7c3aed` | manifest.json, status bar         |

## Regenerating Icons

To update icons when the source changes:

```bash
# Ensure sharp is installed
npm install -D sharp

# Run the generation script
npx tsx scripts/generate-pwa-icons.ts
```

For favicon.ico with optimal multi-size support, use [realfavicongenerator.net](https://realfavicongenerator.net).
