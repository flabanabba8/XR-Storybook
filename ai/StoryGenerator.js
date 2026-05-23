import { GeminiClient } from './GeminiClient.js';

const MODEL_EXAMPLES = `
EXAMPLE MODEL CODE (for reference — create similar but unique objects):

// A simple character (humanoid)
const g = new THREE.Group();
const body = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.15), new THREE.MeshStandardMaterial({color: 0x4444aa}));
body.position.y = 0.5;
g.add(body);
const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), new THREE.MeshStandardMaterial({color: 0xf5d0a9}));
head.position.y = 0.8;
g.add(head);
const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), new THREE.MeshStandardMaterial({color: 0x333333}));
leg1.position.set(-0.06, 0.15, 0);
g.add(leg1);
const leg2 = leg1.clone();
leg2.position.x = 0.06;
g.add(leg2);
return g;

// A tree
const g = new THREE.Group();
const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.5, 8), new THREE.MeshStandardMaterial({color: 0x5a3a1a}));
trunk.position.y = 0.25;
g.add(trunk);
const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshStandardMaterial({color: 0x2d6b30}));
leaves.position.y = 0.6;
g.add(leaves);
return g;

// A glowing object
const g = new THREE.Group();
const orb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), new THREE.MeshStandardMaterial({color: 0x44aaff, emissive: 0x2266ff, emissiveIntensity: 0.8}));
g.add(orb);
const light = new THREE.PointLight(0x4488ff, 1.5, 3);
g.add(light);
return g;

AVAILABLE GEOMETRIES: BoxGeometry, SphereGeometry, CylinderGeometry, ConeGeometry, PlaneGeometry, TorusGeometry, CircleGeometry, RingGeometry, ExtrudeGeometry, ShapeGeometry
AVAILABLE MATERIALS: MeshStandardMaterial (color, metalness, roughness, emissive, emissiveIntensity, transparent, opacity, side), MeshBasicMaterial
LIGHTS: PointLight(color, intensity, distance)
TIPS: Use g.add() to compose. Clone with .clone(). Position with .position.set(x,y,z). Rotate with .rotation.set(x,y,z). Scale with .scale.set(x,y,z). Use THREE.DoubleSide for flat objects.`;

const GENERATE_PROMPT = `You are a spatial storytelling engine that creates 3D scenes using Three.js code.

Generate a short story (4-6 scenes) with CUSTOM procedural 3D models for an XR storybook app.

THEME: {THEME}

For each unique object in the story, write Three.js JavaScript code that builds it from primitives.
The code receives THREE as a parameter and must return a THREE.Group.

${MODEL_EXAMPLES}

Return ONLY valid JSON matching this schema:
{
  "id": "unique-kebab-case-id",
  "title": "Story Title",
  "description": "One sentence description",
  "models": {
    "model-name": "const g = new THREE.Group(); /* Three.js code */ return g;",
    "another-model": "const g = new THREE.Group(); /* ... */ return g;"
  },
  "scenes": [
    {
      "text": "2-4 sentences of vivid narrative.",
      "objects": [
        { "model": "model-name", "position": [0, 0, -2], "scale": 0.5, "rotation": [0, 0, 0] }
      ],
      "ambient": { "color": "#hexcolor", "intensity": 0.8 }
    }
  ]
}

RULES:
- Create 4-8 unique models per story. Be creative — animals, vehicles, buildings, magic effects, food, anything.
- Model code must use ONLY Three.js primitives (no external assets, no images, no loaders)
- Position objects: x from -2 to 2, z from -1.5 to -4, y usually 0 (ground level)
- Scale 0.3-1.5 for most objects
- Each scene: 2-5 objects
- Make models detailed but not overly complex (10-30 meshes per model max)
- Use emissive materials for glowing/magical effects
- Use PointLight for objects that should illuminate their surroundings
- Make the story entertaining, surprising, and complete`;

const CONTINUE_PROMPT = `You are narrating an interactive XR story with custom 3D scenes.

STORY SO FAR:
{STORY_SO_FAR}

PREVIOUSLY DEFINED MODELS (reuse these by name, or define new ones):
{EXISTING_MODELS}

USER'S CHOICE: {CHOICE}

${MODEL_EXAMPLES}

Generate the NEXT SCENE. Return valid JSON:
{
  "text": "2-4 sentences continuing the story based on the user's choice.",
  "newModels": {
    "new-model-name": "const g = new THREE.Group(); /* code */ return g;"
  },
  "objects": [
    { "model": "model-name", "position": [x, 0, z], "scale": 0.5, "rotation": [0, y, 0] }
  ],
  "ambient": { "color": "#hexcolor", "intensity": 0.5 },
  "choices": ["Choice A", "Choice B"]
}

If the story should end, omit "choices".
You can reference previously defined models by name OR define new ones in "newModels".`;

export class StoryGenerator {
  constructor(apiKey) {
    this.client = new GeminiClient(apiKey);
  }

  async generateStory(theme) {
    const prompt = GENERATE_PROMPT.replace('{THEME}', theme);
    const json = await this.client.generate(prompt, { maxTokens: 8192 });

    let story;
    try {
      story = JSON.parse(json);
    } catch (e) {
      console.error('Failed to parse Gemini response:', json.substring(0, 500));
      throw new Error('AI returned invalid format. Try again.');
    }

    if (!story.scenes || !Array.isArray(story.scenes) || story.scenes.length === 0) {
      throw new Error('AI story has no scenes. Try again.');
    }
    if (!story.id) story.id = 'ai-' + Date.now();
    if (!story.title) story.title = 'AI Story';
    if (!story.description) story.description = 'An AI-generated adventure';
    if (!story.models) story.models = {};

    return story;
  }

  async continueStory(storySoFar, choice, existingModelNames) {
    const prompt = CONTINUE_PROMPT
      .replace('{STORY_SO_FAR}', storySoFar)
      .replace('{CHOICE}', choice)
      .replace('{EXISTING_MODELS}', existingModelNames.join(', '));
    const json = await this.client.generate(prompt, { maxTokens: 4096 });

    try {
      return JSON.parse(json);
    } catch (e) {
      throw new Error('AI returned invalid scene format. Try again.');
    }
  }
}

export const STORY_THEMES = [
  { id: 'fantasy', label: 'Epic Fantasy', prompt: 'An epic fantasy adventure with unique creatures, magical artifacts, and enchanted locations. Create custom 3D models for each.' },
  { id: 'scifi', label: 'Sci-Fi', prompt: 'A science fiction story with spaceships, robots, alien planets, and futuristic technology. Create detailed sci-fi models.' },
  { id: 'comedy', label: 'Anime Comedy', prompt: 'A hilarious anime-style comedy with exaggerated characters, school setting, and dramatic reactions. Custom character models.' },
  { id: 'mystery', label: 'Dark Mystery', prompt: 'A mysterious, atmospheric story with eerie locations, clues, and a twist ending. Create moody, detailed models.' },
  { id: 'underwater', label: 'Underwater', prompt: 'An underwater adventure with sea creatures, coral reefs, submarines, and sunken treasures. Create colorful ocean models.' },
  { id: 'steampunk', label: 'Steampunk', prompt: 'A steampunk adventure with clockwork machines, airships, brass robots, and Victorian architecture. Create intricate mechanical models.' }
];
