import * as THREE from 'three';
import * as xb from 'xrblocks';
import { StoryManager } from './story/StoryManager.js';
import { SceneRenderer } from './story/SceneRenderer.js';
import { StoryPanel } from './ui/StoryPanel.js';
import { MenuPanel } from './ui/MenuPanel.js';

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

    // Scene renderer
    this.sceneRenderer = new SceneRenderer(this);

    // UI
    this.storyPanel = new StoryPanel();
    this.add(this.storyPanel);

    this.menuPanel = new MenuPanel();
    this.add(this.menuPanel);

    // Show menu
    this.storyList = this.storyManager.getStoryList();
    this.menuPanel.buildMenu(this.storyList);
    this.storyPanel.hide();

    this.inStory = false;
  }

  update() {
    if (this.inStory) {
      this.sceneRenderer.updateAnimations(performance.now());
    }
  }

  // Native XR Blocks object selection — fires when a mesh is pinched/clicked
  onObjectSelectEnd(event) {
    if (!this.inStory && this.menuPanel.visible) {
      const storyId = this.menuPanel.findStoryId(event.object);
      if (storyId) {
        this.startStory(storyId);
        return true; // stop propagation
      }
    }
    return false;
  }

  // Global select fallback (for advancing scenes in story mode)
  onSelectEnd(event) {
    if (this.inStory) {
      this.nextScene();
    }
  }

  async startStory(storyId) {
    const scene = this.storyManager.startStory(storyId);
    if (!scene) return;

    this.menuPanel.hide();
    this.storyPanel.show(scene);
    await this.sceneRenderer.renderScene(scene);
    this.inStory = true;
  }

  async nextScene() {
    if (!this.inStory) return;
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
    this.storyPanel.hide();
    this.menuPanel.buildMenu(this.storyList);
  }
}

// ES modules are deferred — DOM is already ready
xb.add(new StoryBookApp());
const options = new xb.Options();
xb.init(options);
