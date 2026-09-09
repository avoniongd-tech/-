const THREE = window.THREE;

let scene, camera, renderer, building;
let layers = [];
let currentLayer = -1;
let scrollProgress = 0;

const layerConfig = [
  { name: 'Участок', color: 0x8b7355, geometry: 'ground' },
  { name: 'Фундамент', color: 0x6b5d4f, geometry: 'foundation' },
  { name: 'Каркас', color: 0x8b8b8b, geometry: 'frame' },
  { name: 'Инженерия', color: 0xd4a574, geometry: 'engineering' },
  { name: 'Оболочка', color: 0xa0a0a0, geometry: 'shell' },
  { name: 'Отделка', color: 0xd2b48c, geometry: 'finishes' },
  { name: 'Финиш', color: 0xf5deb3, geometry: 'interior' }
];

function initThreeJs() {
  const canvas = document.getElementById('building-canvas');
  if (!canvas) return false;

  try {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1111);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 8, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Build layers
    buildLayers();

    // Handle resize
    window.addEventListener('resize', onWindowResize);

    // Render loop
    function animate() {
      requestAnimationFrame(animate);
      updateLayerVisibility();
      renderer.render(scene, camera);
    }
    animate();

    return true;
  } catch (e) {
    console.warn('Three.js initialization failed:', e);
    return false;
  }
}

function buildLayers() {
  const buildingGroup = new THREE.Group();

  layerConfig.forEach((config, index) => {
    const layerGroup = new THREE.Group();
    layerGroup.userData.index = index;

    let geometry;
    switch (config.geometry) {
      case 'ground':
        geometry = new THREE.PlaneGeometry(8, 8);
        const groundMesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: config.color }));
        groundMesh.receiveShadow = true;
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.position.y = -2;
        layerGroup.add(groundMesh);
        break;

      case 'foundation':
        geometry = new THREE.BoxGeometry(3, 0.3, 3);
        const foundationMesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: config.color }));
        foundationMesh.castShadow = true;
        foundationMesh.receiveShadow = true;
        foundationMesh.position.y = -1.85;
        layerGroup.add(foundationMesh);
        break;

      case 'frame':
        geometry = new THREE.BoxGeometry(2.8, 2.5, 2.8);
        const frameMesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: config.color, wireframe: true }));
        frameMesh.castShadow = true;
        frameMesh.position.y = 0;
        layerGroup.add(frameMesh);
        break;

      case 'shell':
        geometry = new THREE.BoxGeometry(2.8, 2.5, 2.8);
        const shellMesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: config.color }));
        shellMesh.castShadow = true;
        shellMesh.receiveShadow = true;
        shellMesh.position.y = 0;
        layerGroup.add(shellMesh);
        break;

      case 'finishes':
        const finishesMesh = createDetailedBox(2.7, 2.4, 2.7, config.color);
        layerGroup.add(finishesMesh);
        break;

      case 'interior':
        const interiorMesh = createDetailedBox(2.65, 2.35, 2.65, config.color);
        const furnitureMesh = createFurniture();
        layerGroup.add(interiorMesh);
        layerGroup.add(furnitureMesh);
        break;

      default:
        geometry = new THREE.BoxGeometry(2.8, 0.5, 2.8);
        const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: config.color }));
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        layerGroup.add(mesh);
    }

    layerGroup.userData.name = config.name;
    layerGroup.visible = false;
    buildingGroup.add(layerGroup);
    layers.push(layerGroup);
  });

  scene.add(buildingGroup);
}

function createDetailedBox(w, h, d, color) {
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(w, h, d);
  const material = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return group;
}

function createFurniture() {
  const group = new THREE.Group();

  // Simple furniture: a small box representing furniture
  const furGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.5);
  const furMaterial = new THREE.MeshLambertMaterial({ color: 0x8b6914 });
  const furniture = new THREE.Mesh(furGeometry, furMaterial);
  furniture.position.set(-0.6, -0.5, 0);
  furniture.castShadow = true;
  group.add(furniture);

  return group;
}

function updateLayerVisibility() {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;

  const targetLayer = Math.min(6, Math.floor(scrollProgress * 7));

  if (targetLayer !== currentLayer) {
    layers.forEach(layer => layer.visible = false);
    if (layers[targetLayer]) {
      layers[targetLayer].visible = true;
      currentLayer = targetLayer;
    }
  }

  // Subtle rotation
  layers.forEach(layer => {
    if (layer.visible) {
      layer.rotation.y += 0.001;
    }
  });
}

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// Start
document.addEventListener('DOMContentLoaded', () => {
  const hasWebGL = (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  })();

  if (!hasWebGL || !window.THREE) {
    document.body.classList.add('no-webgl');
    return;
  }

  if (!initThreeJs()) {
    document.body.classList.add('no-webgl');
  }
});
