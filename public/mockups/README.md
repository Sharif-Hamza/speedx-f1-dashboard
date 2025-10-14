# Device Mockup Images

This folder contains images that will be displayed in the device mockups on the homepage.

## Folder Structure

```
mockups/
├── iphone/     # iPhone 16 screenshots (iOS SpeedX app)
├── ipad/       # iPad screenshots (iOS SpeedX app, larger format)
└── laptop/     # Laptop screenshots (F1 Dashboard)
```

## How to Add Images

### iPhone Images
1. Navigate to `/public/mockups/iphone/`
2. Add your iPhone app screenshots here
3. **Recommended size:** 1170 x 2532 pixels (iPhone 16 Pro resolution)
4. **Format:** JPG, PNG, or WebP
5. **Naming:** Use descriptive names like `screen-1.jpg`, `screen-2.jpg`, etc.

### iPad Images
1. Navigate to `/public/mockups/ipad/`
2. Add your iPad app screenshots here
3. **Recommended size:** 2048 x 2732 pixels (iPad Pro 12.9" resolution)
4. **Format:** JPG, PNG, or WebP
5. **Naming:** Use descriptive names like `ipad-screen-1.jpg`, etc.
6. **Note:** These should show the iOS app on a larger screen

### Laptop Images
1. Navigate to `/public/mockups/laptop/`
2. Add screenshots of the F1 Dashboard here
3. **Recommended size:** 1920 x 1080 pixels (or 16:9 aspect ratio)
4. **Format:** JPG, PNG, or WebP
5. **Naming:** Use descriptive names like `dashboard-1.jpg`, `dashboard-2.jpg`, etc.
6. **Note:** These should be screenshots of the web dashboard at `/dashboard`

## Features

- ✅ **Auto-rotation:** Images cycle every 4 seconds
- ✅ **Dynamic loading:** All images in each folder are automatically detected
- ✅ **No code changes needed:** Just drop images into the appropriate folder
- ✅ **Supports multiple formats:** JPG, JPEG, PNG, WebP
- ✅ **Sorted alphabetically:** Images display in alphabetical order by filename

## Tips

1. **Optimize images** before uploading (use tools like TinyPNG or ImageOptim)
2. **Keep consistent aspect ratios** within each device category
3. **Use high-quality screenshots** for best visual impact
4. **Remove sensitive data** from screenshots before adding
5. **Test on localhost** after adding new images to verify they appear correctly

## Current Status

- ✅ iPhone folder: Already populated with 6 screenshots from `/screenshots/`
- ⏳ iPad folder: **Empty - Add your iPad-formatted screenshots here**
- ⏳ Laptop folder: **Empty - Add your F1 Dashboard screenshots here**

## Example File Names

### iPhone
- `screen-1.jpg`
- `screen-2.jpg`
- `screen-3.jpg`
- etc.

### iPad
- `ipad-home.jpg`
- `ipad-tracking.jpg`
- `ipad-stats.jpg`
- etc.

### Laptop
- `dashboard-overview.jpg`
- `dashboard-stats.jpg`
- `dashboard-leaderboard.jpg`
- etc.

## Technical Details

Images are served via the `/api/mockup-images?device={deviceType}` API route and displayed in the `<DeviceMockups />` component on the homepage hero section.
