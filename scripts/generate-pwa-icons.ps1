# ═══════════════════════════════════════════════════════════════════════════════
# THE LUCY LOUNGE — PWA ICON GENERATION SCRIPT
# 
# Generates all required PWA icons from a single source image.
# Requires ImageMagick (https://imagemagick.org/) to be installed.
# 
# Usage:
#   1. Install ImageMagick: winget install ImageMagick.ImageMagick
#   2. Place your source icon as public/icon-source.png (1024x1024 recommended)
#   3. Run: .\scripts\generate-pwa-icons.ps1
# ═══════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$publicDir = Join-Path $projectRoot "public"
$sourceIcon = Join-Path $publicDir "icon-512.png"  # Use existing 512 as source

# Check if ImageMagick is installed
$magick = Get-Command magick -ErrorAction SilentlyContinue
if (-not $magick) {
    Write-Host "ERROR: ImageMagick is not installed." -ForegroundColor Red
    Write-Host "Install with: winget install ImageMagick.ImageMagick" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "MANUAL ALTERNATIVE:" -ForegroundColor Cyan
    Write-Host "Use https://realfavicongenerator.net or https://maskable.app" -ForegroundColor Cyan
    exit 1
}

# Check if source icon exists
if (-not (Test-Path $sourceIcon)) {
    Write-Host "ERROR: Source icon not found at $sourceIcon" -ForegroundColor Red
    exit 1
}

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PWA ICON GENERATOR - Lucy AI" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Source: $sourceIcon" -ForegroundColor Gray
Write-Host "Output: $publicDir" -ForegroundColor Gray
Write-Host ""

# ───────────────────────────────────────────────────
# STANDARD ICONS (purpose: any)
# ───────────────────────────────────────────────────

$standardSizes = @(16, 32, 48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512, 1024)

Write-Host "Generating standard icons..." -ForegroundColor Yellow
foreach ($size in $standardSizes) {
    $output = Join-Path $publicDir "icon-$size.png"
    Write-Host "  → icon-$size.png" -ForegroundColor Gray
    & magick $sourceIcon -resize "${size}x${size}" $output
}

# ───────────────────────────────────────────────────
# APPLE TOUCH ICONS
# ───────────────────────────────────────────────────

Write-Host ""
Write-Host "Generating Apple touch icons..." -ForegroundColor Yellow

$appleTouchIcon = Join-Path $publicDir "apple-touch-icon.png"
Write-Host "  → apple-touch-icon.png (180x180)" -ForegroundColor Gray
& magick $sourceIcon -resize "180x180" $appleTouchIcon

$appleTouchIcon152 = Join-Path $publicDir "apple-touch-icon-152x152.png"
Write-Host "  → apple-touch-icon-152x152.png" -ForegroundColor Gray
& magick $sourceIcon -resize "152x152" $appleTouchIcon152

$appleTouchIcon120 = Join-Path $publicDir "apple-touch-icon-120x120.png"
Write-Host "  → apple-touch-icon-120x120.png" -ForegroundColor Gray
& magick $sourceIcon -resize "120x120" $appleTouchIcon120

# ───────────────────────────────────────────────────
# MASKABLE ICONS (Android Adaptive)
# For maskable icons, the safe zone is the center 80%
# We add padding around the icon to ensure it displays correctly
# ───────────────────────────────────────────────────

Write-Host ""
Write-Host "Generating maskable icons..." -ForegroundColor Yellow

$maskableSizes = @(192, 384, 512)
$backgroundColor = "#0b1f1a"  # App background color

foreach ($size in $maskableSizes) {
    $output = Join-Path $publicDir "icon-maskable-$size.png"
    $iconSize = [math]::Floor($size * 0.8)  # 80% of total size (safe zone)
    $padding = [math]::Floor(($size - $iconSize) / 2)
    
    Write-Host "  → icon-maskable-$size.png" -ForegroundColor Gray
    
    # Create a square with background color, then composite the resized icon centered
    & magick -size "${size}x${size}" "xc:$backgroundColor" `
        "(" $sourceIcon -resize "${iconSize}x${iconSize}" ")" `
        -gravity center -composite $output
}

# ───────────────────────────────────────────────────
# FAVICON (multi-size ICO)
# ───────────────────────────────────────────────────

Write-Host ""
Write-Host "Generating favicon.ico (multi-size)..." -ForegroundColor Yellow

$faviconOutput = Join-Path $publicDir "favicon.ico"
& magick $sourceIcon -define icon:auto-resize=256,128,64,48,32,16 $faviconOutput
Write-Host "  → favicon.ico" -ForegroundColor Gray

# ───────────────────────────────────────────────────
# SUMMARY
# ───────────────────────────────────────────────────

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ICON GENERATION COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Generated files:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  STANDARD ICONS (purpose: any):" -ForegroundColor Yellow
foreach ($size in $standardSizes) {
    Write-Host "    /icon-$size.png" -ForegroundColor Gray
}
Write-Host ""
Write-Host "  APPLE TOUCH ICONS:" -ForegroundColor Yellow
Write-Host "    /apple-touch-icon.png (180x180)" -ForegroundColor Gray
Write-Host "    /apple-touch-icon-152x152.png" -ForegroundColor Gray
Write-Host "    /apple-touch-icon-120x120.png" -ForegroundColor Gray
Write-Host ""
Write-Host "  MASKABLE ICONS (purpose: maskable):" -ForegroundColor Yellow
foreach ($size in $maskableSizes) {
    Write-Host "    /icon-maskable-$size.png" -ForegroundColor Gray
}
Write-Host ""
Write-Host "  FAVICON:" -ForegroundColor Yellow
Write-Host "    /favicon.ico (16, 32, 48, 64, 128, 256)" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify icons visually" -ForegroundColor Gray
Write-Host "  2. Test maskable icons at https://maskable.app/editor" -ForegroundColor Gray
Write-Host "  3. Test PWA install on iOS Safari + Android Chrome" -ForegroundColor Gray
