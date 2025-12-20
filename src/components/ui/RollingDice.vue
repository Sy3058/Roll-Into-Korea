<template>
  <div ref="canvasContainer" class="canvas-container"></div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { onMounted, onUnmounted, ref } from 'vue';

// 부모에게 올려보낼 이벤트 (굴리기 완료)
const emit = defineEmits<{
  (e: 'roll-complete', result: number): void;
}>();

// Refs
const canvasContainer = ref<HTMLDivElement | null>(null);

// Cleanup 변수
let renderer: THREE.WebGLRenderer;
let requestID: number;

// Three.js & Rapier 변수
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let world: RAPIER.World;
const diceBodies: RAPIER.RigidBody[] = [];
const diceMeshes: THREE.Group[] = [];
let isRolling = false;

// constants
const DICE_COUNT = 2;
const X_OFFSET = -3.9; // board와 같은 위치일 수 있게 이동
const WALL_SIZE = 7.4; // 벽 크기

// 주사위 면과 숫자 연결
const faceNormals = [
  { face: 6, vector: new THREE.Vector3(1, 0, 0) }, // Right
  { face: 1, vector: new THREE.Vector3(-1, 0, 0) }, // Left
  { face: 3, vector: new THREE.Vector3(0, 0, -1) }, // Front
  { face: 4, vector: new THREE.Vector3(0, 0, 1) }, // Back
  { face: 5, vector: new THREE.Vector3(0, 1, 0) }, // Top
  { face: 2, vector: new THREE.Vector3(0, -1, 0) }, // Bottom
];

onMounted(async () => {
  if (!canvasContainer.value) return;

  // 물리 엔진 초기화
  await RAPIER.init();
  world = new RAPIER.World({ x: 0.0, y: -20.0, z: 0.0 }); // 중력 가속도

  // Three.js Scene 초기화
  const width = canvasContainer.value.clientWidth;
  const height = canvasContainer.value.clientHeight;

  scene = new THREE.Scene();

  // 카메라 설정
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100); // 시야범위(fov), 비율(aspect), near, far (near~far 사이 값만 렌더링)
  camera.position.set(0, 25, 0);
  camera.lookAt(0, 0, 0);

  // Renderer 설정
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // 이미지 부드럽게
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = false; // 그림자
  canvasContainer.value.appendChild(renderer.domElement);

  // 빛 설정
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 2); // 방향이 있는 빛
  dirLight.position.set(5, 10, 5);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // 물리적인 벽과 바닥 생성
  createBoundaries();

  // 주사위 모델 불러오기
  const loader = new GLTFLoader();
  loader.load('/assets/dice.glb', (gltf) => {
    // 원본 모델
    const originalMesh = gltf.scene;

    // 주사위 그림자
    originalMesh.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    // Scene에 주사위 추가
    for (let i = 0; i < DICE_COUNT; i++) {
      createDice(originalMesh, i);
    }
  });

  // 굴리는 애니메이션
  animate();

  // 화면 크기 변화 감지
  window.addEventListener('resize', onWindowResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize);
  cancelAnimationFrame(requestID);
  if (renderer) renderer.dispose();
});

/**
 * 개별 주사위 생성
 */
const createDice = (originalMesh: THREE.Group, index: number) => {
  // 메쉬 복제
  const mesh = originalMesh.clone();
  scene.add(mesh);
  diceMeshes.push(mesh);

  // 초기 위치 설정
  const spawnX = X_OFFSET + (index === 0 ? -1.5 : 1.5);

  // physical body 생성
  const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(spawnX, 5, 0).setCanSleep(false);
  const body = world.createRigidBody(bodyDesc);
  diceBodies.push(body);

  // collider 생성
  const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5)
    .setRestitution(0.6) // 튕기는 정도
    .setFriction(0.5); // 마찰력
  world.createCollider(colliderDesc, body);
};

// // 디버깅용 벽
// const createDebugMesh = (
//   x: number,
//   y: number,
//   z: number,
//   w: number,
//   h: number,
//   d: number,
//   color: number,
// ) => {
//   const geometry = new THREE.BoxGeometry(w * 2, h * 2, d * 2);
//   const material = new THREE.MeshBasicMaterial({
//     color: color,
//     transparent: true,
//     opacity: 0.3, // 반투명하게 설정
//     wireframe: false,
//   });
//   const mesh = new THREE.Mesh(geometry, material);
//   mesh.position.set(x, y, z);
//   scene.add(mesh);
// };

// 물리적으로 벽, 바닥 만들기
const createBoundaries = () => {
  // 바닥
  const floorBody = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(X_OFFSET, 0, 0),
  );
  world.createCollider(RAPIER.ColliderDesc.cuboid(15, 0.1, 15), floorBody);

  // 벽
  const createWall = (x: number, z: number, w: number, d: number) => {
    const wallBody = world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(x + X_OFFSET, 2, z),
    );
    world.createCollider(RAPIER.ColliderDesc.cuboid(w, 2, d), wallBody);

    // // 벽 보이게
    // createDebugMesh(x + X_OFFSET, 2, z, w, 2, d, 0xffff00);
  };

  // 게임 보드에 맞춰 벽 만들기
  createWall(0, -WALL_SIZE, WALL_SIZE, 0.5); // Top
  createWall(0, WALL_SIZE, WALL_SIZE, 0.5); // Bottom
  createWall(-WALL_SIZE, 0, 0.5, WALL_SIZE); // Left
  createWall(WALL_SIZE, 0, 0.5, WALL_SIZE); // Right
};

// 굴리는 애니메이션
const roll = () => {
  if (diceBodies.length < DICE_COUNT || isRolling) return;
  isRolling = true;

  diceBodies.forEach((body, index) => {
    // 위치 초기화
    const spawnX = X_OFFSET + (index === 0 ? -1.0 : 1.0);
    body.setTranslation({ x: spawnX, y: 10 + index * 0.5, z: 0 }, true);
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);

    // 랜덤으로 힘 적용
    const force = 10;
    body.applyImpulse(
      {
        x: (Math.random() - 0.5) * force,
        y: -10, // 아래로 던지기
        z: (Math.random() - 0.5) * force,
      },
      true,
    );

    // 랜덤 회전 적용
    body.applyTorqueImpulse(
      {
        x: (Math.random() - 0.5) * 5,
        y: (Math.random() - 0.5) * 5,
        z: (Math.random() - 0.5) * 5,
      },
      true,
    );
  });
};

// 애니메이션 진행
const animate = () => {
  requestID = requestAnimationFrame(animate);
  if (world) world.step();

  // 모든 주사위 위치 동기화
  for (let i = 0; i < diceBodies.length; i++) {
    const body = diceBodies[i];
    const mesh = diceMeshes[i];

    if (body && mesh) {
      const t = body.translation();
      const r = body.rotation();
      mesh.position.set(t.x, t.y, t.z);
      mesh.quaternion.set(r.x, r.y, r.z, r.w);
    }
  }

  // 돌고 있는지 확인
  if (isRolling && checkAllStopped()) {
    calculateTotalResult();
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
};

// 모든 주사위가 멈췄는지 확인
const checkAllStopped = () => {
  let stoppedCount = 0;

  diceBodies.forEach((body) => {
    const vel = body.linvel();
    const ang = body.angvel();
    const pos = body.translation();

    const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2);
    const spin = Math.sqrt(ang.x ** 2 + ang.y ** 2 + ang.z ** 2);

    // 속도가 거의 0이고 바닥 근처에 있을 때
    if (speed < 0.1 && spin < 0.1 && pos.y < 1.0) {
      stoppedCount++;
    }
  });

  return stoppedCount === DICE_COUNT;
};

const calculateTotalResult = () => {
  isRolling = false;
  let totalResult = 0;

  // 각 주사위의 윗면 확인
  diceMeshes.forEach((mesh) => {
    const quaternion = mesh.quaternion;
    const upVector = new THREE.Vector3(0, 1, 0);

    let maxDot = -Infinity;
    let faceValue = 1;

    faceNormals.forEach(({ face, vector }) => {
      const worldVec = vector.clone().applyQuaternion(quaternion);
      const dot = worldVec.dot(upVector);
      if (dot > maxDot) {
        maxDot = dot;
        faceValue = face;
      }
    });

    totalResult += faceValue;
  });

  // 합산 결과 전송
  emit('roll-complete', totalResult);
};

// 화면 크기 변경되었을 때
const onWindowResize = () => {
  if (!canvasContainer.value || !camera || !renderer) return;
  const width = canvasContainer.value.clientWidth;
  const height = canvasContainer.value.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

// 부모에서 roll 부를 수 있게
defineExpose({ roll });
</script>

<style lang="scss" scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 100;
}
</style>
