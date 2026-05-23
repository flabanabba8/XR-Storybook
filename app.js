import * as THREE from 'three';
import * as xb from 'xrblocks';
import { StoryManager } from './story/StoryManager.js';
import { SceneRenderer } from './story/SceneRenderer.js';
import { StoryPanel } from './ui/StoryPanel.js';
import { MenuPanel } from './ui/MenuPanel.js';
import { StoryGenerator, STORY_THEMES } from './ai/StoryGenerator.js';

const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();

class StoryBookApp extends xb.Script {

  async init() {
    await super.init();

    this.add(new THREE.AmbientLight(0x404060, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(2, 4, 2);
    this.add(dirLight);

    this.storyManager = new StoryManager();
    await this.storyManager.load();

    this.apiKey = localStorage.getItem('gemini_key') || null;
    this.generator = this.apiKey ? new StoryGenerator(this.apiKey) : null;

    this.sceneRenderer = new SceneRenderer(this);

    this.storyPanel = new StoryPanel();
    this.add(this.storyPanel);

    this.menuPanel = new MenuPanel();
    this.add(this.menuPanel);

    this.inStory = false;
    this.mode = 'menu';
    this.pendingAction = null;
    this.hoveredId = null; // currently highlighted menu item

    // Interactive state
    this.interactiveHistory = '';
    this.interactiveTitle = '';
    this.currentChoices = null;

    // XR controllers for hand ray tracking
    this.controllers = [];
    const renderer = xb.core.renderer;
    if (renderer?.xr) {
      for (let i = 0; i < 2; i++) {
        const controller = renderer.xr.getController(i);
        this.controllers.push(controller);
      }
    }

    this.showMainMenu();
  }

  update() {
    if (this.inStory) {
      this.sceneRenderer.updateAnimations(performance.now());
    }

    // Track hand ray and highlight menu cards
    if (this.mode === 'menu' || this.mode === 'themes') {
      this.updateHandHighlight();
    }
  }

  updateHandHighlight() {
    let hitId = null;

    // Try XR controllers (Quest hand tracking)
    for (const controller of this.controllers) {
      if (!controller.visible) continue;
      tempMatrix.identity().extractRotation(controller.matrixWorld);
      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

      const hits = raycaster.intersectObjects(this.menuPanel.cards, false);
      if (hits.length > 0 && hits[0].object.userData?.itemId) {
        hitId = hits[0].object.userData.itemId;
        break;
      }
    }

    // Fallback: camera gaze (desktop mouse)
    if (!hitId && xb.core.camera) {
      raycaster.setFromCamera(new THREE.Vector2(0, 0), xb.core.camera);
      const hits = raycaster.intersectObjects(this.menuPanel.cards, false);
      if (hits.length > 0 && hits[0].object.userData?.itemId) {
        hitId = hits[0].object.userData.itemId;
      }
    }

    if (hitId !== this.hoveredId) {
      this.hoveredId = hitId;
      this.menuPanel.setHighlight(hitId);
    }
  }

  showMainMenu() {
    if (!this.generator) {
      const key = localStorage.getItem('gemini_key');
      if (key) this.generator = new StoryGenerator(key);
    }

    this.mode = 'menu';
    this.hoveredId = null;
    this.menuPanel.buildMenu(this.getMenuItems());
    this.storyPanel.hide();
  }

  getMenuItems() {
    const items = this.storyManager.getStoryList().map(s => ({
      id: s.id, title: s.title, description: s.description, action: 'story'
    }));

    if (this.generator) {
      items.push({
        id: 'ai-generate', title: '✨ AI Generate Story',
        description: 'Gemini creates a unique story with custom 3D models', action: 'generate'
      });
      items.push({
        id: 'ai-interactive', title: '🎲 Interactive Adventure',
        description: 'Make choices as Gemini narrates live', action: 'interactive'
      });
    }
    return items;
  }

  showThemeMenu() {
    this.mode = 'themes';
    this.hoveredId = null;
    const items = STORY_THEMES.filter(t => t.id !== 'custom').map(t => ({
      id: t.id, title: t.label, description: t.prompt.substring(0, 70) + '...', action: 'theme'
    }));
    this.menuPanel.buildMenu(items);
  }

  // Pinch = select whatever is highlighted (or first item if nothing highlighted)
  onSelectEnd(event) {
    if (this.mode === 'generating') return;

    if (this.mode === 'menu') {
      const items = this.getMenuItems();
      const item = this.hoveredId
        ? items.find(i => i.id === this.hoveredId)
        : items[0]; // fallback to first if nothing highlighted
      if (!item) return;

      if (item.action === 'story') this.startStory(item.id);
      else if (item.action === 'generate') { this.pendingAction = 'generate'; this.showThemeMenu(); }
      else if (item.action === 'interactive') { this.pendingAction = 'interactive'; this.showThemeMenu(); }

    } else if (this.mode === 'themes') {
      const themes = STORY_THEMES.filter(t => t.id !== 'custom');
      const theme = this.hoveredId
        ? themes.find(t => t.id === this.hoveredId)
        : themes[0];
      if (!theme) return;

      if (this.pendingAction === 'generate') this.generateStory(theme.prompt);
      else if (this.pendingAction === 'interactive') this.startInteractive(theme.prompt);

    } else if (this.mode === 'choices') {
      if (this.currentChoices?.length > 0) {
        const idx = this.hoveredId != null ? this.hoveredId : 0;
        this.continueInteractive(this.currentChoices[idx]);
      }
    } else if (this.mode === 'story') {
      this.nextScene();
    }
  }

  async generateStory(theme) {
    this.mode = 'generating';
    this.menuPanel.hide();
    this.storyPanel.showMessage('✨ Gemini is crafting your story...\nThis may take a few seconds.');

    try {
      const story = await this.generator.generateStory(theme);
      this.sceneRenderer.clearAIModels();
      this.sceneRenderer.registerAIModels(story.models);
      for (const scene of story.scenes) {
        if (scene.objects && !scene.models) scene.models = scene.objects;
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
      if (scene.newModels) this.sceneRenderer.registerAIModels(scene.newModels);
      await this.sceneRenderer.renderScene(scene);

      if (scene.choices?.length > 0) {
        this.storyPanel.showInteractive(scene.text, this.interactiveTitle, scene.choices);
        this.currentChoices = scene.choices;
        this.mode = 'choices';
      } else {
        this.storyPanel.showInteractive(scene.text, this.interactiveTitle + ' — The End', []);
        this.mode = 'story';
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
    if (!scene) { this.exitStory(); return; }
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

xb.add(new StoryBookApp());
const options = new xb.Options();
xb.init(options);
