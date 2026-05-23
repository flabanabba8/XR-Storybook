import * as THREE from 'three';

// Procedural 3D models from Three.js primitives — no external files needed

export function createTree() {
  const group = new THREE.Group();

  // Trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 0.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x5a3a1a })
  );
  trunk.position.y = 0.25;
  group.add(trunk);

  // Foliage layers
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d6b30 });
  const leaf1 = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 8), leafMat);
  leaf1.position.y = 0.7;
  group.add(leaf1);

  const leaf2 = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.4, 8), leafMat);
  leaf2.position.y = 0.95;
  group.add(leaf2);

  const leaf3 = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.35, 8), leafMat);
  leaf3.position.y = 1.15;
  group.add(leaf3);

  return group;
}

export function createKnight() {
  const group = new THREE.Group();
  const armorColor = 0x888899;
  const armorMat = new THREE.MeshStandardMaterial({ color: armorColor, metalness: 0.6, roughness: 0.3 });

  // Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.15), armorMat);
  body.position.y = 0.55;
  group.add(body);

  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xddb89a })
  );
  head.position.y = 0.85;
  group.add(head);

  // Helmet
  const helmet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.11, 0.08, 12),
    armorMat
  );
  helmet.position.y = 0.92;
  group.add(helmet);

  // Legs
  const legMat = new THREE.MeshStandardMaterial({ color: 0x444455 });
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.35, 0.1), legMat);
  leftLeg.position.set(-0.07, 0.175, 0);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.35, 0.1), legMat);
  rightLeg.position.set(0.07, 0.175, 0);
  group.add(rightLeg);

  // Sword
  const sword = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.4, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xccccdd, metalness: 0.8, roughness: 0.2 })
  );
  sword.position.set(0.2, 0.5, 0);
  sword.rotation.z = -0.3;
  group.add(sword);

  return group;
}

export function createDragon() {
  const group = new THREE.Group();
  const dragonMat = new THREE.MeshStandardMaterial({ color: 0x7722aa, metalness: 0.3, roughness: 0.5 });

  // Body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), dragonMat);
  body.scale.set(1, 0.7, 1.5);
  body.position.y = 0.3;
  group.add(body);

  // Head
  const headMat = new THREE.MeshStandardMaterial({ color: 0x8833bb, metalness: 0.3, roughness: 0.5 });
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 8), headMat);
  head.rotation.x = Math.PI / 2;
  head.position.set(0, 0.4, -0.5);
  group.add(head);

  // Eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff6600, emissiveIntensity: 0.5 });
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), eyeMat);
  leftEye.position.set(-0.08, 0.45, -0.55);
  group.add(leftEye);

  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), eyeMat);
  rightEye.position.set(0.08, 0.45, -0.55);
  group.add(rightEye);

  // Wings
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x551188,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });

  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(0.5, 0.3);
  wingShape.lineTo(0.6, 0);
  wingShape.lineTo(0.4, -0.1);
  wingShape.lineTo(0, 0);

  const wingGeo = new THREE.ShapeGeometry(wingShape);

  const leftWing = new THREE.Mesh(wingGeo, wingMat);
  leftWing.position.set(-0.2, 0.4, -0.1);
  leftWing.rotation.y = -Math.PI / 2;
  leftWing.rotation.z = 0.3;
  group.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeo, wingMat);
  rightWing.position.set(0.2, 0.4, -0.1);
  rightWing.rotation.y = Math.PI / 2;
  rightWing.rotation.z = -0.3;
  rightWing.scale.x = -1;
  group.add(rightWing);

  // Tail
  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.5, 6),
    dragonMat
  );
  tail.rotation.x = -Math.PI / 3;
  tail.position.set(0, 0.2, 0.5);
  group.add(tail);

  return group;
}

export function createCottage() {
  const group = new THREE.Group();

  // Walls
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.4, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xc4a67a })
  );
  walls.position.y = 0.2;
  group.add(walls);

  // Roof
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-0.38, 0);
  roofShape.lineTo(0, 0.25);
  roofShape.lineTo(0.38, 0);
  roofShape.lineTo(-0.38, 0);

  const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: 0.55, bevelEnabled: false });
  const roof = new THREE.Mesh(
    roofGeo,
    new THREE.MeshStandardMaterial({ color: 0x8b3a3a })
  );
  roof.position.set(0, 0.4, -0.275);
  group.add(roof);

  // Door
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(0.12, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x5a3820 })
  );
  door.position.set(0, 0.1, 0.251);
  group.add(door);

  // Window
  const window1 = new THREE.Mesh(
    new THREE.PlaneGeometry(0.08, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xffdd88, emissive: 0xffaa44, emissiveIntensity: 0.3 })
  );
  window1.position.set(0.18, 0.25, 0.251);
  group.add(window1);

  // Chimney
  const chimney = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.2, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x666666 })
  );
  chimney.position.set(0.15, 0.6, -0.1);
  group.add(chimney);

  return group;
}

export function createCampfire() {
  const group = new THREE.Group();

  // Logs
  const logMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a });
  for (let i = 0; i < 4; i++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.2, 6), logMat);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = (i / 4) * Math.PI;
    log.position.y = 0.03;
    group.add(log);
  }

  // Fire (emissive cone)
  const fireMat = new THREE.MeshStandardMaterial({
    color: 0xff4400,
    emissive: 0xff6600,
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.8
  });
  const fire = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 6), fireMat);
  fire.position.y = 0.12;
  group.add(fire);

  // Inner flame
  const innerFire = new THREE.Mesh(
    new THREE.ConeGeometry(0.03, 0.15, 6),
    new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      emissive: 0xffaa00,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.9
    })
  );
  innerFire.position.y = 0.12;
  group.add(innerFire);

  // Point light for glow
  const light = new THREE.PointLight(0xff6633, 1.5, 3);
  light.position.y = 0.2;
  group.add(light);

  return group;
}

// Factory: returns a model by name
const MODELS = {
  'tree.glb': createTree,
  'knight.glb': createKnight,
  'dragon.glb': createDragon,
  'cottage.glb': createCottage,
  'campfire.glb': createCampfire
};

export function createModel(name) {
  const factory = MODELS[name];
  if (!factory) {
    console.warn(`Unknown model: ${name}`);
    return null;
  }
  return factory();
}
