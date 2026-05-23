import * as THREE from 'three';
import { Text } from 'troika-three-text';

export class StoryPanel extends THREE.Group {
  constructor() {
    super();
    this.visible = false;

    // Background panel
    const panelGeo = new THREE.PlaneGeometry(1.2, 0.5);
    const panelMat = new THREE.MeshBasicMaterial({
      color: 0x0a0a1a,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    this.panel = new THREE.Mesh(panelGeo, panelMat);
    this.add(this.panel);

    // Border glow
    const borderGeo = new THREE.PlaneGeometry(1.22, 0.52);
    const borderMat = new THREE.MeshBasicMaterial({
      color: 0x4466aa,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    this.border = new THREE.Mesh(borderGeo, borderMat);
    this.border.position.z = -0.001;
    this.add(this.border);

    // Story text
    this.storyText = new Text();
    this.storyText.fontSize = 0.032;
    this.storyText.color = 0xdddddd;
    this.storyText.maxWidth = 1.05;
    this.storyText.textAlign = 'left';
    this.storyText.anchorX = 'center';
    this.storyText.anchorY = 'top';
    this.storyText.position.set(0, 0.18, 0.01);
    this.storyText.lineHeight = 1.5;
    this.add(this.storyText);

    // Title text (top)
    this.titleText = new Text();
    this.titleText.fontSize = 0.025;
    this.titleText.color = 0x8899cc;
    this.titleText.anchorX = 'left';
    this.titleText.anchorY = 'top';
    this.titleText.position.set(-0.55, 0.23, 0.01);
    this.add(this.titleText);

    // Progress text (bottom right)
    this.progressText = new Text();
    this.progressText.fontSize = 0.022;
    this.progressText.color = 0x666688;
    this.progressText.anchorX = 'right';
    this.progressText.anchorY = 'bottom';
    this.progressText.position.set(0.55, -0.22, 0.01);
    this.add(this.progressText);

    // Nav hints (bottom)
    this.navHint = new Text();
    this.navHint.fontSize = 0.018;
    this.navHint.color = 0x555577;
    this.navHint.anchorX = 'center';
    this.navHint.anchorY = 'bottom';
    this.navHint.position.set(0, -0.22, 0.01);
    this.navHint.text = 'pinch right: next  |  pinch left: back  |  open palm: menu';
    this.navHint.sync();
    this.add(this.navHint);

    // Position panel in front of user at comfortable reading height
    this.position.set(0, 1.3, -1.5);
  }

  show(sceneData) {
    this.storyText.text = sceneData.text;
    this.storyText.sync();

    this.titleText.text = sceneData.storyTitle || '';
    this.titleText.sync();

    this.progressText.text = `${sceneData.sceneNumber} / ${sceneData.totalScenes}`;
    this.progressText.sync();

    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}
