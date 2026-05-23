# XR Storybook

Immersive spatial storybook for Meta Quest 3S. Stories unfold as 3D scenes around you — characters, environments, and objects appear in your space as you read.

Built with [XR Blocks](https://github.com/google/xrblocks) (WebXR + Three.js).

## Quick Start

```bash
# Serve locally (any HTTP server works)
npx serve .

# Open in Chrome for simulator testing
# Or open in Quest Browser for XR
```

## How It Works

- Select a story from the menu
- 3D characters and environments appear around you
- **Pinch right hand** → next scene
- **Pinch left hand** → previous scene
- **Open palm** → return to menu
- In simulator: **click** to advance

## Architecture

```
app.js                  Main xb.Script controller
story/
├── StoryManager.js     Story state + navigation
├── SceneRenderer.js    3D scene spawning + transitions
└── stories.json        Pre-written stories with scene definitions
ui/
├── StoryPanel.js       Floating text panel
└── MenuPanel.js        Story selection menu
interaction/
└── GestureNav.js       Hand gesture navigation
models/
└── ProceduralModels.js Procedural 3D models (no external files)
```

## Adding Stories

Add entries to `story/stories.json`. Each story has scenes with text and model placements:

```json
{
  "text": "The knight entered the clearing...",
  "models": [
    { "file": "knight.glb", "position": [0, 0, -2], "scale": 0.5 }
  ],
  "ambient": { "color": "#2d5a27", "intensity": 0.8 }
}
```

Available models: `knight.glb`, `dragon.glb`, `tree.glb`, `cottage.glb`, `campfire.glb`

## Requirements

- Chrome 136+ (desktop simulator) or Quest Browser (XR)
- No build tools needed — ES modules via CDN
