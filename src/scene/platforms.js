import * as THREE from 'three';
import {
  gameColors,
  lanePositions,
  visibleLandingCount,
  wildcardPad,
} from '../game/config.js';

const landingPadGeometry = new THREE.BoxGeometry(1.72, 0.16, 1.45);
const wildcardStripeGeometry = new THREE.BoxGeometry(0.42, 0.035, 1.55);
const wildcardBeaconGeometry = new THREE.BoxGeometry(0.2, 0.34, 0.22);
const finishRingGeometry = new THREE.RingGeometry(0.48, 0.62, 72);
const finishLineGeometry = new THREE.BoxGeometry(1.24, 0.026, 0.08);
const landingArrowShape = new THREE.Shape()
  .moveTo(0, 0.28)
  .lineTo(0.36, -0.02)
  .lineTo(0.25, -0.16)
  .lineTo(0, 0.04)
  .lineTo(-0.25, -0.16)
  .lineTo(-0.36, -0.02)
  .lineTo(0, 0.28);
const landingArrowGeometry = new THREE.ShapeGeometry(landingArrowShape);
const landingPadMaterial = new THREE.MeshStandardMaterial({
  color: 0x123b6d,
  emissive: 0x29d7ff,
  emissiveIntensity: 0.75,
  roughness: 0.25,
  metalness: 0.25,
  transparent: true,
  opacity: 0.82,
});
const landingPadEdgeMaterial = new THREE.LineBasicMaterial({
  color: 0xa6f6ff,
  transparent: true,
  opacity: 0.8,
});
const landingArrowMaterial = new THREE.MeshBasicMaterial({
  color: 0xa6f6ff,
  transparent: true,
  opacity: 0.24,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const finishGoalMaterial = new THREE.MeshBasicMaterial({
  color: 0xffd257,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const wildcardStripeMaterials = [
  new THREE.MeshBasicMaterial({
    color: gameColors.red.emissive,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
  }),
  new THREE.MeshBasicMaterial({
    color: gameColors.yellow.emissive,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
  }),
  new THREE.MeshBasicMaterial({
    color: gameColors.blue.emissive,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
  }),
];

export function createLandingPads(scene) {
  const landingPads = [];

  for (let i = 0; i < visibleLandingCount * lanePositions.length; i += 1) {
    const pad = new THREE.Group();
    const body = new THREE.Mesh(landingPadGeometry, landingPadMaterial.clone());
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(landingPadGeometry),
      landingPadEdgeMaterial.clone()
    );
    const arrows = [-0.22, 0.24].map((zOffset) => {
      const arrow = new THREE.Mesh(landingArrowGeometry, landingArrowMaterial.clone());
      arrow.rotation.x = -Math.PI / 2;
      arrow.position.set(0, 0.116, zOffset);
      return arrow;
    });
    const finishRing = new THREE.Mesh(finishRingGeometry, finishGoalMaterial.clone());
    const finishLine = new THREE.Mesh(finishLineGeometry, finishGoalMaterial.clone());
    const stripes = wildcardStripeMaterials.map((material, stripeIndex) => {
      const stripe = new THREE.Mesh(wildcardStripeGeometry, material.clone());
      stripe.position.set((stripeIndex - 1) * 0.48, 0.105, 0);
      stripe.visible = false;
      return stripe;
    });
    const beacons = wildcardStripeMaterials.map((material, beaconIndex) => {
      const beacon = new THREE.Mesh(wildcardBeaconGeometry, material.clone());
      beacon.position.set((beaconIndex - 1) * 0.34, 0.28, -0.48);
      beacon.visible = false;
      return beacon;
    });

    body.receiveShadow = true;
    finishRing.rotation.x = -Math.PI / 2;
    finishRing.position.set(0, 0.124, 0);
    finishRing.visible = false;
    finishLine.position.set(0, 0.126, 0.48);
    finishLine.visible = false;
    pad.add(body);
    pad.add(edges);
    arrows.forEach((arrow) => pad.add(arrow));
    pad.add(finishRing);
    pad.add(finishLine);
    stripes.forEach((stripe) => pad.add(stripe));
    beacons.forEach((beacon) => pad.add(beacon));
    pad.userData.body = body;
    pad.userData.edges = edges;
    pad.userData.arrows = arrows;
    pad.userData.finishRing = finishRing;
    pad.userData.finishLine = finishLine;
    pad.userData.stripes = stripes;
    pad.userData.beacons = beacons;
    scene.add(pad);
    landingPads.push(pad);
  }

  return landingPads;
}

export function applyPlatformVisual(pad, platform, isCurrentTarget, isFinishLanding = false) {
  const bodyMaterial = pad.userData.body.material;
  const edgeMaterial = pad.userData.edges.material;
  const arrows = pad.userData.arrows;
  const finishRing = pad.userData.finishRing;
  const finishLine = pad.userData.finishLine;
  const stripes = pad.userData.stripes;
  const beacons = pad.userData.beacons;

  finishRing.visible = isFinishLanding;
  finishLine.visible = isFinishLanding;

  if (isFinishLanding) {
    const finishOpacity = isCurrentTarget ? 0.76 : 0.5;
    finishRing.material.opacity = finishOpacity;
    finishLine.material.opacity = finishOpacity * 0.86;
    finishRing.scale.setScalar(isCurrentTarget ? 1.12 : 1);
    finishLine.scale.set(1, 1, isCurrentTarget ? 1.4 : 1);
  }

  if (platform.type === 'wildcard') {
    bodyMaterial.color.setHex(wildcardPad.pad);
    bodyMaterial.emissive.setHex(wildcardPad.emissive);
    bodyMaterial.emissiveIntensity = isCurrentTarget ? 2.25 : 1.55;
    bodyMaterial.opacity = 0.96;
    edgeMaterial.color.setHex(0xffffff);
    edgeMaterial.opacity = isCurrentTarget ? 1 : 0.95;
    arrows.forEach((arrow, arrowIndex) => {
      arrow.material.color.setHex(0xffffff);
      arrow.material.opacity = isCurrentTarget ? 0.38 - arrowIndex * 0.08 : 0.22 - arrowIndex * 0.05;
    });
    stripes.forEach((stripe, stripeIndex) => {
      stripe.visible = true;
      stripe.material.opacity = isCurrentTarget ? 1 : 0.86;
      stripe.position.y = 0.11 + Math.sin(performance.now() * 0.006 + stripeIndex) * 0.012;
    });
    beacons.forEach((beacon, beaconIndex) => {
      beacon.visible = true;
      beacon.material.opacity = isCurrentTarget ? 1 : 0.82;
      beacon.scale.y = 1 + Math.sin(performance.now() * 0.006 + beaconIndex) * 0.16;
    });
    return;
  }

  const color = gameColors[platform.color];
  stripes.forEach((stripe) => {
    stripe.visible = false;
  });
  beacons.forEach((beacon) => {
    beacon.visible = false;
  });
  bodyMaterial.color.setHex(color.pad);
  bodyMaterial.emissive.setHex(color.emissive);
  bodyMaterial.emissiveIntensity = isCurrentTarget ? 1.2 : 0.75;
  bodyMaterial.opacity = 0.82;
  edgeMaterial.color.setHex(color.edge);
  edgeMaterial.opacity = isCurrentTarget ? 0.92 : 0.72;
  arrows.forEach((arrow, arrowIndex) => {
    arrow.material.color.setHex(color.edge);
    arrow.material.opacity = isCurrentTarget ? 0.34 - arrowIndex * 0.07 : 0.2 - arrowIndex * 0.05;
  });
}
