import * as THREE from 'three';
import { createModel } from '../models/ProceduralModels.js';

export class SceneRenderer {
  constructor(parentObject) {
    this.parent = parentObject;
    this.currentModels = [];
    this.animations = [];
    this.ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    this.parent.add(this.ambientLight);

    // Cache for AI-generated model factories
    this.aiModelCache = {};
  }

  // Register AI-generated model code (from Gemini)
  registerAIModels(models) {
    if (!models) return;
    for (const [name, code] of Object.entries(models)) {
      if (this.aiModelCache[name]) continue; // already registered
      try {
        this.aiModelCache[name] = new Function('THREE', code);
      } catch (e) {
        console.warn(`Failed to compile model "${name}":`, e.message);
      }
    }
  }

  // Build a model by name — checks AI cache first, then built-in procedural models
  buildModel(name) {
    // AI-generated model
    if (this.aiModelCache[name]) {
      try {
        return this.aiModelCache[name](THREE);
      } catch (e) {
        console.warn(`Failed to create AI model "${name}":`, e.message);
      }
    }

    // Built-in procedural model (for pre-written stories)
    const builtIn = createModel(name);
    if (builtIn) return builtIn;

    // Placeholder
    console.warn(`Unknown model: ${name}`);
    const g = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x6644aa })
    );
    mesh.position.y = 0.1;
    g.add(mesh);
    return g;
  }

  async renderScene(sceneData) {
    this.clearScene();

    // Register any new AI models
    if (sceneData.newModels) {
      this.registerAIModels(sceneData.newModels);
    }

    // Update ambient lighting
    if (sceneData.ambient) {
      const color = new THREE.Color(sceneData.ambient.color);
      this.ambientLight.color.copy(color);
      this.ambientLight.groundColor.copy(color.clone().multiplyScalar(0.3));
      this.ambientLight.intensity = sceneData.ambient.intensity || 0.8;
    }

    // Support both "models" (pre-written) and "objects" (AI-generated) formats
    const objectDefs = sceneData.objects || sceneData.models || [];

    for (const objDef of objectDefs) {
      const modelName = objDef.model || objDef.file;
      if (!modelName) continue;

      const model = this.buildModel(modelName);
      if (!model) continue;

      const wrapper = new THREE.Group();
      wrapper.add(model);

      const pos = objDef.position || [0, 0, -2];
      wrapper.position.set(pos[0], pos[1], pos[2]);

      const s = objDef.scale || 1.0;
      const targetScale = new THREE.Vector3(s, s, s);
      wrapper.scale.set(0.01, 0.01, 0.01);

      if (objDef.rotation) {
        wrapper.rotation.set(objDef.rotation[0], objDef.rotation[1], objDef.rotation[2]);
      }

      // Start transparent for fade-in
      wrapper.traverse(child => {
        if (child.isMesh) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = 0;
        }
      });

      this.parent.add(wrapper);
      this.currentModels.push({ wrapper, targetScale, baseY: pos[1] });

      this.animations.push({
        wrapper,
        targetScale,
        startTime: performance.now(),
        duration: 600
      });
    }
  }

  updateAnimations(time) {
    // Entrance animations
    for (let i = this.animations.length - 1; i >= 0; i--) {
      const anim = this.animations[i];
      const elapsed = time - anim.startTime;
      const t = Math.min(elapsed / anim.duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);

      anim.wrapper.scale.lerpVectors(
        new THREE.Vector3(0.01, 0.01, 0.01),
        anim.targetScale,
        ease
      );

      anim.wrapper.traverse(child => {
        if (child.isMesh && child.material.transparent) {
          child.material.opacity = ease;
        }
      });

      if (t >= 1) {
        anim.wrapper.traverse(child => {
          if (child.isMesh) child.material.opacity = 1;
        });
        this.animations.splice(i, 1);
      }
    }

    // Gentle bob
    for (let i = 0; i < this.currentModels.length; i++) {
      const entry = this.currentModels[i];
      const offset = i * 1.7;
      entry.wrapper.position.y = entry.baseY + Math.sin(time * 0.0008 + offset) * 0.02;
    }
  }

  clearScene() {
    this.animations = [];
    for (const entry of this.currentModels) {
      this.parent.remove(entry.wrapper);
      entry.wrapper.traverse(child => {
        if (child.isMesh) {
          child.geometry?.dispose();
          if (child.material?.map) child.material.map.dispose();
          child.material?.dispose();
        }
        if (child.isLight) child.dispose?.();
      });
    }
    this.currentModels = [];
  }

  // Clear AI model cache (when starting a new story)
  clearAIModels() {
    this.aiModelCache = {};
  }
}
