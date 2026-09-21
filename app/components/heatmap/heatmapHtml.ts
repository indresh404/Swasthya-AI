export const HEATMAP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; user-select: none; -webkit-tap-highlight-color: transparent; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #020617; }
  canvas { display: block; width: 100% !important; height: 100% !important; touch-action: none; outline: none; }
  #loading {
    position: fixed; inset: 0; background: #020617;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    z-index: 100; transition: opacity 0.5s ease;
    backdrop-filter: blur(8px);
  }
  #loading.hidden { opacity: 0; pointer-events: none; }
  .pulse-ring {
    width: 60px; height: 60px; border-radius: 50%;
    border: 2px solid #10b981; border-top-color: transparent;
    animation: spin 1s linear infinite;
    box-shadow: 0 0 20px rgba(16,185,129,0.2);
  }
  .loading-text {
    margin-top: 16px; color: #10b981; font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px; letter-spacing: 1.5px; font-weight: 500;
    background: rgba(16,185,129,0.1); padding: 6px 16px; border-radius: 40px;
  }
  .error-text {
    max-width: 240px; margin-top: 12px; color: #f87171;
    font-family: sans-serif; font-size: 12px; line-height: 1.5; text-align: center;
  }
  .info-tip {
    position: fixed; bottom: 20px; left: 0; right: 0; text-align: center;
    color: rgba(255,255,240,0.6); font-family: system-ui; font-size: 12px;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(12px);
    width: fit-content; margin: 0 auto; padding: 6px 18px;
    border-radius: 40px; pointer-events: none; z-index: 20;
    font-weight: 500; letter-spacing: 0.4px; border: 0.5px solid rgba(16,185,129,0.3);
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>
<div id="loading">
  <div class="pulse-ring"></div>
  <div class="loading-text" id="loadingText">⚡ THERMAL SCANNER</div>
</div>
<div class="info-tip">DRAG LEFT OR RIGHT • PINCH TO ZOOM</div>
<canvas id="c"></canvas>

<script>
// --------------------------------------------------------------
// React Native Bridge
// --------------------------------------------------------------
function postToRN(data) {
  try {
    if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
    }
  } catch(e) {}
}

function setLoadingText(message, isError) {
  var label = document.getElementById('loadingText');
  if (label && message) {
    label.textContent = message;
    if (isError) label.style.color = '#f97316';
    else label.style.color = '#10b981';
  }
}

function reportModelError(message) {
  setLoadingText(message || '3D view unavailable', true);
  postToRN({ type: 'MODEL_ERROR', message: message || '3D viewer failed to initialize.' });
}

window.addEventListener('error', function(event) {
  reportModelError(event && event.message ? event.message : 'Unexpected WebView error.');
});

// --------------------------------------------------------------
// Wait for THREE and GLTFLoader
// --------------------------------------------------------------
var threeReady = false;
var gltfReady = false;
var hasModelLoaded = false;
var loadTimeoutId = setTimeout(function() {
  if (!hasModelLoaded) {
    reportModelError('3D model loading timed out.');
  }
}, 15000);

function maybeStartApp() {
  if (!threeReady || !gltfReady) return;
  if (!window.THREE || !window.THREE.GLTFLoader) {
    reportModelError('Required 3D libraries did not load correctly.');
    return;
  }
  startApp(window.THREE);
}

function loadRemoteScripts() {
  var threeScript = document.createElement('script');
  threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  threeScript.onload = function() {
    threeReady = true;
    var loaderScript = document.createElement('script');
    loaderScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
    loaderScript.onload = function() {
      gltfReady = true;
      maybeStartApp();
    };
    loaderScript.onerror = function() {
      reportModelError('GLTF loader could not be downloaded.');
    };
    document.head.appendChild(loaderScript);
  };
  threeScript.onerror = function() {
    reportModelError('Three.js could not be downloaded.');
  };
  document.head.appendChild(threeScript);
}

function decodeBase64ToArrayBuffer(base64) {
  var binaryString = atob(base64);
  var length = binaryString.length;
  var bytes = new Uint8Array(length);
  for (var i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// --------------------------------------------------------------
// Main Application with Improved Controls (OrbitControls style)
// --------------------------------------------------------------
function startApp(THREE) {
  const canvas = document.getElementById('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#020617');

  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.05, 50);
  camera.position.set(0, 1.0, 4.8);

  // Lighting - Enhanced for better visual quality
  const ambientLight = new THREE.AmbientLight(0x404060, 0.45);
  scene.add(ambientLight);
  
  const hemiLight = new THREE.HemisphereLight(0x8ba0ff, 0x2a2a3a, 0.6);
  scene.add(hemiLight);
  
  const mainLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
  mainLight.position.set(5, 8, 4);
  scene.add(mainLight);
  
  const fillLight = new THREE.DirectionalLight(0xccddff, 0.7);
  fillLight.position.set(-4, 3, -3);
  scene.add(fillLight);
  
  const backLight = new THREE.DirectionalLight(0xffaa88, 0.5);
  backLight.position.set(0, 2, -4);
  scene.add(backLight);
  
  const rimLight = new THREE.PointLight(0x9fffe0, 0.6);
  rimLight.position.set(1, 1.8, 2.5);
  scene.add(rimLight);

  // Heat zones configuration
  const HEAT_ZONES = [
    { id: 'head',           position: [0,    1.65,  0.05], color: '#ef4444', intensity: 0.85 },
    { id: 'neck',           position: [0,    1.45,  0.05], color: '#f97316', intensity: 0.60 },
    { id: 'left_shoulder',  position: [-0.22,1.3,   0.0 ], color: '#f97316', intensity: 0.55 },
    { id: 'right_shoulder', position: [0.22, 1.3,   0.0 ], color: '#f59e0b', intensity: 0.40 },
    { id: 'chest',          position: [0,    1.15,  0.1 ], color: '#ef4444', intensity: 0.75 },
    { id: 'upper_back',     position: [0,    1.2,  -0.12], color: '#f97316', intensity: 0.65 },
    { id: 'abdomen',        position: [0,    0.95,  0.1 ], color: '#f59e0b', intensity: 0.45 },
    { id: 'lower_back',     position: [0,    0.9,  -0.12], color: '#ef4444', intensity: 0.80 },
    { id: 'left_knee',      position: [-0.1, 0.45,  0.05], color: '#f97316', intensity: 0.50 },
    { id: 'right_knee',     position: [0.1,  0.45,  0.05], color: '#f59e0b', intensity: 0.35 },
  ];

  let modelGroup = null;
  const orbitTarget = new THREE.Vector3(0, 0.95, 0);
  
  let isDragging = false;
  let lastX = 0;
  let sphericalTheta = 0.3;
  const sphericalPhi = Math.PI / 2;
  let sphericalRadius = 4.8;
  const MIN_RADIUS = 2.2;
  const MAX_RADIUS = 7.5;
  const AUTO_ROTATE_SPEED = 0.0025;
  let autoRotate = true;

  function updateCamera() {
    const x = orbitTarget.x + sphericalRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
    const y = orbitTarget.y + sphericalRadius * Math.cos(sphericalPhi);
    const z = orbitTarget.z + sphericalRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
    camera.position.set(x, y, z);
    camera.lookAt(orbitTarget);
  }

  canvas.addEventListener('pointerdown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    autoRotate = false;
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    sphericalTheta -= dx * 0.007;
    lastX = e.clientX;
    updateCamera();
  });

  canvas.addEventListener('pointerup', () => { isDragging = false; });
  canvas.addEventListener('pointercancel', () => { isDragging = false; });

  // Pinch zoom
  let lastPinchDist = 0;
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist = Math.hypot(dx, dy);
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      sphericalRadius = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, sphericalRadius - (dist - lastPinchDist) * 0.015));
      lastPinchDist = dist;
      updateCamera();
    }
  }, { passive: true });

  window.syncSelectedZone = function(zoneId) {
    return zoneId;
  };

  window.highlightPosition = function(position) {
    return position;
  };

  window.clearSelection = function() {
    autoRotate = true;
  };

  function applyMaterial(obj) {
    obj.traverse(child => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#d9dee7'),
          roughness: 0.78,
          metalness: 0.06,
          side: THREE.DoubleSide,
          skinning: !!child.isSkinnedMesh,
          morphTargets: !!child.morphTargetInfluences,
          morphNormals: !!child.morphTargetInfluences,
        });
        child.frustumCulled = false;
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
  }

  function centerModel(group) {
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    group.position.sub(center);
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const targetHeight = 2.5;
    const uniformScale = targetHeight / maxDim;
    group.scale.setScalar(uniformScale);
    group.updateMatrixWorld(true);

    const scaledBox = new THREE.Box3().setFromObject(group);
    const scaledSize = scaledBox.getSize(new THREE.Vector3());
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
    const scaledSphere = scaledBox.getBoundingSphere(new THREE.Sphere());

    group.position.sub(scaledCenter);
    group.position.y += scaledSize.y / 2;
    orbitTarget.set(0, scaledSize.y * 0.52, 0);
    sphericalRadius = Math.max(
      MIN_RADIUS + 0.3,
      Math.min(MAX_RADIUS, scaledSphere.radius * 2.3)
    );
    updateCamera();
  }

  function hideLoader() {
    hasModelLoaded = true;
    clearTimeout(loadTimeoutId);
    setTimeout(() => {
      const el = document.getElementById('loading');
      if (el) el.classList.add('hidden');
      setTimeout(() => { if (el) el.remove(); }, 600);
    }, 300);
  }

  function buildFallbackModel() {
    const fallbackGroup = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#d9dee7'),
      roughness: 0.72,
      metalness: 0.08,
      side: THREE.DoubleSide
    });
    
    // Head
    const headGeo = new THREE.SphereGeometry(0.18, 24, 24);
    const head = new THREE.Mesh(headGeo, mat);
    head.position.set(0, 1.62, 0);
    fallbackGroup.add(head);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.12, 16);
    const neck = new THREE.Mesh(neckGeo, mat);
    neck.position.set(0, 1.45, 0);
    fallbackGroup.add(neck);

    // Chest / Upper Torso
    const chestGeo = new THREE.BoxGeometry(0.48, 0.36, 0.24);
    const chest = new THREE.Mesh(chestGeo, mat);
    chest.position.set(0, 1.22, 0);
    fallbackGroup.add(chest);

    // Abdomen / Mid Torso
    const abdomenGeo = new THREE.BoxGeometry(0.42, 0.28, 0.22);
    const abdomen = new THREE.Mesh(abdomenGeo, mat);
    abdomen.position.set(0, 0.92, 0);
    fallbackGroup.add(abdomen);

    // Pelvis
    const pelvisGeo = new THREE.BoxGeometry(0.44, 0.2, 0.22);
    const pelvis = new THREE.Mesh(pelvisGeo, mat);
    pelvis.position.set(0, 0.7, 0);
    fallbackGroup.add(pelvis);

    // Left and Right Arms
    [-0.32, 0.32].forEach((xSide) => {
      const shGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const sh = new THREE.Mesh(shGeo, mat);
      sh.position.set(xSide, 1.34, 0);
      fallbackGroup.add(sh);

      const uArmGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.34, 16);
      const uArm = new THREE.Mesh(uArmGeo, mat);
      uArm.position.set(xSide, 1.12, 0);
      fallbackGroup.add(uArm);

      const elbowGeo = new THREE.SphereGeometry(0.055, 12, 12);
      const elbow = new THREE.Mesh(elbowGeo, mat);
      elbow.position.set(xSide, 0.94, 0);
      fallbackGroup.add(elbow);

      const fArmGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.32, 16);
      const fArm = new THREE.Mesh(fArmGeo, mat);
      fArm.position.set(xSide, 0.77, 0);
      fallbackGroup.add(fArm);

      const handGeo = new THREE.BoxGeometry(0.06, 0.1, 0.04);
      const hand = new THREE.Mesh(handGeo, mat);
      hand.position.set(xSide, 0.57, 0);
      fallbackGroup.add(hand);
    });

    // Left and Right Legs
    [-0.14, 0.14].forEach((xSide) => {
      const thighGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.44, 16);
      const thigh = new THREE.Mesh(thighGeo, mat);
      thigh.position.set(xSide, 0.42, 0);
      fallbackGroup.add(thigh);

      const kneeGeo = new THREE.SphereGeometry(0.07, 16, 16);
      const knee = new THREE.Mesh(kneeGeo, mat);
      knee.position.set(xSide, 0.18, 0);
      fallbackGroup.add(knee);

      const shinGeo = new THREE.CylinderGeometry(0.07, 0.05, 0.42, 16);
      const shin = new THREE.Mesh(shinGeo, mat);
      shin.position.set(xSide, -0.06, 0);
      fallbackGroup.add(shin);

      const footGeo = new THREE.BoxGeometry(0.09, 0.06, 0.18);
      const foot = new THREE.Mesh(footGeo, mat);
      foot.position.set(xSide, -0.28, 0.04);
      fallbackGroup.add(foot);
    });

    return fallbackGroup;
  }

  function loadProceduralFallback() {
    try {
      modelGroup = buildFallbackModel();
      centerModel(modelGroup);
      scene.add(modelGroup);
      hideLoader();
      postToRN({ type: 'MODEL_LOADED' });
    } catch(err) {
      reportModelError('Failed to initialize 3D model geometry.');
    }
  }

  function initModel() {
    const loader = new THREE.GLTFLoader();
    const modelBase64 = window.__MODEL_BASE64__ || null;
    
    if (modelBase64 && typeof modelBase64 === 'string' && modelBase64.length > 100) {
      setLoadingText('DECODING MODEL...', false);
      try {
        const arrayBuffer = decodeBase64ToArrayBuffer(modelBase64);
        loader.parse(arrayBuffer, '', (gltf) => {
          modelGroup = gltf.scene;
          modelGroup.scale.setScalar(1);
          applyMaterial(modelGroup);
          centerModel(modelGroup);
          scene.add(modelGroup);
          hideLoader();
          postToRN({ type: 'MODEL_LOADED' });
        }, (error) => {
          console.warn('GLB parse notice, activating procedural 3D model:', error);
          loadProceduralFallback();
        });
        return;
      } catch(e) {
        console.warn('GLB decode notice, activating procedural 3D model:', e);
        loadProceduralFallback();
        return;
      }
    }

    // Direct fallback activation
    loadProceduralFallback();
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);

    clock.getElapsedTime();

    if (autoRotate && !isDragging) {
      sphericalTheta += AUTO_ROTATE_SPEED;
      updateCamera();
    }
    
    renderer.render(scene, camera);
  }
  
  updateCamera();
  animate();
  initModel();
}

loadRemoteScripts();
</script>
</body>
</html>`;

export const getHeatmapHtml = (modelBase64?: string) => {
  if (modelBase64 && typeof modelBase64 === 'string' && modelBase64.length > 100) {
    const injection = `<script>window.__MODEL_BASE64__ = ${JSON.stringify(modelBase64)};</script>`;
    return HEATMAP_HTML.replace('<head>', '<head>\n' + injection);
  }
  return HEATMAP_HTML;
};

