import * as THREE from 'three';
import * as xb from 'xrblocks';
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

    // Menu state
    this.selectedIndex = 0;
    this.storyList = this.storyManager.getStoryList();
    this.menuPanel.buildMenu(this.storyList, this.selectedIndex);
    this.storyPanel.hide();

    // Gesture navigation
    // Pinch = advance (cycle menu or next scene)
    // Open palm = confirm/start (start story or return to menu)
    this.gestureNav = new GestureNav({
      onPinch: () => this.handlePinch(),
      onPalm: () => this.handlePalm()
    });

    this.inStory = false;
  }

  update() {
    if (this.inStory) {
      this.sceneRenderer.updateAnimations(performance.now());
    }
  }

  handlePinch() {
    if (this.inStory) {
      this.nextScene();
    } else if (this.menuPanel.visible) {
      // Cycle to next story
      this.selectedIndex = (this.selectedIndex + 1) % this.storyList.length;
      this.menuPanel.buildMenu(this.storyList, this.selectedIndex);
    }
  }

  handlePalm() {
    if (this.inStory) {
      this.exitStory();
    } else if (this.menuPanel.visible) {
      // Start the highlighted story
      this.startStory(this.storyList[this.selectedIndex].id);
    }
  }

  // Click also works (simulator + Quest controller fallback)
  onSelectEnd(event) {
    if (!this.inStory && this.menuPanel.visible) {
      // Click on menu = start highlighted story
      this.startStory(this.storyList[this.selectedIndex].id);
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
      this.exitStory();
      return;
    }
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
    this.storyList = this.storyManager.getStoryList();
    this.menuPanel.buildMenu(this.storyList, this.selectedIndex);
  }
}

// ES modules are deferred — DOM is already ready
xb.add(new StoryBookApp());
const options = new xb.Options();
options.enableGestures();
xb.init(options);
