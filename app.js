import * as THREE from 'three';
import * as xb from 'xrblocks';
import 'xrblocks/addons/simulator/SimulatorAddons.js';
import { StoryManager } from './story/StoryManager.js';
import { SceneRenderer } from './story/SceneRenderer.js';
import { StoryPanel } from './ui/StoryPanel.js';
import { MenuPanel } from './ui/MenuPanel.js';
import { GestureNav } from './interaction/GestureNav.js';

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

    // Show story selection menu
    this.menuPanel.buildMenu(this.storyManager.getStoryList());
    this.storyPanel.hide();

    // Gesture navigation
    this.gestureNav = new GestureNav({
      onNext: () => this.nextScene(),
      onPrev: () => this.prevScene(),
      onMenu: () => this.toggleMenu()
    });

    // Also support click/select for simulator and controller
    this.inStory = false;
  }

  update() {
    // Animate models gently
    if (this.inStory) {
      this.sceneRenderer.updateAnimations(performance.now());
    }
  }

  // Handle select (pinch or mouse click in simulator)
  onSelectEnd(event) {
    if (!this.inStory && this.menuPanel.visible) {
      // Check if a story card was selected
      const controller = event.inputSource?.controller || event.controller;
      if (controller) {
        const intersections = xb.core.input.intersectionsForController(controller);
        const storyId = this.menuPanel.handleSelect(intersections);
        if (storyId) {
          this.startStory(storyId);
          return;
        }
      }

      // Fallback: if no raycast hit, start first story (for simulator convenience)
      const stories = this.storyManager.getStoryList();
      if (stories.length > 0) {
        this.startStory(stories[0].id);
      }
    } else if (this.inStory) {
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
      // Story ended — return to menu
      this.exitStory();
      return;
    }
    this.storyPanel.show(scene);
    await this.sceneRenderer.renderScene(scene);
  }

  async prevScene() {
    if (!this.inStory) return;
    const scene = this.storyManager.prevScene();
    if (!scene) return;
    this.storyPanel.show(scene);
    await this.sceneRenderer.renderScene(scene);
  }

  toggleMenu() {
    if (this.inStory) {
      this.exitStory();
    }
  }

  exitStory() {
    this.inStory = false;
    this.storyManager.exitStory();
    this.sceneRenderer.clearScene();
    this.storyPanel.hide();
    this.menuPanel.buildMenu(this.storyManager.getStoryList());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  xb.add(new StoryBookApp());
  const options = new xb.Options();
  options.enableGestures();
  xb.init(options);
});
