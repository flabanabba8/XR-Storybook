import * as THREE from 'three';
import { createModel } from '../models/ProceduralModels.js';

export class SceneRenderer {
  constructor(parentObject) {
    this.parent = parentObject;
    this.currentModels = [];
    this.ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    this.parent.add(this.ambientLight);
  }

  async renderScene(sceneData) {
    this.clearScene();

    // Update ambient lighting
    if (sceneData.ambient) {
      const color = new THREE.Color(sceneData.ambient.color);
      this.ambientLight.color.copy(color);
      this.ambientLight.groundColor.copy(color.clone().multiplyScalar(0.3));
      this.ambientLight.intensity = sceneData.ambient.intensity || 0.8;
    }

    // Create and place models
    for (const modelDef of sceneData.models) {
      const model = createModel(modelDef.file);
      if (!model) continue;

      const wrapper = new THREE.Group();
      wrapper.add(model);

      // Position
      const pos = modelDef.position || [0, 0, -2];
      wrapper.position.set(pos[0], pos[1], pos[2]);

      // Scale
      const s = modelDef.scale || 1.0;
      wrapper.scale.set(s, s, s);

      // Rotation
      if (modelDef.rotation) {
        wrapper.rotation.set(modelDef.rotation[0], modelDef.rotation[1], modelDef.rotation[2]);
      }

      // Start small for entrance animation
      const targetScale = wrapper.scale.clone();
      wrapper.scale.set(0.01, 0.01, 0.01);

      // Start transparent
      wrapper.traverse(child => {
        if (child.isMesh) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = 0;
        }
      });

      this.parent.add(wrapper);
      this.currentModels.push({ wrapper, targetScale, baseY: pos[1] });

      this.animateEntrance(wrapper, targetScale);
    }
  }

  animateEntrance(object, targetScale) {
    const startScale = new THREE.Vector3(0.01, 0.01, 0.01);
    const duration = 600;
    const startTime = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic

      object.scale.lerpVectors(startScale, targetScale, ease);

      object.traverse(child => {
        if (child.isMesh && child.material.transparent) {
          child.material.opacity = ease;
        }
      });

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        // Make opaque after animation
        object.traverse(child => {
          if (child.isMesh) {
            child.material.opacity = 1;
          }
        });
      }
    };
    requestAnimationFrame(animate);
  }

  clearScene() {
    for (const entry of this.currentModels) {
      this.parent.remove(entry.wrapper);
      entry.wrapper.traverse(child => {
        if (child.isMesh) {
          child.geometry?.dispose();
          child.material?.dispose();
          if (child.material?.map) child.material.map.dispose();
        }
        if (child.isLight) {
          child.dispose?.();
        }
      });
    }
    this.currentModels = [];
  }

  updateAnimations(time) {
    for (let i = 0; i < this.currentModels.length; i++) {
      const entry = this.currentModels[i];
      const offset = i * 1.7;
      // Gentle floating bob
      entry.wrapper.position.y = entry.baseY + Math.sin(time * 0.0008 + offset) * 0.02;
    }
  }
}
