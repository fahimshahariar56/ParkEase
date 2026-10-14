import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { gsap } from '../../lib/gsap';
import { ParkingScenePoster } from './ParkingScenePoster';

const makeMaterial = (color, options = {}) => new THREE.MeshStandardMaterial({ color, ...options });

const addBox = (parent, size, position, material) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
};

const addCylinder = (parent, radius, length, position, material, radialSegments = 24) => {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, length, radialSegments),
    material,
  );
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
};

const disposeScene = (scene) => {
  const geometries = new Set();
  const sharedMaterials = new Set();
  scene.traverse((object) => {
    if (!object.isMesh) return;
    geometries.add(object.geometry);
    const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
    objectMaterials.forEach((material) => sharedMaterials.add(material));
  });
  geometries.forEach((geometry) => geometry.dispose());
  sharedMaterials.forEach((material) => material.dispose());
};

export default function ParkingScene() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const posterRef = useRef(null);
  const fallbackLabelRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;

    canvas.classList.replace('opacity-100', 'opacity-0');
    posterRef.current?.classList.remove('invisible');
    fallbackLabelRef.current?.classList.remove('hidden');
    if (fallbackLabelRef.current) fallbackLabelRef.current.textContent = 'Loading interactive scene';

    let renderer;
    let scene;
    let resizeObserver;
    let visibilityObserver;
    let media;
    let environment;
    let environmentMap;
    let environmentGenerator;
    let controls;
    let renderFrame = 0;
    let lastFrame = 0;
    let visible = !('IntersectionObserver' in window);
    let hovered = false;
    let handleVisibilityChange;
    let handleMotionChange;
    let handleHover;
    let handleKeyDown;
    let stopRenderLoop = () => {
      if (renderFrame) window.cancelAnimationFrame(renderFrame);
      renderFrame = 0;
    };
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cleanup = () => {
      stopRenderLoop();
      media?.revert();
      controls?.dispose();
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      if (handleVisibilityChange) document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (handleMotionChange) reducedMotion.removeEventListener('change', handleMotionChange);
      if (handleHover) {
        root.removeEventListener('pointerenter', handleHover);
        root.removeEventListener('pointerleave', handleHover);
      }
      if (handleKeyDown) root.removeEventListener('keydown', handleKeyDown);
      environmentMap?.dispose();
      environment?.dispose();
      environmentGenerator?.dispose();
      if (scene) disposeScene(scene);
      renderer?.dispose();
    };

    try {
      const smallViewport = window.matchMedia('(max-width: 767px)').matches;
      const context = canvas.getContext('webgl2', {
        alpha: true,
        antialias: !smallViewport,
        powerPreference: 'low-power',
      });
      if (!context || !context.getContextAttributes()) {
        throw new Error('WebGL 2 context is unavailable or already lost.');
      }

      renderer = new THREE.WebGLRenderer({
        canvas,
        context,
        alpha: true,
        antialias: !smallViewport,
        powerPreference: 'low-power',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, smallViewport ? 1 : 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.98;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.setClearColor(0x000000, 0);

      scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
      camera.position.set(5.7, 4.2, 7.2);

      environment = new RoomEnvironment();
      environmentGenerator = new THREE.PMREMGenerator(renderer);
      environmentMap = environmentGenerator.fromScene(environment, 0.04);
      scene.environment = environmentMap.texture;

      scene.add(new THREE.HemisphereLight(0xe7edf5, 0x22252a, 1.15));
      const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
      keyLight.position.set(-3.5, 8, 5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.left = -5;
      keyLight.shadow.camera.right = 5;
      keyLight.shadow.camera.top = 5;
      keyLight.shadow.camera.bottom = -5;
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.radius = 4;
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0xcbd6e4, 0.75);
      fillLight.position.set(5, 3, -4);
      scene.add(fillLight);

      const ground = makeMaterial('#202227', { roughness: 0.82, metalness: 0.08 });
      const bayPaint = new THREE.MeshBasicMaterial({ color: '#f5f5f5', transparent: true, opacity: 0.74 });
      const bodyPaint = new THREE.MeshPhysicalMaterial({
        color: '#d9dce0',
        metalness: 0.04,
        roughness: 0.31,
        clearcoat: 0.82,
        clearcoatRoughness: 0.24,
        envMapIntensity: 1.05,
      });
      const glass = makeMaterial('#333943', {
        metalness: 0.22,
        roughness: 0.2,
        envMapIntensity: 1.1,
      });
      const tire = makeMaterial('#101114', { roughness: 0.94 });
      const alloy = makeMaterial('#b9bdc2', { metalness: 0.82, roughness: 0.24 });
      const chrome = makeMaterial('#aeb4bc', { metalness: 0.9, roughness: 0.2 });
      const grilleMaterial = makeMaterial('#16181c', { metalness: 0.3, roughness: 0.44 });
      const lamps = makeMaterial('#eef2f5', {
        emissive: '#858b92',
        emissiveIntensity: 0.16,
        roughness: 0.2,
      });
      const rearLamps = makeMaterial('#542d31', { emissive: '#471317', emissiveIntensity: 0.12 });

      const floor = addBox(scene, [8.2, 0.16, 5.2], [0, -0.82, 0], ground);
      floor.receiveShadow = true;

      const lineGroup = new THREE.Group();
      const lineY = -0.73;
      [-2.45, 2.45].forEach((x) => addBox(lineGroup, [0.035, 0.012, 2.8], [x, lineY, 0], bayPaint));
      [-1.4, 1.4].forEach((z) => addBox(lineGroup, [4.9, 0.012, 0.035], [0, lineY, z], bayPaint));
      addBox(lineGroup, [0.035, 0.012, 2.8], [3.6, lineY, 0], bayPaint);
      scene.add(lineGroup);

      const carRig = new THREE.Group();
      carRig.position.set(2.7, 0, 0.45);
      scene.add(carRig);

      const car = new THREE.Group();
      const body = new THREE.Mesh(new RoundedBoxGeometry(3.15, 0.62, 1.48, 4, 0.12), bodyPaint);
      body.position.set(0, -0.1, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      car.add(body);
      const cabinProfile = new THREE.Shape();
      cabinProfile.moveTo(-1.08, 0.02);
      cabinProfile.lineTo(0.88, 0.02);
      cabinProfile.quadraticCurveTo(0.64, 0.32, 0.46, 0.52);
      cabinProfile.quadraticCurveTo(0.36, 0.66, 0.14, 0.67);
      cabinProfile.lineTo(-0.48, 0.67);
      cabinProfile.quadraticCurveTo(-0.7, 0.67, -0.82, 0.46);
      cabinProfile.lineTo(-1.08, 0.02);
      cabinProfile.closePath();
      const cabinGeometry = new THREE.ExtrudeGeometry(cabinProfile, {
        depth: 1.12,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 0.025,
        bevelThickness: 0.03,
      });
      cabinGeometry.translate(0, 0.2, -0.56);
      const cabin = new THREE.Mesh(cabinGeometry, bodyPaint);
      cabin.castShadow = true;
      cabin.receiveShadow = true;
      car.add(cabin);
      [-0.57, 0.57].forEach((z) => {
        addBox(car, [1.08, 0.22, 0.025], [-0.1, 0.58, z], glass).castShadow = true;
      });
      const windshield = addBox(car, [0.06, 0.3, 0.92], [0.65, 0.47, 0], glass);
      windshield.rotation.z = 0.48;
      const rearWindow = addBox(car, [0.06, 0.28, 0.88], [-0.94, 0.43, 0], glass);
      rearWindow.rotation.z = -0.42;

      addBox(car, [0.045, 0.34, 0.5], [1.59, -0.08, 0], grilleMaterial);
      for (let index = 0; index < 7; index += 1) {
        addBox(car, [0.06, 0.3, 0.018], [1.625, -0.08, -0.21 + index * 0.07], chrome);
      }
      addBox(car, [0.055, 0.025, 0.55], [1.62, -0.29, 0], chrome);
      [-0.52, 0.52].forEach((z) => {
        const headlamp = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.12, 0.34), lamps);
        headlamp.position.set(1.59, 0.08, z);
        car.add(headlamp);
        const rearLamp = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.13, 0.29), rearLamps);
        rearLamp.position.set(-1.59, 0.07, z);
        car.add(rearLamp);
      });
      [-1, 1].forEach((side) => {
        addBox(car, [0.58, 0.035, 0.018], [-0.26, 0.02, side * 0.746], chrome);
        addBox(car, [0.035, 0.35, 0.012], [0.48, 0.04, side * 0.746], grilleMaterial);
        addBox(car, [0.035, 0.34, 0.012], [-0.83, 0.04, side * 0.746], grilleMaterial);
        addBox(car, [0.23, 0.035, 0.035], [0.18, 0.16, side * 0.77], chrome);
        addBox(car, [0.2, 0.035, 0.035], [-0.64, 0.16, side * 0.77], chrome);
        const mirrorStem = addBox(car, [0.12, 0.035, 0.035], [0.88, 0.32, side * 0.79], chrome);
        mirrorStem.rotation.y = side * -0.18;
        const mirror = new THREE.Mesh(
          new THREE.SphereGeometry(0.115, 16, 12),
          bodyPaint,
        );
        mirror.position.set(0.97, 0.37, side * 0.86);
        mirror.scale.set(0.78, 0.62, 1);
        car.add(mirror);
      });

      const wheelXs = [-1.0, 1.0];
      const wheelZs = [-0.76, 0.76];
      wheelXs.forEach((x) => {
        wheelZs.forEach((z) => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.24, 32), tire);
          wheel.rotation.x = Math.PI / 2;
          wheel.position.set(x, -0.44, z);
          wheel.castShadow = true;
          wheel.receiveShadow = true;
          car.add(wheel);
          [-1, 1].forEach((side) => {
            addCylinder(car, 0.235, 0.035, [x, -0.44, z + side * 0.105], alloy, 32);
            addCylinder(car, 0.075, 0.045, [x, -0.44, z + side * 0.125], chrome, 24);
          });
        });
      });

      const spokeGeometry = new THREE.BoxGeometry(0.035, 0.2, 0.025);
      const spokes = new THREE.InstancedMesh(spokeGeometry, chrome, 40);
      const spoke = new THREE.Object3D();
      let spokeIndex = 0;
      wheelXs.forEach((x) => {
        wheelZs.forEach((z) => {
          [-1, 1].forEach((side) => {
            for (let index = 0; index < 5; index += 1) {
              const angle = (index / 5) * Math.PI * 2;
              spoke.position.set(
                x + Math.sin(angle) * 0.12,
                -0.44 + Math.cos(angle) * 0.12,
                z + side * 0.13,
              );
              spoke.rotation.set(0, 0, angle);
              spoke.updateMatrix();
              spokes.setMatrixAt(spokeIndex, spoke.matrix);
              spokeIndex += 1;
            }
          });
        });
      });
      spokes.instanceMatrix.needsUpdate = true;
      car.add(spokes);

      const archGeometry = new THREE.TorusGeometry(0.36, 0.025, 8, 32, Math.PI);
      wheelXs.forEach((x) => {
        wheelZs.forEach((z) => {
          const arch = new THREE.Mesh(archGeometry, bodyPaint);
          arch.position.set(x, -0.42, z + Math.sign(z) * 0.02);
          arch.castShadow = true;
          car.add(arch);
        });
      });

      carRig.add(car);

      const boostGroup = new THREE.Group();
      const boostMaterial = new THREE.MeshBasicMaterial({
        color: '#aab8c8',
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const boostGeometry = new THREE.RingGeometry(0.34, 0.48, 40);
      const boostRings = [];
      wheelXs.forEach((x) => {
        wheelZs.forEach((z) => {
          const ring = new THREE.Mesh(boostGeometry, boostMaterial);
          ring.rotation.x = -Math.PI / 2;
          ring.position.set(x, -0.724, z);
          boostGroup.add(ring);
          boostRings.push(ring);
        });
      });
      carRig.add(boostGroup);

      controls = new OrbitControls(camera, canvas);
      controls.target.set(0, -0.15, 0);
      controls.enableDamping = !reducedMotion.matches;
      controls.dampingFactor = 0.075;
      controls.enablePan = false;
      controls.minDistance = 5.2;
      controls.maxDistance = 10.5;
      controls.minPolarAngle = 0.62;
      controls.maxPolarAngle = 1.43;
      controls.rotateSpeed = 0.72;
      controls.update();
      camera.lookAt(controls.target);
      canvas.style.touchAction = 'pan-y';

      const render = () => renderer.render(scene, camera);

      const startRenderLoop = () => {
        if (renderFrame || !visible || document.hidden || reducedMotion.matches) return;
        const animate = (time) => {
          renderFrame = 0;
          if (!visible || document.hidden || reducedMotion.matches) return;
          if (time - lastFrame >= 1000 / 30) {
            lastFrame = time;
            controls.update();
            const pulse = (Math.sin(time * 0.0014) + 1) * 0.5;
            boostRings.forEach((ring) => ring.scale.setScalar(1 + pulse * 0.055));
            boostMaterial.opacity = (hovered ? 0.22 : 0.1) + pulse * 0.08;
            render();
          }
          renderFrame = window.requestAnimationFrame(animate);
        };
        renderFrame = window.requestAnimationFrame(animate);
      };

      stopRenderLoop = () => {
        if (renderFrame) window.cancelAnimationFrame(renderFrame);
        renderFrame = 0;
      };
      handleVisibilityChange = () => {
        if (document.hidden) stopRenderLoop();
        else startRenderLoop();
      };
      handleMotionChange = () => {
        controls.enableDamping = !reducedMotion.matches;
        if (reducedMotion.matches) {
          boostRings.forEach((ring) => ring.scale.setScalar(1));
          boostMaterial.opacity = hovered ? 0.22 : 0.1;
          stopRenderLoop();
          render();
        } else {
          startRenderLoop();
        }
      };
      handleHover = (event) => {
        hovered = event.type === 'pointerenter';
        boostMaterial.opacity = hovered ? 0.25 : 0.1;
        render();
      };
      const handleControlStart = () => {
        canvas.classList.add('cursor-grabbing');
        if (controls.target.x !== carRig.position.x) {
          const shift = carRig.position.x - controls.target.x;
          controls.target.x += shift;
          camera.position.x += shift;
          controls.update();
        }
        boostMaterial.opacity = 0.3;
        render();
      };
      const handleControlEnd = () => {
        canvas.classList.remove('cursor-grabbing');
        boostMaterial.opacity = hovered ? 0.25 : 0.1;
        render();
      };
      handleKeyDown = (event) => {
        const rotationStep = 0.16;
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();
        const spherical = new THREE.Spherical().setFromVector3(
          camera.position.clone().sub(controls.target),
        );
        if (event.key === 'ArrowLeft') spherical.theta -= rotationStep;
        if (event.key === 'ArrowRight') spherical.theta += rotationStep;
        if (event.key === 'ArrowUp') spherical.phi = Math.max(controls.minPolarAngle, spherical.phi - rotationStep);
        if (event.key === 'ArrowDown') spherical.phi = Math.min(controls.maxPolarAngle, spherical.phi + rotationStep);
        camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
        controls.update();
        render();
      };

      controls.addEventListener('change', render);
      controls.addEventListener('start', handleControlStart);
      controls.addEventListener('end', handleControlEnd);
      root.addEventListener('pointerenter', handleHover);
      root.addEventListener('pointerleave', handleHover);
      root.addEventListener('keydown', handleKeyDown);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      reducedMotion.addEventListener('change', handleMotionChange);

      const resize = () => {
        const { width, height } = root.getBoundingClientRect();
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        render();
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(root);
      visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) startRenderLoop();
        else stopRenderLoop();
      }, { threshold: 0.01 });
      visibilityObserver.observe(root);
      if (visible) startRenderLoop();
      resize();

      media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const context = gsap.context(() => {
          const story = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.55,
              onUpdate: render,
            },
          });
          story.fromTo(
            carRig.position,
            { x: 2.7, z: 0.45 },
            { x: 0, z: 0, duration: 1, ease: 'none' },
            0,
          );
          story.fromTo(
            carRig.rotation,
            { y: -0.16 },
            { y: 0, duration: 1, ease: 'none' },
            0,
          );
        }, root);
        return () => context.revert();
      });

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          carRig.position.set(0, 0, 0);
          carRig.rotation.y = 0;
      }
      render();
      canvas.classList.replace('opacity-0', 'opacity-100');
      posterRef.current?.classList.add('invisible');
      if (fallbackLabelRef.current) {
        fallbackLabelRef.current.textContent = 'Drag to inspect · arrow keys supported';
        fallbackLabelRef.current.classList.remove('hidden');
      }
    } catch (error) {
      cleanup();
      if (fallbackLabelRef.current) fallbackLabelRef.current.textContent = 'Static illustration';
      console.warn('ParkEase 3D scene unavailable; keeping the static parking illustration.', error);
    }

    return cleanup;
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative h-[220px] w-full cursor-grab overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text sm:h-[260px] lg:h-[300px]"
      role="group"
      tabIndex={0}
      aria-label="Interactive illustrative parking scene. Drag to orbit the car, or use the arrow keys to inspect it. This is not live availability."
    >
      <div ref={posterRef} className="absolute inset-0">
        <ParkingScenePoster className="h-full" />
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full cursor-grab opacity-0 transition-opacity duration-200"
      />
      <span
        ref={fallbackLabelRef}
        className="absolute bottom-3 right-3 rounded-sm border border-white/15 bg-black/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white/80"
      >
        Loading interactive scene
      </span>
    </div>
  );
}
