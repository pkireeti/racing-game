import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87a7c0);
scene.fog = new THREE.Fog(0x87a7c0, 90, 420);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  700
);
camera.position.set(0, 7, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// ---------- LIGHTING ----------
const hemi = new THREE.HemisphereLight(0xdceeff, 0x40533d, 2.0);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffffff, 3.0);
sun.position.set(80, 120, 40);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -180;
sun.shadow.camera.right = 180;
sun.shadow.camera.top = 180;
sun.shadow.camera.bottom = -180;
scene.add(sun);

// ---------- GROUND ----------
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(700, 700),
  new THREE.MeshStandardMaterial({ color: 0x4b6843, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ---------- TRACK ----------
const trackWidth = 18;
const roadLength = 320;

const road = new THREE.Mesh(
  new THREE.PlaneGeometry(trackWidth, roadLength),
  new THREE.MeshStandardMaterial({
    color: 0x292b2e,
    roughness: 0.92,
    metalness: 0.02
  })
);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.03;
road.receiveShadow = true;
scene.add(road);

// Road edge strips
function createBox(w, h, d, color, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

createBox(0.5, 0.08, roadLength, 0xffffff, -trackWidth / 2, 0.09, 0);
createBox(0.5, 0.08, roadLength, 0xffffff, trackWidth / 2, 0.09, 0);

// Dashed center line
for (let z = -roadLength / 2 + 6; z < roadLength / 2; z += 12) {
  createBox(0.22, 0.06, 5.5, 0xf5f1d0, 0, 0.1, z);
}

// Barriers
for (let z = -roadLength / 2; z <= roadLength / 2; z += 10) {
  createBox(0.7, 0.65, 4.5, 0xd9d9d9, -trackWidth / 2 - 1.2, 0.35, z);
  createBox(0.7, 0.65, 4.5, 0xd9d9d9, trackWidth / 2 + 1.2, 0.35, z);
}

// ---------- SCENERY ----------
function addTree(x, z, scale = 1) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.38, 2.3, 8),
    new THREE.MeshStandardMaterial({ color: 0x6b4327 })
  );
  trunk.position.set(x, 1.15 * scale, z);
  trunk.scale.setScalar(scale);
  trunk.castShadow = true;
  scene.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(1.25, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0x244f2b, roughness: 1 })
  );
  crown.position.set(x, 2.7 * scale, z);
  crown.scale.setScalar(scale);
  crown.castShadow = true;
  scene.add(crown);
}

for (let z = -150; z <= 150; z += 14) {
  addTree(-25 - Math.random() * 15, z + Math.random() * 5, 0.8 + Math.random() * 0.5);
  addTree(25 + Math.random() * 15, z + Math.random() * 5, 0.8 + Math.random() * 0.5);
}

// ---------- PLAYER CAR ----------
const car = new THREE.Group();
car.position.set(0, 0.75, 110);
scene.add(car);

const body = new THREE.Mesh(
  new THREE.BoxGeometry(2.4, 0.65, 4.4),
  new THREE.MeshStandardMaterial({
    color: 0xc62828,
    metalness: 0.55,
    roughness: 0.28
  })
);
body.castShadow = true;
car.add(body);

const cabin = new THREE.Mesh(
  new THREE.BoxGeometry(1.65, 0.62, 2.0),
  new THREE.MeshStandardMaterial({
    color: 0x18232c,
    metalness: 0.35,
    roughness: 0.2
  })
);
cabin.position.set(0, 0.52, -0.15);
cabin.castShadow = true;
car.add(cabin);

// Wheels
const wheelGeometry = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 20);
const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

const wheelPositions = [
  [-1.25, -0.35, 1.35],
  [1.25, -0.35, 1.35],
  [-1.25, -0.35, -1.35],
  [1.25, -0.35, -1.35]
];

for (const [x, y, z] of wheelPositions) {
  const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(x, y, z);
  wheel.castShadow = true;
  car.add(wheel);
}

// Headlights
for (const x of [-0.7, 0.7]) {
  const light = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.18, 0.08),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 2
    })
  );
  light.position.set(x, 0.1, -2.23);
  car.add(light);
}

// ---------- INPUT ----------
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;

  if (e.key.toLowerCase() === "c") {
    cameraMode = (cameraMode + 1) % 3;
    updateCameraLabel();
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

let speed = 0;
let cameraMode = 0;

const MAX_SPEED = 38;
const REVERSE_SPEED = -12;
const ACCELERATION = 22;
const BRAKE = 32;
const DRAG = 8;
const STEER_SPEED = 1.7;

function updateCameraLabel() {
  const names = ["Chase", "Close", "Cockpit"];
  document.getElementById("cameraMode").textContent = names[cameraMode];
}
updateCameraLabel();

// ---------- GAME UPDATE ----------
const clock = new THREE.Clock();

function updatePlayer(delta) {
  const accelerate = keys["w"] || keys["arrowup"];
  const brake = keys["s"] || keys["arrowdown"];
  const left = keys["a"] || keys["arrowleft"];
  const right = keys["d"] || keys["arrowright"];

  if (accelerate) {
    speed += ACCELERATION * delta;
  } else {
    if (speed > 0) speed = Math.max(0, speed - DRAG * delta);
  }

  if (brake) {
    if (speed > 0) speed -= BRAKE * delta;
    else speed -= ACCELERATION * 0.6 * delta;
  }

  speed = THREE.MathUtils.clamp(speed, REVERSE_SPEED, MAX_SPEED);

  if (Math.abs(speed) > 0.2) {
    const steering = (right ? 1 : 0) - (left ? 1 : 0);
    const direction = speed >= 0 ? 1 : -1;

    car.rotation.y -= steering * STEER_SPEED * delta * direction *
      Math.min(Math.abs(speed) / MAX_SPEED + 0.2, 1.2);
  }

  // Car's forward direction is negative local Z.
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(car.quaternion);
  car.position.addScaledVector(forward, speed * delta);

  // Keep the prototype car on the road.
  car.position.x = THREE.MathUtils.clamp(
    car.position.x,
    -trackWidth / 2 + 1.5,
    trackWidth / 2 - 1.5
  );

  // Keep the car within the prototype track.
  if (car.position.z < -roadLength / 2 + 3) {
    car.position.z = -roadLength / 2 + 3;
  }
  if (car.position.z > roadLength / 2 - 3) {
    car.position.z = roadLength / 2 - 3;
  }

  // Small body roll for a more dynamic feel.
  const steering = (right ? 1 : 0) - (left ? 1 : 0);
  car.rotation.z = THREE.MathUtils.lerp(
    car.rotation.z,
    -steering * 0.06 * Math.min(Math.abs(speed) / MAX_SPEED, 1),
    8 * delta
  );

  document.getElementById("speed").textContent =
    Math.round(Math.abs(speed) * 4.0);
}

function updateCamera(delta) {
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(car.quaternion);

  let targetPosition;
  let lookTarget;

  if (cameraMode === 0) {
    targetPosition = car.position.clone()
      .addScaledVector(forward, -10)
      .add(new THREE.Vector3(0, 5.5, 0));
    lookTarget = car.position.clone()
      .addScaledVector(forward, 7)
      .add(new THREE.Vector3(0, 1, 0));
  } else if (cameraMode === 1) {
    targetPosition = car.position.clone()
      .addScaledVector(forward, -5.5)
      .add(new THREE.Vector3(0, 2.7, 0));
    lookTarget = car.position.clone()
      .addScaledVector(forward, 8)
      .add(new THREE.Vector3(0, 1, 0));
  } else {
    targetPosition = car.position.clone()
      .add(new THREE.Vector3(0, 1.8, 0))
      .addScaledVector(forward, 0.2);
    lookTarget = car.position.clone()
      .addScaledVector(forward, 15)
      .add(new THREE.Vector3(0, 1.5, 0));
  }

  const smoothing = 1 - Math.pow(0.001, delta);
  camera.position.lerp(targetPosition, smoothing);
  camera.lookAt(lookTarget);
}

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  updatePlayer(delta);
  updateCamera(delta);

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

document.getElementById("loading").style.display = "none";
animate();
