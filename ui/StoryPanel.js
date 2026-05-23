import * as THREE from 'three';

export class StoryPanel extends THREE.Group {
  constructor() {
    super();
    this.visible = false;
    this.cardMesh = null;
    this.position.set(0, 1.3, -1.5);
  }

  show(sceneData) {
    // Remove old card
    if (this.cardMesh) {
      this.remove(this.cardMesh);
      this.cardMesh.geometry?.dispose();
      if (this.cardMesh.material?.map) this.cardMesh.material.map.dispose();
      this.cardMesh.material?.dispose();
      this.cardMesh = null;
    }

    // Build text content
    const title = sceneData.storyTitle || '';
    const progress = `${sceneData.sceneNumber} / ${sceneData.totalScenes}`;
    const body = sceneData.text;
    const hint = 'pinch: next scene';

    // Render to canvas
    const width = 700;
    const height = 350;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = 'rgba(10, 10, 26, 0.9)';
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = '#4466aa';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    const pad = 20;

    // Title (top left)
    ctx.font = '16px Arial, sans-serif';
    ctx.fillStyle = '#8899cc';
    ctx.textBaseline = 'top';
    ctx.fillText(title, pad, pad);

    // Progress (top right)
    ctx.fillStyle = '#666688';
    ctx.textAlign = 'right';
    ctx.fillText(progress, width - pad, pad);
    ctx.textAlign = 'left';

    // Story text (body, word-wrapped)
    ctx.font = '20px Arial, sans-serif';
    ctx.fillStyle = '#dddddd';
    const lines = wrapText(ctx, body, width - pad * 2);
    const lineHeight = 28;
    let y = pad + 40;
    for (const line of lines) {
      ctx.fillText(line, pad, y);
      y += lineHeight;
    }

    // Nav hint (bottom center)
    ctx.font = '14px Arial, sans-serif';
    ctx.fillStyle = '#555577';
    ctx.textAlign = 'center';
    ctx.fillText(hint, width / 2, height - pad);
    ctx.textAlign = 'left';

    // Create mesh
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const meshWidth = 1.3;
    const meshHeight = meshWidth * (height / width);

    this.cardMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(meshWidth, meshHeight),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    this.add(this.cardMesh);
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}
