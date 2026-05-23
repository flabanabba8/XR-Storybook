import * as THREE from 'three';
import * as xb from 'xrblocks';
import { StoryManager } from './story/StoryManager.js';
import { SceneRenderer } from './story/SceneRenderer.js';
import { StoryPanel } from './ui/StoryPanel.js';
import { MenuPanel } from './ui/MenuPanel.js';

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
    this.menuIndex = 0; // fallback cycling index
  }

  update() {
    if (this.inStory) {
      this.sceneRenderer.updateAnimations(performance.now());
    }
  }

  onSelectEnd(event) {
    if (!this.inStory && this.menuPanel.visible) {
      // Try gaze raycast first
      const storyId = this.gazeSelect();
      if (storyId) {
        this.startStory(storyId);
        return;
      }

      // Fallback: cycle through stories on each pinch
      this.startStory(this.storyList[this.menuIndex].id);
      this.menuIndex = (this.menuIndex + 1) % this.storyList.length;
    } else if (this.inStory) {
      this.nextScene();
    }
  }

  gazeSelect() {
    try {
      // Try to get the active camera
      let camera = null;

      // Method 1: XR Blocks core camera
      if (xb.core && xb.core.camera) {
        camera = xb.core.camera;
      }

      // Method 2: Three.js renderer XR camera
      if (!camera && xb.core?.renderer?.xr?.isPresenting) {
        camera = xb.core.renderer.xr.getCamera();
      }

      if (!camera) return null;

      raycaster.setFromCamera(center, camera);
      const hits = raycaster.intersectObjects(this.menuPanel.cards, false);

      for (const hit of hits) {
        if (hit.object.userData?.storyId) {
          return hit.object.userData.storyId;
        }
      }
    } catch (e) {
      // Raycast failed — fall through to fallback
      console.warn('Gaze raycast failed:', e.message);
    }
    return null;
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
