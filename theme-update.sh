#!/bin/bash

# Theme Update Script: RED → NEON GREEN
# Converts all red accent colors to neon green throughout the codebase

echo "🎨 SpeedX Theme Updater: RED → NEON GREEN"
echo "==========================================="
echo ""

# Define color replacements
# RED: #E10600, bg-red-600, text-red-600, border-red-600
# GREEN: #00FF7F (neon green), bg-[#00FF7F], text-[#00FF7F], border-[#00FF7F]

# Files to update
FILES=$(find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -not -path "./raw-screenshots/*" \
  -not -path "./public/*")

echo "📝 Updating color palette..."
echo ""

# Counter
count=0

for file in $FILES; do
  # Check if file contains red colors
  if grep -q "#E10600\|bg-red-600\|text-red-600\|border-red-600\|from-red-600\|to-red-800\|hover:bg-red-700\|border-red-500" "$file"; then
    echo "   Updating: $file"
    
    # Replace hex color
    sed -i '' 's/#E10600/#00FF7F/g' "$file"
    
    # Replace Tailwind classes
    sed -i '' 's/bg-red-600/bg-[#00FF7F]/g' "$file"
    sed -i '' 's/text-red-600/text-[#00FF7F]/g' "$file"
    sed -i '' 's/border-red-600/border-[#00FF7F]/g' "$file"
    sed -i '' 's/from-red-600/from-[#00FF7F]/g' "$file"
    sed -i '' 's/to-red-800/to-[#10B981]/g' "$file"
    sed -i '' 's/hover:bg-red-700/hover:bg-[#10B981]/g' "$file"
    sed -i '' 's/border-red-500/border-[#00FF7F]/g' "$file"
    
    count=$((count + 1))
  fi
done

echo ""
echo "✅ Updated $count files"
echo ""
echo "🎨 Theme colors changed:"
echo "   RED (#E10600) → NEON GREEN (#00FF7F)"
echo ""
echo "🚀 Restart your dev server to see changes:"
echo "   npm run dev"
