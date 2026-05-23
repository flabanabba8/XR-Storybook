import * as THREE from 'three';

// Renders text to a Canvas2D texture on a Three.js plane.
// Zero external dependencies — replaces troika-three-text.

export function createTextMesh(text, options = {}) {
  const {
    fontSize = 32,
    color = '#dddddd',
    maxWidth = 600,
    padding = 20,
    bgColor = null,
    bgOpacity = 0,
    fontFamily = 'Arial, sans-serif',
    lineHeight = 1.4,
    align = 'left',
    meshWidth = 1.0,   // world units
    meshHeight = null   // auto-calculate if null
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  ctx.font = `${fontSize}px ${fontFamily}`;

  // Word-wrap text
  const lines = wrapText(ctx, text, maxWidth - padding * 2);
  const textHeight = lines.length * fontSize * lineHeight;

  canvas.width = maxWidth;
  canvas.height = Math.max(textHeight + padding * 2, 60);

  // Re-set font after canvas resize
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'top';

  // Background
  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.globalAlpha = bgOpacity > 0 ? bgOpacity : 0.85;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }

  // Text
  ctx.fillStyle = color;
  ctx.textAlign = align;

  const xPos = align === 'center' ? canvas.width / 2 :
               align === 'right' ? canvas.width - padding : padding;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], xPos, padding + i * fontSize * lineHeight);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const aspect = canvas.width / canvas.height;
  const height = meshHeight || meshWidth / aspect;

  const geometry = new THREE.PlaneGeometry(meshWidth, height);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.canvas = canvas;
  mesh.userData.texture = texture;
  return mesh;
}

export function updateTextMesh(mesh, text, options = {}) {
  // Dispose old texture (userData.texture and material.map are the same ref)
  if (mesh.userData.texture) {
    mesh.userData.texture.dispose();
    mesh.userData.texture = null;
    mesh.userData.canvas = null;
  }

  // Remove old mesh geometry
  const parent = mesh.parent;
  const position = mesh.position.clone();
  const rotation = mesh.rotation.clone();

  if (parent) {
    parent.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();

    const newMesh = createTextMesh(text, options);
    newMesh.position.copy(position);
    newMesh.rotation.copy(rotation);
    parent.add(newMesh);
    return newMesh;
  }
  return mesh;
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}
