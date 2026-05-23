import * as THREE from 'three';
import { createTextMesh } from './TextMesh.js';

export class MenuPanel extends THREE.Group {
  constructor() {
    super();
    this.position.set(0, 1.4, -2);
  }

  buildMenu(storyList, selectedIndex = 0) {
    this.clearMenu();

    const story = storyList[selectedIndex];
    if (!story) return;

    // Title
    const title = createTextMesh('XR Storybook', {
      fontSize: 48, color: '#ccddff', maxWidth: 500, meshWidth: 0.8, align: 'center'
    });
    title.position.set(0, 0.45, 0);
    fixDepth(title);
    this.add(title);

    // Large story card — single story displayed at a time
    const cardWidth = 1.0;
    const cardHeight = 0.35;

    // Card background
    const bgGeo = new THREE.PlaneGeometry(cardWidth, cardHeight);
    const bgMat = new THREE.MeshBasicMaterial({
      color: 0x2a2a5e,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const bg = new THREE.Mesh(bgGeo, bgMat);
    bg.position.set(0, 0.1, 0);
    this.add(bg);

    // Border
    const borderGeo = new THREE.PlaneGeometry(cardWidth + 0.02, cardHeight + 0.02);
    const borderMat = new THREE.MeshBasicMaterial({
      color: 0x6688cc,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.set(0, 0.1, -0.001);
    this.add(border);

    // Story title
    const storyTitle = createTextMesh(story.title, {
      fontSize: 32, color: '#ffffff', maxWidth: 450, meshWidth: 0.7, align: 'center'
    });
    storyTitle.position.set(0, 0.2, 0.01);
    fixDepth(storyTitle);
    this.add(storyTitle);

    // Story description
    const desc = createTextMesh(story.description, {
      fontSize: 20, color: '#aabbcc', maxWidth: 450, meshWidth: 0.7, align: 'center'
    });
    desc.position.set(0, 0.05, 0.01);
    fixDepth(desc);
    this.add(desc);

    // Story counter
    const counter = createTextMesh(`${selectedIndex + 1} / ${storyList.length}`, {
      fontSize: 18, color: '#667799', maxWidth: 100, meshWidth: 0.15, align: 'center'
    });
    counter.position.set(0, -0.12, 0.01);
    fixDepth(counter);
    this.add(counter);

    // Instructions
    const hint = createTextMesh('pinch to start  |  after story ends, next story shows', {
      fontSize: 16, color: '#556677', maxWidth: 500, meshWidth: 0.8, align: 'center'
    });
    hint.position.set(0, -0.2, 0);
    fixDepth(hint);
    this.add(hint);

    this.visible = true;
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
