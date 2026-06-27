import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.querySelector("#watch-canvas");
const showcase = document.querySelector(".scroll-showcase");
const title = document.querySelector("#showcase-title");
const description = document.querySelector("#showcase-description");

const BASE_SCALE = 2;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  35,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  100
);

camera.position.set(0, 1, 9);

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});

renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 3);
keyLight.position.set(4, 5, 6);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
fillLight.position.set(-4, 2, 3);
scene.add(fillLight);

let watchModel;

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

    watchModel.scale.setScalar(BASE_SCALE);
    watchModel.rotation.set(0.1, -0.4, 0);

    scene.add(watchModel);
  },
  undefined,
  (error) => {
    console.error("Error loading watch model:", error);
  }
);

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

function updateScrollAnimation() {
  if (!watchModel) return;

  const rect = showcase.getBoundingClientRect();
  const scrollableDistance = showcase.offsetHeight - window.innerHeight;

  const progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1);

  watchModel.rotation.y = -0.4 + progress * Math.PI * 1.4;
  watchModel.rotation.x = 0.1 + progress * 0.35;
  watchModel.position.x = progress * -0.55;

  watchModel.scale.setScalar(BASE_SCALE);

  const stepIndex = Math.min(
    Math.floor(progress * showcaseSteps.length),
    showcaseSteps.length - 1
  );

  title.textContent = showcaseSteps[stepIndex].title;
  description.textContent = showcaseSteps[stepIndex].description;
}

function animate() {
  updateScrollAnimation();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();