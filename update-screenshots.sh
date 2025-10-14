#!/bin/bash

# Quick update script - Run this whenever you add new screenshots!
# Usage: ./update-screenshots.sh

echo "📱 SpeedX Screenshot Updater"
echo "=============================="
echo ""

# Process screenshots
./process-screenshots.sh

if [ $? -ne 0 ]; then
    echo "❌ Processing failed!"
    exit 1
fi

echo ""
echo "📸 Checking processed images..."
ls -lh public/screenshots/

echo ""
echo "✅ All done! Your screenshots are ready."
echo ""
echo "Next steps:"
echo "  1. Test locally: npm run dev"
echo "  2. Commit changes: git add . && git commit -m 'Update screenshots'"
echo "  3. Deploy: git push"
echo ""
echo "🚀 Your dashboard will auto-update on Netlify!"
