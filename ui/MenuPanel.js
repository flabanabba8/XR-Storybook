import * as THREE from 'three';
import { createTextMesh } from './TextMesh.js';

export class MenuPanel extends THREE.Group {
  constructor() {
    super();
    this.position.set(0, 1.4, -2);
  }

  buildMenu(storyList) {
    this.clearMenu();

    // Title
    const title = createTextMesh('XR Storybook', {
      fontSize: 48, color: '#ccddff', maxWidth: 500, meshWidth: 0.8, align: 'center'
    });
    title.position.set(0, 0.5, 0);
    fixDepth(title);
    this.add(title);

    // Instructions
    const hint = createTextMesh('point and pinch a story to start', {
      fontSize: 18, color: '#667799', maxWidth: 500, meshWidth: 0.8, align: 'center'
    });
    hint.position.set(0, 0.38, 0);
    fixDepth(hint);
    this.add(hint);

    // Story cards — each is a selectable mesh
    const cardWidth = 1.0;
    const cardHeight = 0.18;
    const spacing = 0.04;
    const startY = 0.22;

    storyList.forEach((story, index) => {
      const y = startY - index * (cardHeight + spacing);

      // Card background — this is the selectable hit target
      const bgGeo = new THREE.PlaneGeometry(cardWidth, cardHeight);
      const bgMat = new THREE.MeshBasicMaterial({
        color: 0x1a1a3e,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const bg = new THREE.Mesh(bgGeo, bgMat);
      bg.position.set(0, y, 0);
      bg.userData.storyId = story.id;  // XR Blocks raycast will find this
      this.add(bg);

      // Hover border (slightly larger, behind)
      const borderGeo = new THREE.PlaneGeometry(cardWidth + 0.02, cardHeight + 0.02);
      const borderMat = new THREE.MeshBasicMaterial({
        color: 0x4466aa,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const border = new THREE.Mesh(borderGeo, borderMat);
      border.position.set(0, y, -0.001);
      this.add(border);

      // Story title
      const titleMesh = createTextMesh(story.title, {
        fontSize: 24, color: '#eeeeff', maxWidth: 400, meshWidth: 0.6
      });
      titleMesh.position.set(-0.15, y + 0.03, 0.01);
      fixDepth(titleMesh);
      this.add(titleMesh);

      // Description
      const descMesh = createTextMesh(story.description, {
        fontSize: 14, color: '#8899aa', maxWidth: 500, meshWidth: 0.7
      });
      descMesh.position.set(-0.1, y - 0.04, 0.01);
      fixDepth(descMesh);
      this.add(descMesh);
    });

    this.visible = true;
  }

  // Walk up from a hit object to find the storyId
  findStoryId(object) {
    let obj = object;
    while (obj) {
      if (obj.userData?.storyId) return obj.userData.storyId;
      obj = obj.parent;
    }
    return null;
  }

  clearMenu() {
    while (this.children.length > 0) {
      const child = this.children[0];
      this.remove(child);
      child.traverse(c => {
        if (c.isMesh) {
          c.geometry?.dispose();
          if (c.material?.map) c.material.map.dispose();
          c.material?.dispose();
        }
      });
    }
  }

  show() { this.visible = true; }
  hide() { this.visible = false; }
}

function fixDepth(mesh) {
  mesh.traverse(c => {
    if (c.isMesh && c.material) {
      c.material.depthWrite = false;
    }
  });
}
