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
    title.position.set(0, 0.4, 0);
    this.add(title);

    // Subtitle
    const subtitle = createTextMesh('Pinch a story to begin  (or click in browser)', {
      fontSize: 20, color: '#667799', maxWidth: 500, meshWidth: 0.8, align: 'center'
    });
    subtitle.position.set(0, 0.28, 0);
    this.add(subtitle);

    // Story cards
    const cardWidth = 0.9;
    const cardHeight = 0.18;
    const spacing = 0.06;
    const startY = 0.12;

    storyList.forEach((story, index) => {
      const card = this.createCard(story, cardWidth, cardHeight);
      card.position.set(0, startY - index * (cardHeight + spacing), 0);
      this.add(card);
    });

    this.visible = true;
  }

  createCard(story, width, height) {
    const group = new THREE.Group();
    group.userData.storyId = story.id;

    // Card background
    const bgGeo = new THREE.PlaneGeometry(width, height);
    const bgMat = new THREE.MeshBasicMaterial({
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    group.add(new THREE.Mesh(bgGeo, bgMat));

    // Title
    const titleMesh = createTextMesh(story.title, {
      fontSize: 24, color: '#eeeeff', maxWidth: 400, meshWidth: 0.6
    });
    titleMesh.position.set(-0.1, 0.04, 0.01);
    group.add(titleMesh);

    // Description
    const descMesh = createTextMesh(story.description, {
      fontSize: 16, color: '#8899aa', maxWidth: 500, meshWidth: 0.75
    });
    descMesh.position.set(-0.05, -0.04, 0.01);
    group.add(descMesh);

    return group;
  }

  handleSelect(intersections) {
    for (const intersection of intersections) {
      let obj = intersection.object;
      while (obj) {
        if (obj.userData?.storyId) {
          return obj.userData.storyId;
        }
        obj = obj.parent;
      }
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
          c.material?.dispose();
          if (c.material?.map) c.material.map.dispose();
        }
      });
    }
  }

  show() { this.visible = true; }
  hide() { this.visible = false; }
}
