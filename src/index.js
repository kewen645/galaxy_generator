import './style/main.css'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 360 });

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//   new THREE.BoxBufferGeometry(1, 1, 1),
//   new THREE.MeshBasicMaterial()
// )
// scene.add(cube)

// Galaxy
const parameters = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: '#ff6030',
  outsideColor: '#1b3984'
}

// 将变量拉出来，因为每次新生成galaxy之前都要判断并清空原有的galaxy
let particlesGeometry = null
let particlesMaterial = null
let particles = null

// generate galaxy 
const generateGalaxy = () => {
  // clear the previous existing galaxy
  if (particles) {
    particlesGeometry.dispose()
    particlesMaterial.dispose()
    scene.remove(particles)
  }

  // geometry
  particlesGeometry = new THREE.BufferGeometry()

  // data
  let positions = new Float32Array(parameters.count * 3)
  let colors = new Float32Array(parameters.count * 3)

  const insideColor = new THREE.Color(parameters.insideColor)
  const outsideColor = new THREE.Color(parameters.outsideColor)


  for (let i = 0;i < parameters.count;i++) {
    const base = i * 3
    const radius = Math.random() * parameters.radius
    const branchAngle = i % parameters.branches / parameters.branches * Math.PI * 2
    // 离中心越远，radius越大，spin偏移越大
    const spinAngle = radius * parameters.spin

    // 利用数学公式y = x ^ 2 的曲线，使得越接近原点的particle更集中，越远的就更偏向于远端
    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

    positions[base] = Math.sin(branchAngle + spinAngle) * radius + randomX
    positions[base + 1] = randomY
    positions[base + 2] = Math.cos(branchAngle + spinAngle) * radius + randomZ

    // color data
    // lerp: linearly interpolate the colors
    // lerp会修改原有的颜色，所以要深拷贝
    const mixedColor = insideColor.clone()
    mixedColor.lerp(outsideColor, radius / parameters.radius)

    colors[base] = mixedColor.r
    colors[base + 1] = mixedColor.g
    colors[base + 2] = mixedColor.b

  }

  // geometry attr
  particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  )

  particlesGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
  )

  // material
  particlesMaterial = new THREE.PointsMaterial(
    {
      size: parameters.size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    }
  )

  // particles
  particles = new THREE.Points(particlesGeometry, particlesMaterial)
  scene.add(particles)
}

generateGalaxy()

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

gui.add(parameters, 'count').min(500).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)