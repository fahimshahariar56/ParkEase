import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from '../../lib/gsap';
import { ParkingScenePoster } from './ParkingScenePoster';

const makeMaterial = (color, options = {}) => new THREE.MeshStandardMaterial({
  color,
  roughness: 0.72,
  metalness: 0.08,
  ...options,
});

const addBox = (parent, size, position, material) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
};

const disposeScene = (scene) => {
  scene.traverse((object) => {
    if (!object.isMesh) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material.dispose());
  });
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

    let renderer;
    let scene;
    let resizeObserver;
    let media;

    try {
      const smallViewport = window.matchMedia('(max-width: 639px)').matches;
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
      renderer.setClearColor(0x000000, 0);

      scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
      camera.position.set(6.2, 5.7, 8.2);
      camera.lookAt(0, -0.15, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 2.2));
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
      keyLight.position.set(-3, 8, 5);
      scene.add(keyLight);

      const ground = makeMaterial('#202227');
      const bayPaint = new THREE.MeshBasicMaterial({ color: '#f5f5f5', transparent: true, opacity: 0.74 });
      const bodyPaint = makeMaterial('#e7e8ea', { metalness: 0.22, roughness: 0.42 });
      const glass = makeMaterial('#555a63', { metalness: 0.18, roughness: 0.34 });
      const tire = makeMaterial('#101114', { roughness: 0.94 });
      const wheelCenter = makeMaterial('#a1a1aa', { metalness: 0.28, roughness: 0.48 });
      const lamps = makeMaterial('#fafafa', { emissive: '#777777', emissiveIntensity: 0.15 });

      addBox(scene, [8.2, 0.16, 5.2], [0, -0.82, 0], ground);

      const lineGroup = new THREE.Group();
      const lineY = -0.73;
      [-2.45, 2.45].forEach((x) => addBox(lineGroup, [0.035, 0.012, 2.8], [x, lineY, 0], bayPaint));
      [-1.4, 1.4].forEach((z) => addBox(lineGroup, [4.9, 0.012, 0.035], [0, lineY, z], bayPaint));
      addBox(lineGroup, [0.035, 0.012, 2.8], [3.6, lineY, 0], bayPaint);
      scene.add(lineGroup);

      const car = new THREE.Group();
      addBox(car, [3.15, 0.62, 1.48], [0, -0.1, 0], bodyPaint);
      const cabinProfile = new THREE.Shape();
      cabinProfile.moveTo(-1.0, 0.02);
      cabinProfile.lineTo(0.82, 0.02);
      cabinProfile.lineTo(0.48, 0.43);
      cabinProfile.lineTo(0.25, 0.72);
      cabinProfile.lineTo(-0.58, 0.72);
      cabinProfile.lineTo(-0.98, 0.18);
      cabinProfile.closePath();
      const cabinGeometry = new THREE.ExtrudeGeometry(cabinProfile, {
        depth: 1.12,
        bevelEnabled: false,
      });
      cabinGeometry.translate(0, 0.2, -0.56);
      car.add(new THREE.Mesh(cabinGeometry, bodyPaint));
      [-0.57, 0.57].forEach((z) => {
        addBox(car, [1.08, 0.22, 0.025], [-0.1, 0.58, z], glass);
      });
      addBox(car, [0.06, 0.3, 0.92], [0.51, 0.48, 0], glass);
      addBox(car, [0.06, 0.28, 0.88], [-0.82, 0.43, 0], glass);
      [-0.52, 0.52].forEach((z) => {
        addBox(car, [0.12, 0.14, 0.035], [1.58, 0.04, z], lamps);
        addBox(car, [0.1, 0.12, 0.035], [-1.58, 0.04, z], glass);
      });

      [-1.0, 1.0].forEach((x) => {
        [-0.76, 0.76].forEach((z) => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.24, 10), tire);
          wheel.rotation.x = Math.PI / 2;
          wheel.position.set(x, -0.42, z);
          car.add(wheel);
          const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.25, 8), wheelCenter);
          hub.rotation.x = Math.PI / 2;
          hub.position.copy(wheel.position);
          car.add(hub);
        });
      });

      car.position.set(2.7, 0, 0.45);
      car.rotation.y = -0.16;
      scene.add(car);

      const render = () => renderer.render(scene, camera);
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
            car.position,
            { x: 2.7, z: 0.45 },
            { x: 0, z: 0, duration: 1, ease: 'none' },
            0,
          );
          story.fromTo(
            car.rotation,
            { y: -0.16 },
            { y: 0, duration: 1, ease: 'none' },
            0,
          );
        }, root);
        return () => context.revert();
      });

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        car.position.set(0, 0, 0);
        car.rotation.y = 0;
      }
      render();
      canvas.classList.replace('opacity-0', 'opacity-100');
      posterRef.current?.classList.add('invisible');
      fallbackLabelRef.current?.classList.add('hidden');
    } catch (error) {
      console.warn('ParkEase 3D scene unavailable; keeping the static parking illustration.', error);
    }

    return () => {
      media?.revert();
      resizeObserver?.disconnect();
      if (scene) disposeScene(scene);
      renderer?.dispose();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative h-[220px] w-full overflow-hidden sm:h-[260px]"
      aria-hidden="true"
    >
      <div ref={posterRef} className="absolute inset-0">
        <ParkingScenePoster className="h-full" />
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-200"
      />
      <span
        ref={fallbackLabelRef}
        className="absolute bottom-3 right-3 rounded-sm border border-white/15 bg-black/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white/80"
      >
        Static illustration
      </span>
    </div>
  );
}
