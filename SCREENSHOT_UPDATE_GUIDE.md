# Screenshot Update System

## ✅ What Was Done

### 1. Updated Components to Use New Screenshots
- **app-promo.tsx**: Dashboard app promo component now uses `/screenshots/screen-1.jpg` through `screen-6.jpg`
- **device-mockups.tsx**: Landing page iPhone mockup now uses the same `/screenshots/` folder
- Both components use **dynamic cache-busting** with `Date.now()` to force browser refresh
- Replaced Next.js `Image` component with regular `<img>` tags to bypass aggressive caching

### 2. Screenshot Processing Pipeline
```
raw-screenshots/        →    process-screenshots.sh    →    public/screenshots/
(PNG originals)              (ImageMagick resize)           (Optimized JPGs)
```

### 3. Files Structure
```
raw-screenshots/
├── IMG_0164.PNG (Map view with speed tracking)
├── IMG_0167.PNG (Dashboard view)
├── IMG_0168.PNG (Stats screen)
├── IMG_0169.PNG (Profile/settings)
├── IMG_0170.PNG (Leaderboard)
└── IMG_0171.PNG (Trip details)

public/screenshots/
├── screen-1.jpg (400px width, optimized)
├── screen-2.jpg
├── screen-3.jpg
├── screen-4.jpg
├── screen-5.jpg
└── screen-6.jpg
```

## 🚀 Netlify Build Process

### How It Works
1. **Git Push** triggers Netlify build
2. **prebuild script** runs: `chmod +x ./process-screenshots.sh && ./process-screenshots.sh`
3. Script checks for ImageMagick:
   - ✅ **If found**: Processes raw screenshots into optimized JPGs
   - ✅ **If not found**: Uses existing screenshots from git (already committed)
4. **Next.js build** runs with processed screenshots in `public/screenshots/`
5. Screenshots are deployed and served with cache-busting query params

### Why This Works
- **Screenshots are committed to git** ✅
- **Prebuild script is safe** - gracefully handles missing ImageMagick ✅
- **Cache-busting ensures fresh loads** - `Date.now()` changes on every build ✅
- **Laptop screenshot remains unchanged** - only iPhone mockup updated ✅

## 📝 How to Update Screenshots

### Local Development
```bash
# 1. Add new PNG screenshots to raw-screenshots/ folder
# 2. Run the update script
./update-screenshots.sh

# 3. Test locally
npm run dev

# 4. Commit and push
git add public/screenshots/ raw-screenshots/
git commit -m "Update app screenshots"
git push origin main
```

### Production (Netlify)
- **Automatic**: Push to main branch triggers rebuild
- **Manual**: Go to Netlify Dashboard → Trigger deploy

## 🔧 Troubleshooting

### Screenshots not updating locally?
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Screenshots not updating in browser?
- Hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+F5** (Windows)
- Clear browser cache

### Netlify build failing?
- Check build logs for errors
- Verify screenshots exist in `public/screenshots/` in git
- Ensure prebuild script has execute permissions

## 📊 Current Setup

| Location | Screenshots Used |
|----------|-----------------|
| Landing Page Hero (iPhone) | `/screenshots/screen-1.jpg` to `screen-6.jpg` |
| Landing Page Hero (Laptop) | `/mockups/laptop/Screenshot...` (unchanged) |
| Dashboard App Promo | `/screenshots/screen-1.jpg` to `screen-6.jpg` |

All screenshots use dynamic cache-busting: `?v=${Date.now()}`

## ✨ Benefits

1. **Real SpeedX App Screenshots** - Shows actual production app UI
2. **Automatic Processing** - Script handles resizing and optimization
3. **Cache-Proof** - Dynamic timestamps ensure users see latest images
4. **Netlify Compatible** - Works with or without ImageMagick in build environment
5. **Easy Updates** - Just replace files in `raw-screenshots/` and run script
