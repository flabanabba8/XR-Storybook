import * as THREE from 'three';
import { createTextMesh } from './TextMesh.js';

export class StoryPanel extends THREE.Group {
  constructor() {
    super();
    this.visible = false;
    this.textMesh = null;
    this.titleMesh = null;
    this.progressMesh = null;
    this.navMesh = null;

    // Background panel
    const panelGeo = new THREE.PlaneGeometry(1.3, 0.6);
    const panelMat = new THREE.MeshBasicMaterial({
      color: 0x0a0a1a,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    this.panel = new THREE.Mesh(panelGeo, panelMat);
    this.add(this.panel);

    // Border glow
    const borderGeo = new THREE.PlaneGeometry(1.32, 0.62);
    const borderMat = new THREE.MeshBasicMaterial({
      color: 0x4466aa,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.z = -0.001;
    this.add(border);

    // Nav hint (static — created once)
    this.navMesh = createTextMesh('pinch: next scene  |  open palm: back to menu', {
      fontSize: 16, color: '#555577', maxWidth: 500, meshWidth: 0.8
    });
    this.navMesh.position.set(0, -0.25, 0.01);
    this.add(this.navMesh);

    // Position in front of user
    this.position.set(0, 1.3, -1.5);
  }

  show(sceneData) {
    // Remove old text meshes
    if (this.textMesh) { this.remove(this.textMesh); disposeMesh(this.textMesh); }
    if (this.titleMesh) { this.remove(this.titleMesh); disposeMesh(this.titleMesh); }
    if (this.progressMesh) { this.remove(this.progressMesh); disposeMesh(this.progressMesh); }

    // Story text
    this.textMesh = createTextMesh(sceneData.text, {
      fontSize: 24, color: '#dddddd', maxWidth: 550, meshWidth: 1.1,
      lineHeight: 1.5
    });
    this.textMesh.position.set(0, 0.05, 0.01);
    this.add(this.textMesh);

    // Title
    this.titleMesh = createTextMesh(sceneData.storyTitle || '', {
      fontSize: 18, color: '#8899cc', maxWidth: 400, meshWidth: 0.6
    });
    this.titleMesh.position.set(-0.3, 0.26, 0.01);
    this.add(this.titleMesh);

    // Progress
    this.progressMesh = createTextMesh(`${sceneData.sceneNumber} / ${sceneData.totalScenes}`, {
      fontSize: 18, color: '#666688', maxWidth: 100, meshWidth: 0.15, align: 'right'
    });
    this.progressMesh.position.set(0.55, 0.26, 0.01);
    this.add(this.progressMesh);

    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}

function disposeMesh(mesh) {
  mesh.geometry?.dispose();
  if (mesh.material?.map) mesh.material.map.dispose();
  mesh.material?.dispose();
  mesh.userData.canvas = null;
  mesh.userData.texture = null;
}
