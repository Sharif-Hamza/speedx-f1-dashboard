#!/bin/bash

# Netlify build script to process screenshots
# This runs automatically during Netlify builds

echo "🖼️  Processing SpeedX App Screenshots for production..."

# Check if raw-screenshots directory exists and has files
if [ ! -d "raw-screenshots" ] || [ -z "$(ls -A raw-screenshots 2>/dev/null)" ]; then
    echo "ℹ️  No screenshots to process, using existing ones"
    exit 0
fi

# Check if ImageMagick is available on Netlify
if ! command -v convert &> /dev/null && ! command -v magick &> /dev/null; then
    echo "⚠️  ImageMagick not available in Netlify environment"
    echo "ℹ️  Please process screenshots locally before pushing"
    exit 0
fi

# Create output directory
mkdir -p public/screenshots

# Target width for iPhone mock
TARGET_WIDTH=400

# Process each screenshot
counter=1
for file in raw-screenshots/*; do
    if [ -f "$file" ]; then
        echo "📱 Processing: $(basename "$file")"
        
        # Resize with ImageMagick
        if command -v magick &> /dev/null; then
            magick "$file" -resize ${TARGET_WIDTH}x -quality 85 "public/screenshots/screen-${counter}.jpg"
        else
            convert "$file" -resize ${TARGET_WIDTH}x -quality 85 "public/screenshots/screen-${counter}.jpg"
        fi
        
        if [ $? -eq 0 ]; then
            echo "✅ Saved as screen-${counter}.jpg"
        fi
        
        counter=$((counter + 1))
    fi
done

echo "🎉 Processed $((counter - 1)) screenshots for production"
