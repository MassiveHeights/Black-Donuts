# Black Donuts
Simple demo app to show some of Black Engine features:
- AssetManager to preload assets
- Multi resolution (works on any device and both orientations)
- Battery consumption on static scenes
- Auto updateable cache as bitmap
- Clipping rectangle (works for cacheAsBitmap objects)
- Rich text support (baseline alignment, drop shadow, stroke, styles)
- Particle system


# Setup
Start by cloning this repo onto local computer:
```
git clone https://github.com/MassiveHeights/Black-Donuts.git
cd Black-Donuts
npm install
```

# Development server
This template provides ability to run development server on port 4245 to do so run `npm start` in the terminal 
then open a browser and navigate to `http://127.0.0.1:4245`.

## Watch and rebuild
All files inside `sheets`, `textures`, `fonts`, `html`, `spine` and `audio` folders will be automatically copied into `dist` folder when changed.

# Production build
For better compatibility and faster loading times please use production build eg `npm run bundle`.