# Image Replacement Instructions

## Required Images

The following image placeholders need to be replaced with actual assets:

### 1. Favicon (Plugin Icon)
- **Location**: `/public/favicon.ico` or `/public/favicon.svg`
- **Current**: SVG placeholder with generic plug icon
- **Required**: The gold/white 3-prong plug image from the issue
- **Format**: ICO or SVG (32x32 minimum)
- **Source URL**: https://github.com/user-attachments/assets/0a0417c9-1864-465c-a886-d4d4716e956c

**Instructions**:
1. Download the plug icon image from the GitHub assets URL
2. Convert to ICO format (32x32, 64x64, 128x128 sizes) or save as SVG
3. Replace `/public/favicon.ico` with the actual image
4. Optionally update `/public/favicon.svg` if you have an SVG version

### 2. Hero Image
- **Location**: `/public/assets/hero-image.png`
- **Current**: Not present (will show fallback emoji)
- **Required**: The purple/pink headphones and camera image
- **Format**: PNG (recommended 1200x1200 or similar aspect ratio)
- **Source URL**: https://github.com/user-attachments/assets/6adbb06b-12e7-4021-af89-9c00bdabc386

**Instructions**:
1. Download the hero image from the GitHub assets URL
2. Save it as `/public/assets/hero-image.png`
3. Optimize the image (compress if needed, aim for <500KB)
4. The Hero component is already configured to use this image

## Verification

After adding the images:

1. **Favicon**: Check browser tab - should show the plug icon
2. **Hero**: Visit homepage - should show headphones/camera image instead of emoji
3. **Open Graph**: Test social media sharing - should use hero image

## Notes

- The code is already configured to use these images
- Fallbacks are in place if images are missing
- All other image references have been updated to use proper paths
- SEO metadata is configured to reference these images
