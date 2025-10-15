#!/bin/bash

# Script to process iPhone screenshots for the SpeedX dashboard
# Place your 6 screenshots in the 'raw-screenshots' folder
# They will be processed and saved to 'public/screenshots'

echo "🖼️  Processing SpeedX App Screenshots..."

# Create directories if they don't exist
mkdir -p raw-screenshots
mkdir -p public/screenshots

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null
then
    echo "⚠️  ImageMagick not found."
    # Check if screenshots already exist (they're committed to git)
    if [ -f "public/screenshots/screen-1.jpg" ]; then
        echo "✅ Using existing processed screenshots from git"
        exit 0
    else
        echo "❌ No ImageMagick and no existing screenshots. Cannot process."
        exit 1
    fi
fi

# iPhone 16 Pro dimensions
# Full resolution: 1290 x 2796 (19.5:9 aspect ratio)
# We'll resize to 400px width to maintain quality and aspect ratio

TARGET_WIDTH=400

# Process each screenshot
counter=1
for file in raw-screenshots/*; do
    if [ -f "$file" ]; then
        echo "📱 Processing screenshot $counter: $(basename "$file")"
        
        # Get file extension
        extension="${file##*.}"
        
        # Resize maintaining aspect ratio
        if command -v magick &> /dev/null; then
            magick "$file" -resize ${TARGET_WIDTH}x -quality 85 "public/screenshots/screen-${counter}.jpg"
        else
            convert "$file" -resize ${TARGET_WIDTH}x -quality 85 "public/screenshots/screen-${counter}.jpg"
        fi
        
        echo "✅ Saved as screen-${counter}.jpg"
        counter=$((counter + 1))
    fi
done

echo ""
echo "🎉 Done! Processed $((counter - 1)) screenshots"
echo "📂 Screenshots saved to: public/screenshots/"
echo ""
echo "Next steps:"
echo "1. Check public/screenshots/ folder"
echo "2. Update app-promo.tsx to use these images"
