import * as THREE from 'three';

export class MenuPanel extends THREE.Group {
  constructor() {
    super();
    this.position.set(0, 1.3, -1.2);
    this.cards = [];       // raycastable card meshes
    this.highlights = {};  // id -> border mesh
  }

  buildMenu(items) {
    this.clearMenu();

    // Title
    const title = createCard('XR Storybook', 'point at a story and pinch', 600, 80,
      { fontSize: 40, subFontSize: 16, color: '#ccddff', subColor: '#667799', bg: '#0a0a2a' });
    title.position.set(0, 0.5, 0);
    this.add(title);

    // Item cards
    const cardHeight = 0.16;
    const spacing = 0.03;
    const startY = 0.3;

    items.forEach((item, index) => {
      const y = startY - index * (cardHeight + spacing);

      // Card mesh — raycast target
      const card = createCard(item.title, item.description, 600, 90,
        { fontSize: 24, subFontSize: 14, color: '#ccddee', subColor: '#8899aa', bg: '#1a1a3e' });
      card.position.set(0, y, 0);
      card.userData.itemId = item.id;
      this.add(card);
      this.cards.push(card);

      // Highlight border (hidden by default)
      const borderGeo = new THREE.PlaneGeometry(0.92, cardHeight + 0.01);
      const borderMat = new THREE.MeshBasicMaterial({
        color: 0x6688ff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false
      });
      const border = new THREE.Mesh(borderGeo, borderMat);
      border.position.set(0, y, -0.001);
      this.add(border);
      this.highlights[item.id] = border;
    });

    this.visible = true;
  }

  setHighlight(itemId) {
    for (const [id, border] of Object.entries(this.highlights)) {
      border.material.opacity = (id === itemId) ? 0.6 : 0;
    }
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
    this.highlights = {};
  }

  show() { this.visible = true; }
  hide() { this.visible = false; }
}

function createCard(title, subtitle, width, height, opts = {}) {
  const { fontSize = 28, subFontSize = 16, color = '#ffffff', subColor = '#999999', bg = '#1a1a2e' } = opts;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#4466aa';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  const pad = 14;
  ctx.textBaseline = 'top';
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.fillText(title, pad, pad);

  if (subtitle) {
    ctx.font = `${subFontSize}px Arial, sans-serif`;
    ctx.fillStyle = subColor;
    ctx.fillText(subtitle, pad, pad + fontSize + 6);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const meshWidth = 0.9;
  const meshHeight = meshWidth * (height / width);

  return new THREE.Mesh(
    new THREE.PlaneGeometry(meshWidth, meshHeight),
    new THREE.MeshBasicMaterial({
      map: texture, transparent: true, side: THREE.DoubleSide, depthWrite: false
    })
  );
}
