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
  }

  update() {
    if (this.inStory) {
      this.sceneRenderer.updateAnimations(performance.now());
    }
  }

  // Pinch or click — use gaze raycast to find what we're looking at
  onSelectEnd(event) {
    if (!this.inStory && this.menuPanel.visible) {
      // Cast ray from center of view (where user is looking)
      const camera = xb.core.renderer.xr.isPresenting
        ? xb.core.renderer.xr.getCamera()
        : xb.core.camera;

      if (camera) {
        raycaster.setFromCamera(center, camera);
        const hits = raycaster.intersectObjects(this.menuPanel.children, false);
        for (const hit of hits) {
          const storyId = this.menuPanel.findStoryId(hit.object);
          if (storyId) {
            this.startStory(storyId);
            return;
          }
        }
      }

      // Fallback: if no gaze hit, start first story
      if (this.storyList.length > 0) {
        this.startStory(this.storyList[0].id);
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
