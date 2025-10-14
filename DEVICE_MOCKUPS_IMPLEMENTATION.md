# Device Mockups Implementation Guide

## 🎉 What Was Built

A dynamic device mockup showcase on the homepage that displays:
- **iPhone 16 Pro** mockup (center, front) - Shows iOS SpeedX app
- **iPad Pro** mockup (right, background) - Shows iOS SpeedX app on larger screen
- **MacBook** mockup (left, background) - Shows F1 Dashboard web app

## 📁 Folder Structure Created

```
public/
└── mockups/
    ├── iphone/    ✅ Populated with 6 screenshots
    ├── ipad/      ⏳ Empty - ready for your iPad screenshots
    ├── laptop/    ⏳ Empty - ready for your Dashboard screenshots
    └── README.md  📖 Detailed instructions
```

## 🚀 Features

### Auto-Rotation
- Images automatically cycle every 4 seconds
- Each device rotates through its own set of images independently
- Smooth transitions between images

### Dynamic Image Loading
- API route automatically detects all images in each folder
- No code changes needed when adding new images
- Just drop images into the appropriate folder

### Visual Indicators
- Dot indicators below iPhone showing which screenshot is active
- Interactive - click dots to jump to specific screenshot
- Device labels at bottom showing which device is which

### Responsive Design
- Devices positioned in layered 3D-style layout
- iPhone in center (highest priority)
- iPad and Laptop fade slightly in background
- Hover effects to highlight each device

## 📝 How to Add Images

### For iPhone Screenshots (Already Done ✅)
Location: `/public/mockups/iphone/`
- ✅ Already contains 6 screenshots copied from `/screenshots/`
- Ready to use immediately

### For iPad Screenshots
Location: `/public/mockups/ipad/`

1. Navigate to the folder:
   ```bash
   cd "/Users/areen/Desktop/SYNKR 2/speedx-f1-dashboard (1)/public/mockups/ipad/"
   ```

2. Add your iPad app screenshots:
   - **Recommended size:** 2048 x 2732 pixels (iPad Pro)
   - **Format:** JPG, PNG, or WebP
   - **Example names:** `ipad-screen-1.jpg`, `ipad-screen-2.jpg`, etc.

3. Images will automatically appear after page refresh!

### For Laptop/Dashboard Screenshots
Location: `/public/mockups/laptop/`

1. Navigate to the folder:
   ```bash
   cd "/Users/areen/Desktop/SYNKR 2/speedx-f1-dashboard (1)/public/mockups/laptop/"
   ```

2. Take screenshots of your F1 Dashboard:
   - Open `http://localhost:3000/dashboard`
   - Take screenshots of different sections
   - Save as JPG or PNG

3. Add screenshots to the laptop folder:
   - **Recommended size:** 1920 x 1080 pixels (16:9 ratio)
   - **Format:** JPG, PNG, or WebP
   - **Example names:** `dashboard-1.jpg`, `dashboard-2.jpg`, etc.

4. Images will automatically appear after page refresh!

## 🔧 Technical Components Created

### 1. `components/device-mockups.tsx`
- Main React component rendering all three devices
- Handles image rotation and state management
- Responsive and interactive

### 2. `app/api/mockup-images/route.ts`
- API endpoint to fetch images from each device folder
- Returns list of available images for iPhone, iPad, or Laptop
- URL: `/api/mockup-images?device={iphone|ipad|laptop}`

### 3. Updated `components/sections/hero.tsx`
- Replaced static phone image with dynamic `<DeviceMockups />` component
- Hero section now shows all three devices

## 🎨 Device Specifications

### iPhone 16 Pro Mockup
- **Dimensions:** 280px × 570px
- **Features:** 
  - Dynamic Island at top
  - Realistic bezels
  - Side buttons
  - Rounded corners (3rem)
  - Dark titanium gradient frame

### iPad Pro Mockup
- **Dimensions:** 360px × 480px
- **Features:**
  - Front camera at top center
  - Thin bezels
  - Rounded corners (2.5rem)
  - Dark aluminum frame

### MacBook Mockup
- **Dimensions:** 520px × 320px (total with base)
- **Screen:** 520px × 280px
- **Features:**
  - Realistic laptop screen
  - Keyboard base with trackpad indent
  - Screen bezels
  - Professional gray finish

## 📊 Current Status

| Device | Status | Images | Action Needed |
|--------|--------|--------|---------------|
| iPhone | ✅ Ready | 6 screenshots | None - Already working! |
| iPad | ⏳ Pending | 0 | Add iPad-formatted app screenshots |
| Laptop | ⏳ Pending | 0 | Add F1 Dashboard screenshots |

## 🧪 Testing

1. Start the dev server:
   ```bash
   cd "/Users/areen/Desktop/SYNKR 2/speedx-f1-dashboard (1)"
   npm run dev
   ```

2. Open the homepage:
   ```
   http://localhost:3000
   ```

3. You should see:
   - ✅ iPhone mockup in center with rotating screenshots
   - ⏳ iPad mockup on right (will appear once you add images)
   - ⏳ Laptop mockup on left (will appear once you add images)

## 📸 How to Take Dashboard Screenshots

### Method 1: Browser Screenshot
1. Open `/dashboard` in browser
2. Make sure you're logged in and viewing the dashboard
3. Use browser dev tools:
   - Chrome: Cmd+Shift+P → "Capture screenshot"
   - Or use macOS: Cmd+Shift+4 → drag to select window

### Method 2: Full-Page Screenshot
1. Open dashboard
2. Zoom to 100%
3. Take screenshot of entire browser window
4. Crop to just the dashboard content

### Recommended Dashboard Views to Screenshot:
- Main dashboard overview
- Leaderboards section
- Statistics/analytics
- User management panel
- Live activity feed

## 🎯 Next Steps

1. **Add iPad Screenshots:**
   - Drag iPad-formatted iOS app screenshots into `/public/mockups/ipad/`

2. **Add Laptop Screenshots:**
   - Take screenshots of F1 Dashboard
   - Drag into `/public/mockups/laptop/`

3. **Test:**
   - Refresh homepage
   - Verify all three devices show images
   - Check auto-rotation is working

4. **Optimize:**
   - Use image optimization tools (TinyPNG, ImageOptim)
   - Keep file sizes reasonable for fast loading

## 🔍 Troubleshooting

### Images not showing?
- Check file names don't have special characters
- Verify files are JPG, PNG, or WebP format
- Refresh browser with Cmd+Shift+R (hard refresh)
- Check browser console for errors

### Images not rotating?
- Make sure you have more than 1 image in the folder
- Check dev console for JavaScript errors
- Verify API route is working: `/api/mockup-images?device=iphone`

### Wrong aspect ratio?
- Resize images before adding
- iPhone: Portrait (9:19.5 ratio)
- iPad: Portrait (4:3 ratio)  
- Laptop: Landscape (16:9 ratio)

## ✨ Benefits

- ✅ **No code changes needed** - Just add images
- ✅ **Automatic detection** - Scans folders for images
- ✅ **Professional look** - Realistic device mockups
- ✅ **Multi-device showcase** - Shows app on phone, tablet, and desktop
- ✅ **Dynamic content** - Easy to update anytime
- ✅ **Auto-rotating** - Showcases multiple features

## 📚 File Locations Reference

```
speedx-f1-dashboard (1)/
├── components/
│   └── device-mockups.tsx          # Main mockup component
├── components/sections/
│   └── hero.tsx                    # Updated to use mockups
├── app/api/mockup-images/
│   └── route.ts                    # API to fetch images
└── public/
    └── mockups/
        ├── iphone/                 # ✅ 6 images
        ├── ipad/                   # ⏳ Add yours
        ├── laptop/                 # ⏳ Add yours
        └── README.md               # Instructions
```

---

**Ready to go!** Just add your iPad and Laptop screenshots to complete the showcase! 🚀
