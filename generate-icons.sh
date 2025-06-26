#!/bin/bash
# generate-icons.sh - Convert SVG to PNG icons for Chrome extension

# First, save the SVG (copy from artifact above and paste into icon.svg)
cat > icon.svg << 'EOF'
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="64" r="60" fill="#3B82F6"/>
  <g transform="translate(-8, 0)">
    <ellipse cx="50" cy="55" rx="28" ry="32" fill="white" opacity="0.95"/>
    <circle cx="42" cy="48" r="3" fill="#3B82F6"/>
    <circle cx="58" cy="48" r="3" fill="#3B82F6"/>
    <path d="M 38 62 Q 50 70 62 62" stroke="#3B82F6" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>
  <g transform="translate(8, 8)">
    <ellipse cx="70" cy="60" rx="28" ry="32" fill="white" opacity="0.95"/>
    <circle cx="62" cy="53" r="3" fill="#3B82F6"/>
    <circle cx="78" cy="53" r="3" fill="#3B82F6"/>
    <line x1="60" y1="70" x2="80" y2="70" stroke="#3B82F6" stroke-width="3" stroke-linecap="round"/>
  </g>
  <g transform="translate(85, 25)">
    <path d="M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z" fill="#FFD700" opacity="0.9"/>
  </g>
</svg>
EOF

# Method 1: Using ImageMagick (if installed)
if command -v convert &> /dev/null; then
    echo "Using ImageMagick to generate icons..."
    mkdir -p src/icons
    convert -background none icon.svg -resize 16x16 src/icons/icon16.png
    convert -background none icon.svg -resize 48x48 src/icons/icon48.png
    convert -background none icon.svg -resize 128x128 src/icons/icon128.png
    echo "✅ Icons generated with ImageMagick"

# Method 2: Using Inkscape (if installed)
elif command -v inkscape &> /dev/null; then
    echo "Using Inkscape to generate icons..."
    mkdir -p src/icons
    inkscape icon.svg -w 16 -h 16 -o src/icons/icon16.png
    inkscape icon.svg -w 48 -h 48 -o src/icons/icon48.png
    inkscape icon.svg -w 128 -h 128 -o src/icons/icon128.png
    echo "✅ Icons generated with Inkscape"

# Method 3: Using rsvg-convert (if installed)
elif command -v rsvg-convert &> /dev/null; then
    echo "Using rsvg-convert to generate icons..."
    mkdir -p src/icons
    rsvg-convert -w 16 -h 16 icon.svg > src/icons/icon16.png
    rsvg-convert -w 48 -h 48 icon.svg > src/icons/icon48.png
    rsvg-convert -w 128 -h 128 icon.svg > src/icons/icon128.png
    echo "✅ Icons generated with rsvg-convert"

else
    echo "❌ No image conversion tool found!"
    echo ""
    echo "Please install one of these tools:"
    echo "  - ImageMagick: sudo apt install imagemagick"
    echo "  - Inkscape: sudo apt install inkscape"
    echo "  - librsvg: sudo apt install librsvg2-bin"
    echo ""
    echo "Or use an online converter:"
    echo "  - https://cloudconvert.com/svg-to-png"
    echo "  - https://svgtopng.com/"
fi

# Clean up
rm -f icon.svg

# Update manifest to include all icon sizes
if [ -f "src/manifest.json" ]; then
    echo ""
    echo "📝 Don't forget to update your manifest.json:"
    echo '"icons": {'
    echo '  "16": "icons/icon16.png",'
    echo '  "48": "icons/icon48.png",'
    echo '  "128": "icons/icon128.png"'
    echo '}'
fi