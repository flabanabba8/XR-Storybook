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
    title.position.set(0, 0.4, 0);
    this.add(title);

    // Subtitle
    const subtitle = createTextMesh('pinch to cycle  |  open palm to start  |  click to start', {
      fontSize: 18, color: '#667799', maxWidth: 500, meshWidth: 0.8, align: 'center'
    });
    subtitle.position.set(0, 0.28, 0);
    this.add(subtitle);

    // Story cards
    const cardWidth = 0.9;
    const cardHeight = 0.18;
    const spacing = 0.06;
    const startY = 0.12;

    storyList.forEach((story, index) => {
      const isSelected = index === selectedIndex;
      const card = this.createCard(story, cardWidth, cardHeight, isSelected);
      card.position.set(0, startY - index * (cardHeight + spacing), 0);
      this.add(card);
    });

    this.visible = true;
  }

  createCard(story, width, height, isSelected) {
    const group = new THREE.Group();
    group.userData.storyId = story.id;

    // Card background — highlighted if selected
    const bgGeo = new THREE.PlaneGeometry(width, height);
    const bgMat = new THREE.MeshBasicMaterial({
      color: isSelected ? 0x2a2a5e : 0x1a1a2e,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    group.add(new THREE.Mesh(bgGeo, bgMat));

    // Selection border
    if (isSelected) {
      const borderGeo = new THREE.PlaneGeometry(width + 0.02, height + 0.02);
      const borderMat = new THREE.MeshBasicMaterial({
        color: 0x6688cc,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const border = new THREE.Mesh(borderGeo, borderMat);
      border.position.z = -0.001;
      group.add(border);
    }

    // Selection arrow
    if (isSelected) {
      const arrow = createTextMesh('▶', {
        fontSize: 28, color: '#88aaff', maxWidth: 40, meshWidth: 0.05
      });
      arrow.position.set(-width / 2 - 0.05, 0, 0.01);
      group.add(arrow);
    }

    // Title
    const titleColor = isSelected ? '#ffffff' : '#ccccdd';
    const titleMesh = createTextMesh(story.title, {
      fontSize: 24, color: titleColor, maxWidth: 400, meshWidth: 0.6
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
