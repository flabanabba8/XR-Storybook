import * as THREE from 'three';
import { Text } from 'troika-three-text';

export class MenuPanel extends THREE.Group {
  constructor(onSelectStory) {
    super();
    this.onSelectStory = onSelectStory;
    this.cards = [];
    this.position.set(0, 1.4, -2);
  }

  buildMenu(storyList) {
    // Clear existing cards
    this.clearMenu();

    // Title
    const title = new Text();
    title.text = 'XR Storybook';
    title.fontSize = 0.06;
    title.color = 0xccddff;
    title.anchorX = 'center';
    title.anchorY = 'top';
    title.position.set(0, 0.4, 0);
    title.sync();
    this.add(title);

    // Subtitle
    const subtitle = new Text();
    subtitle.text = 'Pinch a story to begin';
    subtitle.fontSize = 0.025;
    subtitle.color = 0x667799;
    subtitle.anchorX = 'center';
    subtitle.anchorY = 'top';
    subtitle.position.set(0, 0.3, 0);
    subtitle.sync();
    this.add(subtitle);

    // Story cards
    const cardWidth = 0.8;
    const cardHeight = 0.2;
    const spacing = 0.05;
    const startY = 0.15;

    storyList.forEach((story, index) => {
      const card = this.createCard(story, cardWidth, cardHeight);
      card.position.set(0, startY - index * (cardHeight + spacing), 0);
      this.add(card);
      this.cards.push({ group: card, storyId: story.id });
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
    const bg = new THREE.Mesh(bgGeo, bgMat);
    group.add(bg);

    // Title
    const titleText = new Text();
    titleText.text = story.title;
    titleText.fontSize = 0.03;
    titleText.color = 0xeeeeff;
    titleText.anchorX = 'left';
    titleText.anchorY = 'top';
    titleText.position.set(-width / 2 + 0.04, height / 2 - 0.03, 0.01);
    titleText.sync();
    group.add(titleText);

    // Description
    const descText = new Text();
    descText.text = story.description;
    descText.fontSize = 0.02;
    descText.color = 0x8899aa;
    descText.maxWidth = width - 0.08;
    descText.anchorX = 'left';
    descText.anchorY = 'top';
    descText.position.set(-width / 2 + 0.04, height / 2 - 0.07, 0.01);
    descText.sync();
    group.add(descText);

    return group;
  }

  // Check if a raycast intersection hits a card, return storyId or null
  handleSelect(intersections) {
    for (const intersection of intersections) {
      let obj = intersection.object;
      // Walk up to find card group with storyId
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
        }
      });
    }
    this.cards = [];
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}
