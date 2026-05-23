import * as THREE from 'three';
import * as xb from 'xrblocks';
import { StoryManager } from './story/StoryManager.js';
import { SceneRenderer } from './story/SceneRenderer.js';
import { StoryPanel } from './ui/StoryPanel.js';
import { MenuPanel } from './ui/MenuPanel.js';
import { StoryGenerator, STORY_THEMES } from './ai/StoryGenerator.js';

const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);

class StoryBookApp extends xb.Script {

  async init() {
    await super.init();

    // Lighting
    this.add(new THREE.AmbientLight(0x404060, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(2, 4, 2);
    this.add(dirLight);

    // Story system
    this.storyManager = new StoryManager();
    await this.storyManager.load();

    // AI story generator (key from localStorage or URL param)
    this.apiKey = localStorage.getItem('gemini_key')
      || new URLSearchParams(window.location.search).get('key')
      || null;
    this.generator = this.apiKey ? new StoryGenerator(this.apiKey) : null;

    // Scene renderer
    this.sceneRenderer = new SceneRenderer(this);

    // UI
    this.storyPanel = new StoryPanel();
    this.add(this.storyPanel);

    this.menuPanel = new MenuPanel();
    this.add(this.menuPanel);

    this.showMainMenu();

    this.inStory = false;
    this.mode = 'menu'; // 'menu' | 'themes' | 'story' | 'generating' | 'choices'
    this.menuIndex = 0;
    this.pendingAction = null;

    // Interactive story state
    this.interactiveHistory = '';
    this.interactiveTitle = '';
    this.currentChoices = null;
    this.choiceIndex = 0;
  }

  update() {
    if (this.inStory) {
      this.sceneRenderer.updateAnimations(performance.now());
    }
  }

  showMainMenu() {
    // Re-check for API key (may have been entered on setup screen after init)
    if (!this.generator) {
      const key = localStorage.getItem('gemini_key');
      if (key) {
        this.generator = new StoryGenerator(key);
      }
    }

    this.mode = 'menu';
    this.menuIndex = 0;
    const items = this.getMenuItems();
    this.menuPanel.buildMenu(items);
    this.storyPanel.hide();
  }

  getMenuItems() {
    const items = this.storyManager.getStoryList().map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      action: 'story'
    }));

    if (this.generator) {
      items.push({
        id: 'ai-generate',
        title: '✨ AI Generate Story',
        description: 'Gemini creates a new story just for you',
        action: 'generate'
      });
      items.push({
        id: 'ai-interactive',
        title: '🎲 Interactive Adventure',
        description: 'Make choices as Gemini narrates live',
        action: 'interactive'
      });
    }

    return items;
  }

  showThemeMenu() {
    this.mode = 'themes';
    this.menuIndex = 0;
    const items = STORY_THEMES.filter(t => t.id !== 'custom').map(t => ({
      id: t.id,
      title: t.label,
      description: t.prompt.substring(0, 60) + '...',
      action: 'theme'
    }));
    this.menuPanel.buildMenu(items);
  }

  onSelectEnd(event) {
    if (this.mode === 'generating') return; // ignore during generation

    if (this.mode === 'menu') {
      const items = this.getMenuItems();
      const item = items[this.menuIndex % items.length];
      this.menuIndex = (this.menuIndex + 1) % items.length;

      if (!item) return;

      if (item.action === 'story') {
        this.startStory(item.id);
      } else if (item.action === 'generate' || item.action === 'interactive') {
        this.pendingAction = item.action;
        this.showThemeMenu();
      }
    } else if (this.mode === 'themes') {
      const themes = STORY_THEMES.filter(t => t.id !== 'custom');
      const theme = themes[this.menuIndex % themes.length];
      this.menuIndex = (this.menuIndex + 1) % themes.length;

      if (this.pendingAction === 'generate') {
        this.generateStory(theme.prompt);
      } else if (this.pendingAction === 'interactive') {
        this.startInteractive(theme.prompt);
      }
    } else if (this.mode === 'choices') {
      // Select current choice
      if (this.currentChoices) {
        const choice = this.currentChoices[this.choiceIndex % this.currentChoices.length];
        this.choiceIndex = (this.choiceIndex + 1) % this.currentChoices.length;
        this.continueInteractive(choice);
      }
    } else if (this.mode === 'story') {
      this.nextScene();
    }
  }

  async generateStory(theme) {
    this.mode = 'generating';
    this.menuPanel.hide();
    this.storyPanel.showMessage('✨ Gemini is crafting your story...');

    try {
      const story = await this.generator.generateStory(theme);
      // Register AI-generated model code
      this.sceneRenderer.clearAIModels();
      this.sceneRenderer.registerAIModels(story.models);
      // Convert AI format to standard format for StoryManager
      for (const scene of story.scenes) {
        if (scene.objects && !scene.models) {
          scene.models = scene.objects;
        }
      }
      this.storyManager.addStory(story);
      this.storyPanel.hide();
      this.startStory(story.id);
    } catch (e) {
      console.error('Story generation failed:', e);
      this.mode = 'menu';
      this.storyPanel.showMessage(`Error: ${e.message}`);
      setTimeout(() => this.showMainMenu(), 3000);
    }
  }

  async startInteractive(theme) {
    this.mode = 'generating';
    this.menuPanel.hide();
    this.storyPanel.showMessage('🎲 Gemini is setting the scene...');
    this.interactiveHistory = '';

    try {
      const story = await this.generator.generateStory(theme);
      this.sceneRenderer.clearAIModels();
      this.sceneRenderer.registerAIModels(story.models);

      const scene = story.scenes[0];
      this.interactiveHistory = scene.text;

      await this.sceneRenderer.renderScene(scene);
      this.inStory = true;

      const choices = scene.choices || ['Continue the adventure', 'Take a different path'];
      this.storyPanel.showInteractive(scene.text, story.title, choices);
      this.currentChoices = choices;
      this.choiceIndex = 0;
      this.interactiveTitle = story.title;
      this.mode = 'choices';
    } catch (e) {
      console.error('Interactive start failed:', e);
      this.mode = 'menu';
      this.storyPanel.showMessage(`Error: ${e.message}`);
      setTimeout(() => this.showMainMenu(), 3000);
    }
  }

  async continueInteractive(choice) {
    this.mode = 'generating';
    this.storyPanel.showMessage(`Choosing: "${choice}"...`);

    try {
      const existingModels = Object.keys(this.sceneRenderer.aiModelCache);
      const scene = await this.generator.continueStory(this.interactiveHistory, choice, existingModels);
      this.interactiveHistory += `\nUser chose: ${choice}\n${scene.text}`;

      // Register any new models from this scene
      if (scene.newModels) {
        this.sceneRenderer.registerAIModels(scene.newModels);
      }

      await this.sceneRenderer.renderScene(scene);

      if (scene.choices && scene.choices.length > 0) {
        this.storyPanel.showInteractive(scene.text, this.interactiveTitle, scene.choices);
        this.currentChoices = scene.choices;
        this.choiceIndex = 0;
        this.mode = 'choices';
      } else {
        // Story ended
        this.storyPanel.showInteractive(scene.text, this.interactiveTitle + ' — The End', []);
        this.mode = 'story'; // next pinch exits
        this.currentChoices = null;
      }
    } catch (e) {
      console.error('Continue failed:', e);
      this.mode = 'menu';
      this.storyPanel.showMessage(`Error: ${e.message}`);
      setTimeout(() => this.showMainMenu(), 3000);
    }
  }

  async startStory(storyId) {
    const scene = this.storyManager.startStory(storyId);
    if (!scene) return;

    this.menuPanel.hide();
    this.storyPanel.show(scene);
    await this.sceneRenderer.renderScene(scene);
    this.inStory = true;
    this.mode = 'story';
  }

  async nextScene() {
    if (this.mode !== 'story') return;
    const scene = this.storyManager.nextScene();
    if (!scene) {
      this.exitStory();
      return;
    }
    this.storyPanel.show(scene);
    await this.sceneRenderer.renderScene(scene);
  }

  exitStory() {
    this.inStory = false;
    this.storyManager.exitStory();
    this.sceneRenderer.clearScene();
    this.showMainMenu();
  }
}

// ES modules are deferred — DOM is already ready
xb.add(new StoryBookApp());
const options = new xb.Options();
xb.init(options);
