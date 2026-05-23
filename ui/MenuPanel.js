import * as THREE from 'three';
import { createTextMesh } from './TextMesh.js';

export class MenuPanel extends THREE.Group {
  constructor() {
    super();
    this.position.set(0, 1.4, -2);
  }

  buildMenu(storyList, selectedIndex = 0) {
    this.clearMenu();

    // Title
    const title = createTextMesh('XR Storybook', {
      fontSize: 48, color: '#ccddff', maxWidth: 500, meshWidth: 0.8, align: 'center'
    });
    title.position.set(0, 0.5, 0);
    fixDepth(title);
    this.add(title);

    // Instructions
    const hint = createTextMesh('pinch to browse  |  double-pinch to start', {
      fontSize: 18, color: '#667799', maxWidth: 500, meshWidth: 0.8, align: 'center'
    });
    hint.position.set(0, 0.38, 0);
    fixDepth(hint);
    this.add(hint);

    // Story cards — show ALL stories
    const cardWidth = 1.0;
    const cardHeight = 0.15;
    const spacing = 0.04;
    const startY = 0.22;

    storyList.forEach((story, index) => {
      const isSelected = index === selectedIndex;
      const y = startY - index * (cardHeight + spacing);

      // Card background
      const bgGeo = new THREE.PlaneGeometry(cardWidth, cardHeight);
      const bgMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0x2a2a6e : 0x1a1a2e,
        transparent: true,
        opacity: isSelected ? 0.95 : 0.8,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const bg = new THREE.Mesh(bgGeo, bgMat);
      bg.position.set(0, y, 0);
      this.add(bg);

      // Selection border
      if (isSelected) {
        const borderGeo = new THREE.PlaneGeometry(cardWidth + 0.02, cardHeight + 0.02);
        const borderMat = new THREE.MeshBasicMaterial({
          color: 0x6688ff,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        const border = new THREE.Mesh(borderGeo, borderMat);
        border.position.set(0, y, -0.001);
        this.add(border);
      }

      // Arrow for selected
      const prefix = isSelected ? '▶  ' : '    ';
      const titleColor = isSelected ? '#ffffff' : '#99aabb';

      // Story title + description on one line
      const label = createTextMesh(`${prefix}${story.title}`, {
        fontSize: 22, color: titleColor, maxWidth: 420, meshWidth: 0.65
      });
      label.position.set(-0.15, y + 0.02, 0.01);
      fixDepth(label);
      this.add(label);

      // Short description
      const desc = createTextMesh(story.description, {
        fontSize: 14, color: '#778899', maxWidth: 420, meshWidth: 0.65
      });
      desc.position.set(-0.15, y - 0.04, 0.01);
      fixDepth(desc);
      this.add(desc);
    });

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
