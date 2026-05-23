import { GeminiClient } from './GeminiClient.js';

const AVAILABLE_MODELS = [
  'knight.glb', 'dragon.glb', 'tree.glb', 'cottage.glb', 'campfire.glb',
  'anime-protag.glb', 'tsundere.glb', 'rival.glb', 'school.glb',
  'cherry-tree.glb', 'ramen.glb', 'katana.glb', 'explosion.glb'
];

const GENERATE_PROMPT = `You are a spatial storytelling engine. Generate a short story with 4-6 scenes for an XR (augmented reality) storybook app.

AVAILABLE 3D MODELS (use ONLY these exact filenames):
${AVAILABLE_MODELS.map(m => `- ${m}`).join('\n')}

THEME: {THEME}

Return ONLY valid JSON matching this exact schema:
{
  "id": "unique-kebab-case-id",
  "title": "Story Title",
  "description": "One sentence description",
  "scenes": [
    {
      "text": "2-4 sentences of narrative. Vivid, engaging, with personality.",
      "models": [
        { "file": "model-name.glb", "position": [x, 0, z], "scale": 0.5, "rotation": [0, y, 0] }
      ],
      "ambient": { "color": "#hexcolor", "intensity": 0.5 }
    }
  ]
}

RULES:
- Use ONLY models from the list above. Do not invent model filenames.
- Position models in front of the user: x between -2 and 2, z between -1.5 and -4
- y position is usually 0 (ground level). Dragons/flying things can be 0.5-2.0
- Scale: 0.3-1.5 for most objects
- Each scene should have 2-5 models
- Ambient color sets the mood: warm oranges for day, deep blues for night, reds for danger
- Make the story entertaining, surprising, and complete (beginning, middle, end)
- Keep text concise — this is read in a headset`;

const CONTINUE_PROMPT = `You are narrating an interactive XR story. The user just made a choice.

STORY SO FAR:
{STORY_SO_FAR}

USER'S CHOICE: {CHOICE}

AVAILABLE 3D MODELS (use ONLY these exact filenames):
${AVAILABLE_MODELS.map(m => `- ${m}`).join('\n')}

Generate the NEXT SCENE only. Return valid JSON:
{
  "text": "2-4 sentences continuing the story based on the user's choice.",
  "models": [
    { "file": "model-name.glb", "position": [x, 0, z], "scale": 0.5, "rotation": [0, y, 0] }
  ],
  "ambient": { "color": "#hexcolor", "intensity": 0.5 },
  "choices": ["Choice A description", "Choice B description"]
}

If the story should end after this scene, omit the "choices" field.
Keep it fun and reactive to the user's choice.`;

export class StoryGenerator {
  constructor(apiKey) {
    this.client = new GeminiClient(apiKey);
  }

  async generateStory(theme) {
    const prompt = GENERATE_PROMPT.replace('{THEME}', theme);
    const json = await this.client.generate(prompt);
    let story;
    try {
      story = JSON.parse(json);
    } catch (e) {
      throw new Error('AI returned invalid story format. Try again.');
    }

    if (!story.scenes || !Array.isArray(story.scenes) || story.scenes.length === 0) {
      throw new Error('AI story has no scenes. Try again.');
    }
    if (!story.id) story.id = 'ai-' + Date.now();
    if (!story.title) story.title = 'AI Story';
    if (!story.description) story.description = 'An AI-generated adventure';

    // Validate model references
    for (const scene of story.scenes) {
      if (!scene.models) scene.models = [];
      scene.models = scene.models.filter(m => AVAILABLE_MODELS.includes(m.file));
      if (!scene.text) scene.text = '...';
    }

    return story;
  }

  async continueStory(storySoFar, choice) {
    const prompt = CONTINUE_PROMPT
      .replace('{STORY_SO_FAR}', storySoFar)
      .replace('{CHOICE}', choice);
    const json = await this.client.generate(prompt);
    try {
      return JSON.parse(json);
    } catch (e) {
      throw new Error('AI returned invalid scene format. Try again.');
    }
  }
}

export const STORY_THEMES = [
  { id: 'fantasy', label: 'Epic Fantasy', prompt: 'An epic fantasy adventure with knights, dragons, and magic. Make it dramatic and exciting.' },
  { id: 'comedy', label: 'Anime Comedy', prompt: 'A hilarious anime-style comedy with every trope possible. School setting, tsundere, rival, dramatic reactions.' },
  { id: 'mystery', label: 'Dark Mystery', prompt: 'A mysterious, atmospheric story set in a dark forest with a cottage and campfire. Something lurks in the shadows.' },
  { id: 'romance', label: 'Awkward Romance', prompt: 'An awkward romantic comedy between a knight and a dragon who are both too shy to admit their feelings. Cherry blossoms everywhere.' },
  { id: 'horror', label: 'Campfire Horror', prompt: 'A creepy campfire story that gets increasingly unsettling. Forest at night, strange sounds, something watching.' },
  { id: 'custom', label: '✨ Custom Theme', prompt: null }
];
