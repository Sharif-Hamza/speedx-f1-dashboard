# 📱 Screenshot Workflow for SpeedX Dashboard

## 🚀 Quick Start

### Adding/Updating Screenshots

1. **Drop your iPhone screenshots** into the `raw-screenshots/` folder
2. **Run the processing script**:
   ```bash
   ./process-screenshots.sh
   ```
3. **Commit and push** (the processed images are in `public/screenshots/`)
   ```bash
   git add public/screenshots raw-screenshots
   git commit -m "Update app screenshots"
   git push
   ```

That's it! The dashboard will automatically show your new screenshots in a carousel.

---

## 📂 Folder Structure

```
├── raw-screenshots/          # Drop your PNG/JPG screenshots here
│   ├── IMG_0139.PNG         # Original high-res screenshots
│   ├── IMG_0140.PNG
│   └── ...
│
├── public/screenshots/       # Processed images (committed to git)
│   ├── screen-1.jpg         # Auto-generated, optimized for web
│   ├── screen-2.jpg
│   └── ...
│
└── process-screenshots.sh    # Processing script
```

---

## ⚙️ How It Works

1. **Local Processing**: The script resizes your screenshots to 400px width (perfect for the iPhone mock)
2. **Automatic Carousel**: The dashboard component cycles through images every 3 seconds
3. **Production Ready**: Processed images are committed and deployed to Netlify

---

## 🎨 Customization

### Change Carousel Speed
Edit `components/app-promo.tsx`:
```typescript
}, 3000) // Change to 5000 for 5 seconds
```

### Change Image Size
Edit `process-screenshots.sh`:
```bash
TARGET_WIDTH=400  # Change to desired width
```

---

## ✅ Current Status

✅ **6 screenshots processed and ready**
- screen-1.jpg (64KB)
- screen-2.jpg (29KB)
- screen-3.jpg (55KB)
- screen-4.jpg (38KB)
- screen-5.jpg (41KB)
- screen-6.jpg (30KB)

Total size: ~260KB (optimized for fast loading!)

---

## 🔥 Pro Tips

- **Keep originals**: The `raw-screenshots` folder is your backup
- **Optimize first**: The script automatically optimizes images to 85% quality JPG
- **Commit both**: Always commit both `raw-screenshots/` and `public/screenshots/`
- **Test locally**: Run `npm run dev` to see changes before deploying

---

## 🐛 Troubleshooting

**Script not working?**
```bash
chmod +x process-screenshots.sh
brew install imagemagick  # If not installed
```

**Images not showing?**
- Check `public/screenshots/` has the processed images
- Restart dev server (`npm run dev`)
- Clear browser cache

**Wrong order?**
- Rename files in `raw-screenshots/` alphabetically
- Re-run the script
