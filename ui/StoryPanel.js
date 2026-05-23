import * as THREE from 'three';

export class StoryPanel extends THREE.Group {
  constructor() {
    super();
    this.visible = false;
    this.cardMesh = null;
    this.position.set(0, 1.3, -1.5);
  }

  show(sceneData) {
    this.clearCard();

    const title = sceneData.storyTitle || '';
    const progress = `${sceneData.sceneNumber} / ${sceneData.totalScenes}`;
    const body = sceneData.text;

    this.cardMesh = renderCard(700, 350, (ctx, w, h) => {
      const pad = 20;

      // Title + progress
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = '#8899cc';
      ctx.fillText(title, pad, pad + 14);
      ctx.fillStyle = '#666688';
      ctx.textAlign = 'right';
      ctx.fillText(progress, w - pad, pad + 14);
      ctx.textAlign = 'left';

      // Body
      ctx.font = '20px Arial, sans-serif';
      ctx.fillStyle = '#dddddd';
      const lines = wrapText(ctx, body, w - pad * 2);
      let y = pad + 44;
      for (const line of lines) {
        ctx.fillText(line, pad, y);
        y += 28;
      }

      // Hint
      ctx.font = '14px Arial, sans-serif';
      ctx.fillStyle = '#555577';
      ctx.textAlign = 'center';
      ctx.fillText('pinch: next scene', w / 2, h - pad);
    });
    this.add(this.cardMesh);
    this.visible = true;
  }

  showMessage(message) {
    this.clearCard();

    this.cardMesh = renderCard(600, 150, (ctx, w, h) => {
      ctx.font = '24px Arial, sans-serif';
      ctx.fillStyle = '#ccddff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(message, w / 2, h / 2);
    });
    this.add(this.cardMesh);
    this.visible = true;
  }

  showInteractive(text, title, choices) {
    this.clearCard();

    const hasChoices = choices && choices.length > 0;
    const height = hasChoices ? 420 : 350;

    this.cardMesh = renderCard(700, height, (ctx, w, h) => {
      const pad = 20;

      // Title
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = '#8899cc';
      ctx.fillText(title, pad, pad + 14);

      // Body
      ctx.font = '20px Arial, sans-serif';
      ctx.fillStyle = '#dddddd';
      const lines = wrapText(ctx, text, w - pad * 2);
      let y = pad + 44;
      for (const line of lines) {
        ctx.fillText(line, pad, y);
        y += 28;
      }

      if (hasChoices) {
        // Separator
        y += 10;
        ctx.strokeStyle = '#334466';
        ctx.beginPath();
        ctx.moveTo(pad, y);
        ctx.lineTo(w - pad, y);
        ctx.stroke();
        y += 20;

        // Choices
        ctx.font = '14px Arial, sans-serif';
        ctx.fillStyle = '#667799';
        ctx.fillText('Pinch to cycle choices, each pinch selects:', pad, y);
        y += 24;

        ctx.font = '18px Arial, sans-serif';
        choices.forEach((choice, i) => {
          ctx.fillStyle = '#aabbff';
          ctx.fillText(`${i + 1}. ${choice}`, pad + 10, y);
          y += 26;
        });
      } else {
        // Story ended
        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = '#aabbcc';
        ctx.textAlign = 'center';
        ctx.fillText('— The End — pinch to return', w / 2, h - pad - 10);
      }
    });
    this.add(this.cardMesh);
    this.visible = true;
  }

  clearCard() {
    if (this.cardMesh) {
      this.remove(this.cardMesh);
      this.cardMesh.geometry?.dispose();
      if (this.cardMesh.material?.map) this.cardMesh.material.map.dispose();
      this.cardMesh.material?.dispose();
      this.cardMesh = null;
    }
  }

  hide() {
    this.visible = false;
  }
}

function renderCard(width, height, drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = 'rgba(10, 10, 26, 0.92)';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#4466aa';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  drawFn(ctx, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const meshWidth = 1.3;
  const meshHeight = meshWidth * (height / width);

  return new THREE.Mesh(
    new THREE.PlaneGeometry(meshWidth, meshHeight),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
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
