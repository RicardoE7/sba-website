import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.querySelector("#watch-canvas");
const showcase = document.querySelector(".scroll-showcase");
const title = document.querySelector("#showcase-title");
const description = document.querySelector("#showcase-description");
const copy = document.querySelector(".showcase-copy");

let currentStepIndex = 0;
let isChangingText = false;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  35,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  100
);

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

let watchModel;

/* =====================================
   Responsive camera + model sizing
===================================== */

function lerp(min, max, t) {
  return min + (max - min) * t;
}

function getResponsiveSettings() {
  const width = canvas.clientWidth;

  // Clamp width between mobile and desktop sizes
  const t = Math.min(Math.max((width - 360) / (1440 - 360), 0), 1);

 const scale = width >= 500 ? 2.1: lerp(1.2, 1.8, t);

return {
  scale,
  cameraY: lerp(0.4, 1.0, t),
  cameraZ: lerp(11, 9, t),
};
}

function applyResponsiveSettings() {
  const settings = getResponsiveSettings();

  camera.position.set(0, settings.cameraY, settings.cameraZ);

  if (watchModel) {
    watchModel.scale.setScalar(settings.scale);
  }
}

function resizeRenderer() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  renderer.setSize(width, height, false);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  applyResponsiveSettings();
}

resizeRenderer();
window.addEventListener("resize", resizeRenderer);

/* =====================================
   Lighting
===================================== */

const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 3);
keyLight.position.set(4, 5, 6);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
fillLight.position.set(-4, 2, 3);
scene.add(fillLight);

/* =====================================
   Load Model
===================================== */

const loader = new GLTFLoader();

loader.load(
  "models/watch.glb",
  (gltf) => {
    watchModel = gltf.scene;

    const box = new THREE.Box3().setFromObject(watchModel);
    const center = box.getCenter(new THREE.Vector3());

    watchModel.position.x -= center.x;
    watchModel.position.y -= center.y;
    watchModel.position.z -= center.z;

    watchModel.rotation.set(0.1, -0.4, 0);

    applyResponsiveSettings();

    scene.add(watchModel);
  },
  undefined,
  (error) => {
    console.error("Error loading watch model:", error);
  }
);

/* =====================================
   Showcase Text
===================================== */

const showcaseSteps = [
  {
    title: "VVS Diamonds",
    description:
      "Each stone is selected for brilliance, clarity, and flawless symmetry.",
  },
  {
    title: "White Gold Case",
    description:
      "A sculpted 18K white gold case gives the piece its unmistakable presence.",
  },
  {
    title: "Precision Movement",
    description:
      "Engineered for accuracy, balance, and a movement worthy of legacy.",
  },
];

/* =====================================
   Scroll Animation
===================================== */

function updateScrollAnimation() {
  if (!watchModel) return;

  const rect = showcase.getBoundingClientRect();
  const scrollableDistance = showcase.offsetHeight - window.innerHeight;

  const progress = Math.min(
    Math.max(-rect.top / scrollableDistance, 0),
    1
  );

  watchModel.rotation.y = -0.4 + progress * Math.PI * 1.4;
  watchModel.rotation.x = 0.1 + progress * 0.35;
  watchModel.position.x = progress * -0.55;

  // Keep scale responsive
  watchModel.scale.setScalar(getResponsiveSettings().scale);

  const stepIndex = Math.min(
    Math.floor(progress * showcaseSteps.length),
    showcaseSteps.length - 1
  );

  if (stepIndex !== currentStepIndex && !isChangingText) {
    isChangingText = true;
    copy.classList.add("is-changing");

    setTimeout(() => {
      title.textContent = showcaseSteps[stepIndex].title;
      description.textContent = showcaseSteps[stepIndex].description;

      currentStepIndex = stepIndex;

      copy.classList.remove("is-changing");

      setTimeout(() => {
        isChangingText = false;
      }, 280);
    }, 280);
  }
}

/* =====================================
   Render Loop
===================================== */

function animate() {
  updateScrollAnimation();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();