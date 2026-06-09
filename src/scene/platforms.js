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
    pad.add(body);
    pad.add(edges);
    stripes.forEach((stripe) => pad.add(stripe));
    beacons.forEach((beacon) => pad.add(beacon));
    pad.userData.body = body;
    pad.userData.edges = edges;
    pad.userData.stripes = stripes;
    pad.userData.beacons = beacons;
    scene.add(pad);
    landingPads.push(pad);
  }

  return landingPads;
}

export function applyPlatformVisual(pad, platform, isCurrentTarget) {
  const bodyMaterial = pad.userData.body.material;
  const edgeMaterial = pad.userData.edges.material;
  const stripes = pad.userData.stripes;
  const beacons = pad.userData.beacons;

  if (platform.type === 'wildcard') {
    bodyMaterial.color.setHex(wildcardPad.pad);
    bodyMaterial.emissive.setHex(wildcardPad.emissive);
    bodyMaterial.emissiveIntensity = isCurrentTarget ? 2.25 : 1.55;
    bodyMaterial.opacity = 0.96;
    edgeMaterial.color.setHex(0xffffff);
    edgeMaterial.opacity = isCurrentTarget ? 1 : 0.95;
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
}
