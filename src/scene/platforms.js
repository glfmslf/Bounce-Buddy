import * as THREE from 'three';
import {
  driftPad,
  gameColors,
  lanePositions,
  overloadPad,
  phasePad,
  perfectLandingRadius,
  visibleLandingCount,
  wildcardPad,
} from '../game/config.js';

const landingPadGeometry = new THREE.BoxGeometry(1.72, 0.16, 1.45);
const wildcardStripeGeometry = new THREE.BoxGeometry(0.42, 0.035, 1.55);
const wildcardBeaconGeometry = new THREE.BoxGeometry(0.2, 0.34, 0.22);
const precisionZoneGeometry = new THREE.RingGeometry(
  perfectLandingRadius * 0.68,
  perfectLandingRadius,
  48
);
const finishRingGeometry = new THREE.RingGeometry(0.48, 0.62, 72);
const finishLineGeometry = new THREE.BoxGeometry(1.24, 0.026, 0.08);
const finishGatePostGeometry = new THREE.BoxGeometry(0.18, 3.2, 0.18);
const finishGateBeamGeometry = new THREE.BoxGeometry(7.6, 0.18, 0.18);
const finishGateHaloGeometry = new THREE.TorusGeometry(2.72, 0.045, 8, 96);
const finishGateNodeGeometry = new THREE.OctahedronGeometry(0.11, 0);
const retryMarkerRingGeometry = new THREE.RingGeometry(0.54, 0.72, 48);
const retryMarkerBarGeometry = new THREE.BoxGeometry(0.82, 0.085, 0.065);
const retryMarkerBeamGeometry = new THREE.CylinderGeometry(0.025, 0.025, 1.15, 12);
const overloadRingGeometry = new THREE.RingGeometry(0.48, 0.66, 48);
const phaseRingGeometry = new THREE.RingGeometry(0.48, 0.67, 6);
const driftRailGeometry = new THREE.BoxGeometry(2.4, 0.022, 0.07);
const driftMarkerGeometry = new THREE.CylinderGeometry(0.11, 0.11, 0.035, 24);
const landingArrowShape = new THREE.Shape()
  .moveTo(0, 0.28)
  .lineTo(0.36, -0.02)
  .lineTo(0.25, -0.16)
  .lineTo(0, 0.04)
  .lineTo(-0.25, -0.16)
  .lineTo(-0.36, -0.02)
  .lineTo(0, 0.28);
const landingArrowGeometry = new THREE.ShapeGeometry(landingArrowShape);
const shardCoreGeometry = new THREE.OctahedronGeometry(0.24, 0);
const shardHaloGeometry = new THREE.TorusGeometry(0.34, 0.024, 8, 32);
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
const precisionZoneMaterial = new THREE.MeshBasicMaterial({
  color: 0xa6f6ff,
  transparent: true,
  opacity: 0.2,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const shardCoreMaterial = new THREE.MeshStandardMaterial({
  color: 0xffef9a,
  emissive: 0xffd257,
  emissiveIntensity: 2.2,
  roughness: 0.18,
  metalness: 0.3,
});
const shardHaloMaterial = new THREE.MeshBasicMaterial({
  color: 0x91f7ff,
  transparent: true,
  opacity: 0.72,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const finishGoalMaterial = new THREE.MeshBasicMaterial({
  color: 0xffd257,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const finishGateFrameMaterial = new THREE.MeshStandardMaterial({
  color: 0x12324f,
  emissive: 0x29d7ff,
  emissiveIntensity: 1.1,
  roughness: 0.24,
  metalness: 0.56,
  transparent: true,
  opacity: 0.82,
});
const finishGateGoldMaterial = new THREE.MeshBasicMaterial({
  color: 0xffef9a,
  transparent: true,
  opacity: 0.82,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const finishGateCyanMaterial = new THREE.MeshBasicMaterial({
  color: 0x91f7ff,
  transparent: true,
  opacity: 0.64,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const retryMarkerMaterial = new THREE.MeshBasicMaterial({
  color: 0xff6f91,
  transparent: true,
  opacity: 0.68,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const overloadRingMaterial = new THREE.MeshBasicMaterial({
  color: overloadPad.edge,
  transparent: true,
  opacity: 0.68,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const phaseRingMaterial = new THREE.MeshBasicMaterial({
  color: phasePad.activeEdge,
  transparent: true,
  opacity: 0.72,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const driftRailMaterial = new THREE.MeshBasicMaterial({
  color: driftPad.edge,
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const driftMarkerMaterial = new THREE.MeshBasicMaterial({
  color: driftPad.emissive,
  transparent: true,
  opacity: 0.75,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
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
    const precisionZone = new THREE.Mesh(
      precisionZoneGeometry,
      precisionZoneMaterial.clone()
    );
    precisionZone.rotation.x = -Math.PI / 2;
    precisionZone.position.set(0, 0.132, 0);
    precisionZone.renderOrder = 2;
    const shard = new THREE.Group();
    const shardCore = new THREE.Mesh(shardCoreGeometry, shardCoreMaterial.clone());
    const shardHalo = new THREE.Mesh(shardHaloGeometry, shardHaloMaterial.clone());
    shardHalo.rotation.x = Math.PI / 2;
    shard.add(shardCore, shardHalo);
    shard.visible = false;
    shard.userData.animationOffset = i * 0.47;
    const finishRing = new THREE.Mesh(finishRingGeometry, finishGoalMaterial.clone());
    const finishLine = new THREE.Mesh(finishLineGeometry, finishGoalMaterial.clone());
    const overloadRing = new THREE.Mesh(overloadRingGeometry, overloadRingMaterial.clone());
    const phaseRing = new THREE.Mesh(phaseRingGeometry, phaseRingMaterial.clone());
    const driftRail = new THREE.Mesh(driftRailGeometry, driftRailMaterial.clone());
    const driftMarkers = [0, 1].map(() => (
      new THREE.Mesh(driftMarkerGeometry, driftMarkerMaterial.clone())
    ));
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
    overloadRing.rotation.x = -Math.PI / 2;
    overloadRing.position.set(0, 0.138, 0);
    overloadRing.visible = false;
    phaseRing.rotation.x = -Math.PI / 2;
    phaseRing.position.set(0, 0.14, 0);
    phaseRing.visible = false;
    driftRail.position.set(0, 0.105, 0.56);
    driftRail.visible = false;
    driftMarkers.forEach((marker) => {
      marker.position.set(0, 0.125, 0.56);
      marker.visible = false;
    });
    pad.add(body);
    pad.add(edges);
    arrows.forEach((arrow) => pad.add(arrow));
    pad.add(precisionZone);
    pad.add(finishRing);
    pad.add(shard);
    pad.add(finishLine);
    pad.add(overloadRing);
    pad.add(phaseRing);
    pad.add(driftRail);
    driftMarkers.forEach((marker) => pad.add(marker));
    stripes.forEach((stripe) => pad.add(stripe));
    beacons.forEach((beacon) => pad.add(beacon));
    pad.userData.body = body;
    pad.userData.edges = edges;
    pad.userData.arrows = arrows;
    pad.userData.precisionZone = precisionZone;
    pad.userData.finishRing = finishRing;
    pad.userData.shard = shard;
    pad.userData.finishLine = finishLine;
    pad.userData.overloadRing = overloadRing;
    pad.userData.phaseRing = phaseRing;
    pad.userData.driftRail = driftRail;
    pad.userData.driftMarkers = driftMarkers;
    pad.userData.stripes = stripes;
    pad.userData.beacons = beacons;
    scene.add(pad);
    landingPads.push(pad);
  }

  return landingPads;
}

export function createFinishGate(scene) {
  const gate = new THREE.Group();
  const frameMaterial = finishGateFrameMaterial.clone();
  const posts = [-3.55, 3.55].map((x) => {
    const post = new THREE.Mesh(finishGatePostGeometry, frameMaterial);
    post.position.set(x, 1.6, 0);
    return post;
  });
  const beam = new THREE.Mesh(finishGateBeamGeometry, frameMaterial);
  beam.position.set(0, 3.15, 0);
  const halos = [finishGateGoldMaterial, finishGateCyanMaterial].map(
    (material, index) => {
      const halo = new THREE.Mesh(finishGateHaloGeometry, material.clone());
      halo.position.set(0, 2.78, index * 0.08 - 0.04);
      halo.scale.setScalar(1 - index * 0.06);
      return halo;
    }
  );
  const nodes = Array.from({ length: 10 }, (_, index) => {
    const angle = (index / 10) * Math.PI * 2;
    const node = new THREE.Mesh(
      finishGateNodeGeometry,
      (index % 2 === 0 ? finishGateGoldMaterial : finishGateCyanMaterial).clone()
    );
    node.position.set(
      Math.cos(angle) * 2.72,
      2.78 + Math.sin(angle) * 2.72,
      0.06
    );
    return node;
  });

  gate.add(...posts, beam, ...halos, ...nodes);
  gate.visible = false;
  gate.userData.frameMaterial = frameMaterial;
  gate.userData.halos = halos;
  gate.userData.nodes = nodes;
  scene.add(gate);
  return gate;
}

export function applyFinishGateVisual(
  gate,
  {
    elapsedSeconds = 0,
    isNear = false,
    lowPower = false,
    visible = false,
    z = 0,
  } = {}
) {
  gate.visible = visible;

  if (!visible) {
    return;
  }

  const pulse = lowPower
    ? 0
    : (Math.sin(elapsedSeconds * (isNear ? 5.2 : 2.6)) + 1) / 2;
  const glow = isNear ? 1.45 + pulse * 0.75 : 0.9 + pulse * 0.35;
  gate.position.set(0, 0, z);
  gate.userData.frameMaterial.emissiveIntensity = glow;
  gate.userData.frameMaterial.opacity = isNear ? 0.94 : 0.76;
  gate.userData.halos.forEach((halo, index) => {
    halo.material.opacity = (isNear ? 0.82 : 0.48) + pulse * (0.16 - index * 0.03);
    halo.rotation.z = lowPower
      ? 0
      : elapsedSeconds * (index === 0 ? 0.16 : -0.12);
  });
  gate.userData.nodes.forEach((node, index) => {
    const nodePulse = lowPower
      ? 1
      : 0.86 + Math.sin(elapsedSeconds * 4.2 + index * 0.7) * 0.18;
    node.material.opacity = isNear ? 0.92 : 0.58;
    node.scale.setScalar(nodePulse * (isNear ? 1.16 : 1));
  });
}

export function createRetryMarker(scene) {
  const marker = new THREE.Group();
  const ring = new THREE.Mesh(retryMarkerRingGeometry, retryMarkerMaterial.clone());
  const bars = [-1, 1].map((direction) => {
    const bar = new THREE.Mesh(retryMarkerBarGeometry, retryMarkerMaterial.clone());
    bar.position.set(0, 0.76, 0.02);
    bar.rotation.z = direction * Math.PI / 4;
    return bar;
  });
  const beam = new THREE.Mesh(retryMarkerBeamGeometry, retryMarkerMaterial.clone());

  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.14;
  beam.position.y = 0.58;
  marker.add(ring, ...bars, beam);
  marker.visible = false;
  marker.userData.ring = ring;
  marker.userData.bars = bars;
  marker.userData.beam = beam;
  marker.userData.materials = [ring, ...bars, beam].map((mesh) => mesh.material);
  scene.add(marker);
  return marker;
}

export function applyRetryMarkerVisual(
  marker,
  {
    elapsedSeconds = 0,
    isNext = false,
    lowPower = false,
    reason = 'miss',
    visible = false,
    x = 0,
    z = 0,
  } = {}
) {
  marker.visible = visible;

  if (!visible) {
    return;
  }

  const color = reason === 'color' ? 0xff557d : 0xffd257;
  const pulse = lowPower ? 0 : (Math.sin(elapsedSeconds * 5.4) + 1) / 2;
  const scale = (isNext ? 1.14 : 1) + pulse * (isNext ? 0.08 : 0.04);
  marker.position.set(x, 0, z);
  marker.scale.setScalar(scale);
  marker.userData.materials.forEach((material, index) => {
    material.color.setHex(color);
    material.opacity = (isNext ? 0.78 : 0.48) + pulse * (0.16 - index * 0.02);
  });
  marker.userData.ring.rotation.z = lowPower ? 0 : elapsedSeconds * 0.42;
  marker.userData.beam.scale.y = lowPower ? 1 : 0.92 + pulse * 0.22;
}
export function applyPlatformVisual(
  pad,
  platform,
  isCurrentTarget,
  isFinishLanding = false,
  showShard = false,
  phaseState = null,
  driftState = null
) {
  const bodyMaterial = pad.userData.body.material;
  const edgeMaterial = pad.userData.edges.material;
  const arrows = pad.userData.arrows;
  const precisionZone = pad.userData.precisionZone;
  const finishRing = pad.userData.finishRing;
  const shard = pad.userData.shard;
  const finishLine = pad.userData.finishLine;
  const stripes = pad.userData.stripes;
  const beacons = pad.userData.beacons;
  const overloadRing = pad.userData.overloadRing;
  const phaseRing = pad.userData.phaseRing;
  const driftRail = pad.userData.driftRail;
  const driftMarkers = pad.userData.driftMarkers;

  finishRing.visible = isFinishLanding;
  finishLine.visible = isFinishLanding;
  shard.visible = showShard;
  overloadRing.visible = platform.type === 'overload';
  phaseRing.visible = platform.type === 'phase';
  driftRail.visible = platform.type === 'drift';
  driftMarkers.forEach((marker) => {
    marker.visible = platform.type === 'drift';
  });
  arrows.forEach((arrow) => {
    arrow.rotation.z = 0;
  });

  if (showShard) {
    const animationTime = performance.now() * 0.004 + shard.userData.animationOffset;
    shard.position.y = 0.72 + Math.sin(animationTime) * 0.08;
    shard.rotation.y = animationTime * 0.72;
    shard.rotation.z = Math.sin(animationTime * 0.7) * 0.18;
    shard.scale.setScalar(isCurrentTarget ? 1.18 : 1);
  }

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
    const nextColor = gameColors[platform.nextColor] ?? gameColors.blue;
    precisionZone.material.color.setHex(nextColor.edge);
    precisionZone.material.opacity = isCurrentTarget ? 0.58 : 0.28;
    precisionZone.scale.setScalar(isCurrentTarget ? 1.08 : 1);
    arrows.forEach((arrow, arrowIndex) => {
      arrow.material.color.setHex(0xffffff);
      arrow.material.opacity = isCurrentTarget
        ? 0.38 - arrowIndex * 0.08
        : 0.22 - arrowIndex * 0.05;
    });
    stripes.forEach((stripe, stripeIndex) => {
      stripe.visible = true;
      stripe.material.opacity = isCurrentTarget ? 1 : 0.86;
      stripe.position.y =
        0.11 + Math.sin(performance.now() * 0.006 + stripeIndex) * 0.012;
    });
    beacons.forEach((beacon, beaconIndex) => {
      beacon.visible = true;
      beacon.material.opacity = isCurrentTarget ? 1 : 0.82;
      beacon.scale.y =
        1 + Math.sin(performance.now() * 0.006 + beaconIndex) * 0.16;
    });
    return;
  }

  if (platform.type === 'overload') {
    const pulse = 1 + Math.sin(performance.now() * 0.008) * 0.08;
    bodyMaterial.color.setHex(overloadPad.pad);
    bodyMaterial.emissive.setHex(overloadPad.emissive);
    bodyMaterial.emissiveIntensity = isCurrentTarget ? 2.45 : 1.7;
    bodyMaterial.opacity = 0.94;
    edgeMaterial.color.setHex(overloadPad.edge);
    edgeMaterial.opacity = isCurrentTarget ? 1 : 0.88;
    precisionZone.material.color.setHex(overloadPad.emissive);
    precisionZone.material.opacity = isCurrentTarget ? 0.66 : 0.38;
    precisionZone.scale.setScalar(isCurrentTarget ? 1.12 : 1.04);
    overloadRing.material.opacity = isCurrentTarget ? 0.94 : 0.62;
    overloadRing.material.color.setHex(overloadPad.edge);
    overloadRing.rotation.z = performance.now() * 0.0018;
    overloadRing.scale.setScalar(pulse * (isCurrentTarget ? 1.08 : 1));
    arrows.forEach((arrow, arrowIndex) => {
      arrow.material.color.setHex(overloadPad.emissive);
      arrow.material.opacity = isCurrentTarget
        ? 0.52 - arrowIndex * 0.08
        : 0.34 - arrowIndex * 0.06;
    });
    stripes.forEach((stripe) => {
      stripe.visible = false;
    });
    beacons.forEach((beacon) => {
      beacon.visible = false;
    });
    return;
  }

  if (platform.type === 'phase') {
    const phaseIntensity = phaseState?.intensity ?? 0;
    const isPhaseActive = Boolean(phaseState?.active);
    const emissiveColor = isPhaseActive
      ? phasePad.activeEmissive
      : phasePad.inactiveEmissive;
    const edgeColor = isPhaseActive
      ? phasePad.activeEdge
      : phasePad.inactiveEdge;
    bodyMaterial.color.setHex(phasePad.pad);
    bodyMaterial.emissive.setHex(emissiveColor);
    bodyMaterial.emissiveIntensity =
      0.9 + phaseIntensity * (isCurrentTarget ? 2.1 : 1.4);
    bodyMaterial.opacity = 0.78 + phaseIntensity * 0.18;
    edgeMaterial.color.setHex(edgeColor);
    edgeMaterial.opacity = 0.5 + phaseIntensity * 0.48;
    precisionZone.material.color.setHex(edgeColor);
    precisionZone.material.opacity =
      0.18 + phaseIntensity * (isCurrentTarget ? 0.58 : 0.38);
    precisionZone.scale.setScalar(1 + phaseIntensity * 0.12);
    phaseRing.material.color.setHex(edgeColor);
    phaseRing.material.opacity =
      0.24 + phaseIntensity * (isPhaseActive ? 0.72 : 0.32);
    phaseRing.rotation.z =
      performance.now() * (isPhaseActive ? 0.0024 : -0.0012);
    phaseRing.scale.setScalar(
      (0.96 + phaseIntensity * 0.16) * (isCurrentTarget ? 1.08 : 1)
    );
    arrows.forEach((arrow, arrowIndex) => {
      arrow.material.color.setHex(emissiveColor);
      arrow.material.opacity =
        0.12 + phaseIntensity * (0.38 - arrowIndex * 0.06);
    });
    stripes.forEach((stripe) => {
      stripe.visible = false;
    });
    beacons.forEach((beacon) => {
      beacon.visible = false;
    });
    return;
  }

  if (platform.type === 'drift') {
    const pulse = 0.84 + (driftState?.speed ?? 0) * 0.16;
    const dynamicX = driftState?.x ?? platform.x;
    const midpointX = driftState?.midpointX ?? platform.x;
    bodyMaterial.color.setHex(driftPad.pad);
    bodyMaterial.emissive.setHex(driftPad.emissive);
    bodyMaterial.emissiveIntensity = isCurrentTarget ? 2.35 : 1.55;
    bodyMaterial.opacity = 0.94;
    edgeMaterial.color.setHex(driftPad.edge);
    edgeMaterial.opacity = isCurrentTarget ? 1 : 0.86;
    precisionZone.material.color.setHex(driftPad.edge);
    precisionZone.material.opacity = isCurrentTarget ? 0.68 : 0.34;
    precisionZone.scale.setScalar(isCurrentTarget ? 1.12 : 1.03);
    driftRail.position.x = midpointX - dynamicX;
    driftRail.material.opacity = isCurrentTarget ? 0.78 : 0.46;
    driftMarkers[0].position.x = platform.x - dynamicX;
    driftMarkers[1].position.x = platform.driftTargetX - dynamicX;
    driftMarkers.forEach((marker, markerIndex) => {
      marker.material.opacity = isCurrentTarget ? 0.95 : 0.66;
      marker.scale.setScalar(pulse + markerIndex * 0.04);
    });
    arrows.forEach((arrow, arrowIndex) => {
      arrow.material.color.setHex(driftPad.edge);
      arrow.material.opacity = isCurrentTarget
        ? 0.54 - arrowIndex * 0.08
        : 0.32 - arrowIndex * 0.06;
      arrow.rotation.z =
        (driftState?.direction ?? 1) > 0 ? -Math.PI / 2 : Math.PI / 2;
    });
    stripes.forEach((stripe) => {
      stripe.visible = false;
    });
    beacons.forEach((beacon) => {
      beacon.visible = false;
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
  precisionZone.material.color.setHex(color.edge);
  precisionZone.material.opacity = isCurrentTarget ? 0.48 : 0.2;
  precisionZone.scale.setScalar(isCurrentTarget ? 1.08 : 1);
  arrows.forEach((arrow, arrowIndex) => {
    arrow.material.color.setHex(color.edge);
    arrow.material.opacity = isCurrentTarget
      ? 0.34 - arrowIndex * 0.07
      : 0.2 - arrowIndex * 0.05;
  });
}
