import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clampProgress, sculpturePose } from './sceneMotion.mjs';

function roundedOutline(path, size, radius, clockwise = false) {
  // Shape and hole use opposite winding; extruded caps stay watertight.
  const points = [[size - radius, size - radius, 0, Math.PI / 2], [-size + radius, size - radius, Math.PI / 2, Math.PI], [-size + radius, -size + radius, Math.PI, Math.PI * 1.5], [size - radius, -size + radius, Math.PI * 1.5, Math.PI * 2]];
  if (clockwise) points.reverse().forEach(([x, y, a, b]) => path.absarc(x, y, radius, b, a, true));
  else points.forEach(([x, y, a, b]) => path.absarc(x, y, radius, a, b, false));
  path.closePath();
}

export function createSculpture(host, { onReady, onError }) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: new URLSearchParams(location.search).has('capture-scene') });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.35 : 1.65));
  renderer.setClearColor(0xeeeae2, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, .1, 40);
  const environmentScene = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(environmentScene, .035);
  scene.environment = environment.texture;
  scene.environmentIntensity = 1.05;
  environmentScene.dispose();
  pmrem.dispose();

  const sculpture = new THREE.Group();
  scene.add(sculpture);
  const shape = new THREE.Shape();
  roundedOutline(shape, 1.35, .6);
  const hole = new THREE.Path();
  roundedOutline(hole, .88, .4, true);
  shape.holes.push(hole);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: .19, bevelEnabled: true, bevelSegments: 5, steps: 1, bevelSize: .105, bevelThickness: .105, curveSegments: 20 });
  geometry.center();
  geometry.rotateX(-Math.PI / 2);
  const porcelain = new THREE.MeshPhysicalMaterial({ color: 0xdfd9cc, metalness: .28, roughness: .24, clearcoat: .5, clearcoatRoughness: .2 });
  const champagne = new THREE.MeshStandardMaterial({ color: 0x9d8563, metalness: .92, roughness: .29 });
  const rings = [-1, 0, 1].map((layer, index) => {
    const object = new THREE.Mesh(geometry, index === 1 ? champagne : porcelain);
    object.rotation.y = index * .1;
    object.userData.layer = layer;
    sculpture.add(object);
    return object;
  });
  const coreGeometry = new THREE.SphereGeometry(.51, 48, 32);
  const core = new THREE.Mesh(coreGeometry, champagne);
  sculpture.add(core);

  const key = new THREE.DirectionalLight(0xfff5e4, 3);
  key.position.set(-3, 6, 5);
  scene.add(key, new THREE.HemisphereLight(0xffffff, 0xaaa18f, .9));
  const rim = new THREE.DirectionalLight(0xffffff, 2);
  rim.position.set(4, 2, -4);
  scene.add(rim);

  // Soft contact shadow is a procedural texture; no remote imagery or environment download.
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 5, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(48,39,27,.2)');
  gradient.addColorStop(.45, 'rgba(48,39,27,.09)');
  gradient.addColorStop(1, 'rgba(48,39,27,0)');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowGeometry = new THREE.PlaneGeometry(6.4, 6.4);
  const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false });
  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.65;
  scene.add(shadow);

  let disposed = false, frame = 0, progress = 0, target = 0, active = true, rendered = 0;
  function draw() {
    frame = 0;
    if (disposed || !active || document.hidden) return;
    progress += (target - progress) * .15;
    if (Math.abs(target - progress) < .0001) progress = target;
    const pose = sculpturePose(progress);
    camera.position.set(pose.x, pose.y, pose.z);
    camera.lookAt(0, -.12, 0);
    sculpture.rotation.y = pose.rotation;
    sculpture.rotation.z = -.11 + Math.sin(progress * Math.PI) * .1;
    for (const ring of rings) {
      ring.position.y = ring.userData.layer * pose.spread;
      ring.rotation.y = ring.userData.layer * (progress * .4 + .1);
    }
    core.scale.setScalar(pose.core);
    renderer.render(scene, camera);
    host.dataset.progress = progress.toFixed(4);
    host.dataset.frames = String(++rendered);
    if (Math.abs(target - progress) > .0001) schedule();
  }
  function schedule() { if (!disposed && active && !document.hidden && !frame) frame = requestAnimationFrame(draw); }
  function resize() {
    if (disposed) return;
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Portrait compositions keep the same silhouette instead of clipping the sculpture.
    camera.fov = width / height < .85 ? 40 : 31;
    camera.updateProjectionMatrix(); schedule();
  }
  const observer = new ResizeObserver(resize); observer.observe(host);
  const visibility = () => { if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; } else schedule(); };
  const lost = event => { event.preventDefault(); active = false; if (frame) cancelAnimationFrame(frame); onError?.(); };
  document.addEventListener('visibilitychange', visibility);
  renderer.domElement.addEventListener('webglcontextlost', lost);
  resize(); draw(); onReady?.();
  return {
    capture() { renderer.render(scene, camera); return renderer.domElement.toDataURL('image/webp', .9); },
    setProgress(value) { target = clampProgress(value); schedule(); },
    setActive(value) { active = value; if (!active && frame) { cancelAnimationFrame(frame); frame = 0; } else schedule(); },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      geometry.dispose(); coreGeometry.dispose(); shadowGeometry.dispose();
      porcelain.dispose(); champagne.dispose(); shadowMaterial.dispose(); shadowTexture.dispose();
      environment.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
