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

export function createAnimeProtag() {
  const group = new THREE.Group();

  // Legs (dark pants)
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a });
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.35, 0.1), legMat);
  leftLeg.position.set(-0.06, 0.175, 0);
  group.add(leftLeg);
  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.35, 0.1), legMat);
  rightLeg.position.set(0.06, 0.175, 0);
  group.add(rightLeg);

  // Body (school uniform jacket)
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.3, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x1a1a6a })
  );
  body.position.y = 0.5;
  group.add(body);

  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xf5d0a9 })
  );
  head.position.y = 0.78;
  group.add(head);

  // SPIKY ANIME HAIR — the most important part
  const hairMat = new THREE.MeshStandardMaterial({ color: 0xff4400 });
  const spikes = [
    { pos: [0, 0.95, 0], rot: [0, 0, 0] },
    { pos: [-0.06, 0.92, 0], rot: [0, 0, 0.4] },
    { pos: [0.06, 0.92, 0], rot: [0, 0, -0.4] },
    { pos: [0, 0.90, -0.05], rot: [0.3, 0, 0] },
    { pos: [-0.04, 0.93, -0.04], rot: [0.2, 0, 0.3] },
    { pos: [0.04, 0.93, -0.04], rot: [0.2, 0, -0.3] },
  ];
  for (const spike of spikes) {
    const s = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 4), hairMat);
    s.position.set(...spike.pos);
    s.rotation.set(...spike.rot);
    group.add(s);
  }

  // Eyes (big anime eyes)
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x2244ff, emissive: 0x1122aa, emissiveIntensity: 0.3 });
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), eyeMat);
  leftEye.position.set(-0.04, 0.79, 0.09);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), eyeMat);
  rightEye.position.set(0.04, 0.79, 0.09);
  group.add(rightEye);

  return group;
}

export function createTsundere() {
  const group = new THREE.Group();

  // Legs (skirt)
  const skirt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.15, 0.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x1a1a6a })
  );
  skirt.position.y = 0.28;
  group.add(skirt);

  // Legs below skirt
  const legMat = new THREE.MeshStandardMaterial({ color: 0xf5d0a9 });
  const ll = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), legMat);
  ll.position.set(-0.05, 0.1, 0);
  group.add(ll);
  const rl = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), legMat);
  rl.position.set(0.05, 0.1, 0);
  group.add(rl);

  // Body (sailor uniform top)
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.25, 0.13),
    new THREE.MeshStandardMaterial({ color: 0xeeeeee })
  );
  body.position.y = 0.5;
  group.add(body);

  // Sailor collar
  const collar = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.08, 0.14),
    new THREE.MeshStandardMaterial({ color: 0x1a1a6a })
  );
  collar.position.y = 0.6;
  group.add(collar);

  // Ribbon
  const ribbon = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.04, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xff2244 })
  );
  ribbon.position.set(0, 0.56, 0.07);
  group.add(ribbon);

  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xf5d0a9 })
  );
  head.position.y = 0.75;
  group.add(head);

  // Twin-tail hair
  const hairMat = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
  // Main hair
  const mainHair = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), hairMat);
  mainHair.scale.set(1, 0.9, 0.9);
  mainHair.position.y = 0.78;
  group.add(mainHair);
  // Twin tails
  const ltail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.25, 6), hairMat);
  ltail.position.set(-0.12, 0.65, -0.03);
  ltail.rotation.z = 0.3;
  group.add(ltail);
  const rtail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.25, 6), hairMat);
  rtail.position.set(0.12, 0.65, -0.03);
  rtail.rotation.z = -0.3;
  group.add(rtail);

  // Big anime eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff4488, emissive: 0xff2266, emissiveIntensity: 0.2 });
  const le = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), eyeMat);
  le.position.set(-0.035, 0.76, 0.085);
  group.add(le);
  const re = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), eyeMat);
  re.position.set(0.035, 0.76, 0.085);
  group.add(re);

  return group;
}

export function createRival() {
  const group = new THREE.Group();

  // Legs
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  const ll = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.35, 0.1), legMat);
  ll.position.set(-0.06, 0.175, 0);
  group.add(ll);
  const rl = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.35, 0.1), legMat);
  rl.position.set(0.06, 0.175, 0);
  group.add(rl);

  // Body (long coat, because of course)
  const coat = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.4, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x0a0a0a })
  );
  coat.position.y = 0.55;
  group.add(coat);

  // Coat tails
  const tailMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, side: THREE.DoubleSide });
  const ltail = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.2), tailMat);
  ltail.position.set(-0.06, 0.25, -0.08);
  ltail.rotation.x = -0.2;
  group.add(ltail);
  const rtail = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.2), tailMat);
  rtail.position.set(0.06, 0.25, -0.08);
  rtail.rotation.x = -0.2;
  group.add(rtail);

  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xf0c8a0 })
  );
  head.position.y = 0.85;
  group.add(head);

  // Slicked-back silver hair
  const hairMat = new THREE.MeshStandardMaterial({ color: 0xccccdd, metalness: 0.4, roughness: 0.3 });
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), hairMat);
  hair.scale.set(1, 0.85, 1.2);
  hair.position.set(0, 0.88, -0.02);
  group.add(hair);

  // Narrow menacing eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xaa0000, emissiveIntensity: 0.5 });
  const le = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.01, 0.01), eyeMat);
  le.position.set(-0.04, 0.85, 0.1);
  group.add(le);
  const re = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.01, 0.01), eyeMat);
  re.position.set(0.04, 0.85, 0.1);
  group.add(re);

  return group;
}

export function createSchool() {
  const group = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xddddcc });

  // Main building
  const main = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.4), wallMat);
  main.position.y = 0.3;
  group.add(main);

  // Second floor
  const upper = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.38), wallMat);
  upper.position.y = 0.85;
  group.add(upper);

  // Roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.05, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x444466 })
  );
  roof.position.y = 1.12;
  group.add(roof);

  // Windows
  const winMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, emissive: 0x4488aa, emissiveIntensity: 0.2 });
  for (let floor = 0; floor < 2; floor++) {
    for (let i = 0; i < 5; i++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.12), winMat);
      win.position.set(-0.4 + i * 0.2, 0.2 + floor * 0.55, 0.201);
      group.add(win);
    }
  }

  // Door
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(0.15, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x553322 })
  );
  door.position.set(0, 0.125, 0.201);
  group.add(door);

  // Clock tower
  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.3, 0.2),
    wallMat
  );
  tower.position.y = 1.25;
  group.add(tower);

  // Clock face
  const clock = new THREE.Mesh(
    new THREE.CircleGeometry(0.06, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  clock.position.set(0, 1.3, 0.101);
  group.add(clock);

  return group;
}

export function createCherryTree() {
  const group = new THREE.Group();

  // Trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.07, 0.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x5a3a2a })
  );
  trunk.position.y = 0.3;
  group.add(trunk);

  // Branches
  const branchMat = new THREE.MeshStandardMaterial({ color: 0x5a3a2a });
  const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.25, 6), branchMat);
  b1.position.set(-0.1, 0.55, 0);
  b1.rotation.z = 0.8;
  group.add(b1);
  const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.3, 6), branchMat);
  b2.position.set(0.12, 0.58, 0);
  b2.rotation.z = -0.6;
  group.add(b2);

  // Pink blossom clusters
  const blossomMat = new THREE.MeshStandardMaterial({
    color: 0xffaacc,
    emissive: 0xff6699,
    emissiveIntensity: 0.15
  });
  const blossomPositions = [
    [0, 0.75, 0], [-0.15, 0.65, 0.05], [0.15, 0.7, -0.05],
    [-0.2, 0.55, 0], [0.2, 0.6, 0], [0, 0.68, -0.08],
    [-0.08, 0.72, 0.06], [0.1, 0.73, 0.04]
  ];
  for (const pos of blossomPositions) {
    const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), blossomMat);
    blossom.position.set(...pos);
    blossom.scale.set(1, 0.6, 1);
    group.add(blossom);
  }

  return group;
}

export function createRamen() {
  const group = new THREE.Group();

  // Bowl
  const bowlMat = new THREE.MeshStandardMaterial({ color: 0xdd4422 });
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.08, 16), bowlMat);
  bowl.position.y = 0.04;
  group.add(bowl);

  // Broth
  const broth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.02, 16),
    new THREE.MeshStandardMaterial({ color: 0xddaa44 })
  );
  broth.position.y = 0.07;
  group.add(broth);

  // Noodles (wavy cylinders)
  const noodleMat = new THREE.MeshStandardMaterial({ color: 0xeedd88 });
  for (let i = 0; i < 5; i++) {
    const noodle = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.005, 4, 12), noodleMat);
    noodle.position.set(Math.sin(i) * 0.03, 0.08, Math.cos(i) * 0.03);
    noodle.rotation.x = Math.PI / 2 + Math.random() * 0.3;
    group.add(noodle);
  }

  // Egg half
  const egg = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  egg.scale.y = 0.5;
  egg.position.set(0.05, 0.08, 0.03);
  group.add(egg);
  const yolk = new THREE.Mesh(
    new THREE.CircleGeometry(0.015, 8),
    new THREE.MeshStandardMaterial({ color: 0xff8800 })
  );
  yolk.position.set(0.05, 0.085, 0.04);
  group.add(yolk);

  // Steam
  const steamMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
  for (let i = 0; i < 3; i++) {
    const steam = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), steamMat);
    steam.position.set(Math.sin(i * 2) * 0.03, 0.12 + i * 0.03, Math.cos(i * 2) * 0.02);
    group.add(steam);
  }

  return group;
}

export function createKatana() {
  const group = new THREE.Group();

  // Blade
  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.6, 0.005),
    new THREE.MeshStandardMaterial({ color: 0xddddee, metalness: 0.9, roughness: 0.1 })
  );
  blade.position.y = 0.4;
  group.add(blade);

  // Guard (tsuba)
  const guard = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.008, 8),
    new THREE.MeshStandardMaterial({ color: 0x886622, metalness: 0.6 })
  );
  guard.position.y = 0.1;
  group.add(guard);

  // Handle
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8),
    new THREE.MeshStandardMaterial({ color: 0x2a1a0a })
  );
  handle.position.y = 0.02;
  group.add(handle);

  // Handle wrap
  const wrapMat = new THREE.MeshStandardMaterial({ color: 0x884422 });
  for (let i = 0; i < 5; i++) {
    const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.017, 0.003, 4, 8), wrapMat);
    wrap.position.y = -0.03 + i * 0.025;
    wrap.rotation.x = Math.PI / 2;
    group.add(wrap);
  }

  // Glow effect
  const glow = new THREE.PointLight(0x4488ff, 0.5, 1);
  glow.position.y = 0.4;
  group.add(glow);

  return group;
}

export function createExplosion() {
  const group = new THREE.Group();

  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xff6600,
    emissive: 0xff4400,
    emissiveIntensity: 2.0,
    transparent: true,
    opacity: 0.8
  });

  // Core
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), coreMat);
  group.add(core);

  // Outer bursts
  const burstMat = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0xff6600,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.6
  });
  for (let i = 0; i < 8; i++) {
    const burst = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), burstMat);
    const angle = (i / 8) * Math.PI * 2;
    burst.position.set(Math.cos(angle) * 0.2, Math.sin(angle) * 0.15, Math.sin(angle * 2) * 0.1);
    group.add(burst);
  }

  // Smoke
  const smokeMat = new THREE.MeshStandardMaterial({ color: 0x444444, transparent: true, opacity: 0.4 });
  for (let i = 0; i < 5; i++) {
    const smoke = new THREE.Mesh(new THREE.SphereGeometry(0.1 + i * 0.03, 8, 8), smokeMat);
    smoke.position.set(Math.random() * 0.2 - 0.1, 0.2 + i * 0.08, Math.random() * 0.1);
    group.add(smoke);
  }

  // Big light
  const light = new THREE.PointLight(0xff6600, 3, 5);
  group.add(light);

  return group;
}

// Factory: returns a model by name
const MODELS = {
  'tree.glb': createTree,
  'knight.glb': createKnight,
  'dragon.glb': createDragon,
  'cottage.glb': createCottage,
  'campfire.glb': createCampfire,
  'anime-protag.glb': createAnimeProtag,
  'tsundere.glb': createTsundere,
  'rival.glb': createRival,
  'school.glb': createSchool,
  'cherry-tree.glb': createCherryTree,
  'ramen.glb': createRamen,
  'katana.glb': createKatana,
  'explosion.glb': createExplosion
};

export function createModel(name) {
  const factory = MODELS[name];
  if (!factory) {
    console.warn(`Unknown model: ${name}`);
    return null;
  }
  return factory();
}
