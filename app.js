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

    // Gesture navigation — different behavior in menu vs story
    this.gestureNav = new GestureNav({
      onNext: () => this.handleNext(),
      onPrev: () => this.handlePrev(),
      onMenu: () => this.toggleMenu()
    });

    this.inStory = false;
  }

  update() {
    if (this.inStory) {
      this.sceneRenderer.updateAnimations(performance.now());
    }
  }

  handleNext() {
    if (this.inStory) {
      this.nextScene();
    } else if (this.menuPanel.visible) {
      // Cycle selection forward
      this.selectedIndex = (this.selectedIndex + 1) % this.storyList.length;
      this.menuPanel.buildMenu(this.storyList, this.selectedIndex);
    }
  }

  handlePrev() {
    if (this.inStory) {
      this.prevScene();
    } else if (this.menuPanel.visible) {
      // Cycle selection backward
      this.selectedIndex = (this.selectedIndex - 1 + this.storyList.length) % this.storyList.length;
      this.menuPanel.buildMenu(this.storyList, this.selectedIndex);
    }
  }

  // Click/pinch starts the selected story (menu) or advances scene (in story)
  onSelectEnd(event) {
    if (!this.inStory && this.menuPanel.visible) {
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
    this.storyList = this.storyManager.getStoryList();
    this.menuPanel.buildMenu(this.storyList, this.selectedIndex);
  }
}

// ES modules are deferred — DOM is already ready
xb.add(new StoryBookApp());
const options = new xb.Options();
options.enableGestures();
xb.init(options);
