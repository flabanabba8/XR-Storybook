import * as THREE from 'three';

export class MenuPanel extends THREE.Group {
  constructor() {
    super();
    this.position.set(0, 1.3, -1.2);
    this.cards = []; // track card meshes for raycasting
  }

  buildMenu(storyList) {
    this.clearMenu();
    this.cards = [];

    // Title card (not selectable)
    const titleCard = createTextCard(
      'XR Storybook\n\nLook at a story and pinch to start',
      600, 120, { fontSize: 36, subFontSize: 18, color: '#ccddff', subColor: '#667799', bg: '#0a0a2a' }
    );
    titleCard.position.set(0, 0.45, 0);
    this.add(titleCard);

    // Story cards — each is a SINGLE mesh with text baked into the texture
    const cardHeight = 0.18;
    const spacing = 0.04;
    const startY = 0.2;

    storyList.forEach((story, index) => {
      const card = createTextCard(
        `${story.title}\n${story.description}`,
        600, 100, { fontSize: 28, subFontSize: 16, color: '#eeeeff', subColor: '#8899aa', bg: '#1a1a3e' }
      );
      card.position.set(0, startY - index * (cardHeight + spacing), 0);
      card.userData.storyId = story.id;
      card.material.depthWrite = false;
      this.add(card);
      this.cards.push(card);
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
      if (child.isMesh) {
        child.geometry?.dispose();
        if (child.material?.map) child.material.map.dispose();
        child.material?.dispose();
      }
    }
    this.cards = [];
  }

  show() { this.visible = true; }
  hide() { this.visible = false; }
}

// Creates a single mesh with text rendered as a CanvasTexture
function createTextCard(text, width, height, opts = {}) {
  const { fontSize = 28, subFontSize = 16, color = '#ffffff', subColor = '#999999', bg = '#1a1a2e' } = opts;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Border
  ctx.strokeStyle = '#4466aa';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  const lines = text.split('\n');
  const padding = 16;
  let y = padding;

  lines.forEach((line, i) => {
    const isFirst = i === 0;
    ctx.font = `${isFirst ? fontSize : subFontSize}px Arial, sans-serif`;
    ctx.fillStyle = isFirst ? color : subColor;
    ctx.textBaseline = 'top';
    y += isFirst ? 0 : 8;
    ctx.fillText(line, padding, y);
    y += (isFirst ? fontSize : subFontSize) * 1.2;
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const aspect = width / height;
  const meshWidth = 0.9;
  const meshHeight = meshWidth / aspect;

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(meshWidth, meshHeight),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );

  return mesh;
}
