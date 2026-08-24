import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  BoxGeometry,
  ShaderMaterial,
  Color,
  Vector2,
  Vector3,
  Raycaster,
  Object3D,
  MathUtils,
  LoadingManager,
  Mesh,
  BufferGeometry,
  SphereGeometry,
  MeshBasicMaterial,
  Group,
  Box3,
} from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';

import vertexShader from '../../shaders/brain.vertex.glsl';
import fragmentShader from '../../shaders/brain.fragment.glsl';
import { InstancedUniformsMesh } from 'three-instanced-uniforms-mesh';
import brainModel from '../../static/brain.glb';

interface BrainAnimationProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const BrainAnimation: React.FC<BrainAnimationProps> = React.memo(
  ({ style, ...props }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    const threeRef = useRef({
      scene: null as Scene | null,
      camera: null as PerspectiveCamera | null,
      renderer: null as WebGLRenderer | null,
      raycaster: null as Raycaster | null,

      brainGroup: null as Group | null,
      hitMesh: null as Mesh | null,
      instancedMesh: null as InstancedUniformsMesh<any> | null,

      brainRadius: 0,
    });

    const initializedRef = useRef(false);

    const colors = useMemo(
      () => [
        new Color(0x963cbd),
        new Color(0xff6f61),
        new Color(0xc5299b),
        new Color(0xfeae51),
      ],
      [],
    );

    const uniformsRef = useRef({
      uHover: 0,
    });

    const mouseRef = useRef(new Vector2());
    const targetCameraRef = useRef(new Vector2());
    const scrollTargetRef = useRef(0);
    const scrollCurrentRef = useRef(0);

    const pointRef = useRef(new Vector3());

    const hoverRef = useRef(false);

    const loaderRef = useRef<GLTFLoader | null>(null);

    /*
     * ------------------------------------------------------------
     * RESIZE
     * ------------------------------------------------------------
     */

    const resize = useCallback(() => {
      const container = containerRef.current;
      const { camera, renderer } = threeRef.current;

      if (!container || !camera || !renderer) return;

      const rect = container.getBoundingClientRect();

      if (rect.width <= 0 || rect.height <= 0) {
        console.warn(
          '[BrainAnimation] Invalid container size:',
          rect.width,
          rect.height,
        );
        return;
      }

      renderer.setSize(rect.width, rect.height, false);

      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    }, []);

    /*
     * ------------------------------------------------------------
     * LOAD BRAIN
     * ------------------------------------------------------------
     */

    const loadBrain = useCallback(async () => {
      const scene = threeRef.current.scene;

      if (!scene || !loaderRef.current) return;

      return new Promise<void>((resolve, reject) => {
        loaderRef.current!.load(
          brainModel,

          (gltf) => {
            console.log('[BrainAnimation] GLB loaded');

            let sourceMesh: Mesh | null = null;

            gltf.scene.traverse((child) => {
              if (!sourceMesh && child instanceof Mesh) {
                sourceMesh = child;
              }
            });

            if (!sourceMesh) {
              console.error(
                '[BrainAnimation] No Mesh found inside brain.glb',
              );
              reject(new Error('No mesh found in brain.glb'));
              return;
            }

            const sourceGeometry = sourceMesh.geometry;

            if (!(sourceGeometry instanceof BufferGeometry)) {
              reject(
                new Error('Brain geometry is not a BufferGeometry'),
              );
              return;
            }

            console.log(
              '[BrainAnimation] Vertex count:',
              sourceGeometry.attributes.position.count,
            );

            /*
             * ------------------------------------------------------
             * NORMALIZE GEOMETRY
             * ------------------------------------------------------
             */

            sourceGeometry.computeBoundingBox();

            const box = sourceGeometry.boundingBox;

            if (!box) {
              reject(new Error('Unable to calculate brain bounds'));
              return;
            }

            const center = box.getCenter(new Vector3());
            const dimensions = box.getSize(new Vector3());

            const maxDimension = Math.max(
              dimensions.x,
              dimensions.y,
              dimensions.z,
            );

            /*
             * Move geometry center to origin.
             */
            sourceGeometry.translate(
              -center.x,
              -center.y,
              -center.z,
            );

            /*
             * Normalize the brain to a predictable world size.
             */
            const TARGET_SIZE = 2.58;

            const normalizationScale =
              TARGET_SIZE / Math.max(maxDimension, 0.0001);

            /*
             * ------------------------------------------------------
             * BRAIN GROUP
             * ------------------------------------------------------
             */

            const brainGroup = new Group();

            brainGroup.scale.setScalar(normalizationScale);

            /*
             * Keep the brain centered.
             */
            brainGroup.position.set(0, 0, 0);

            scene.add(brainGroup);

            threeRef.current.brainGroup = brainGroup;

            /*
             * ------------------------------------------------------
             * HIT MESH
             * ------------------------------------------------------
             */

            sourceGeometry.computeBoundingSphere();

            const sphere = sourceGeometry.boundingSphere;

            if (!sphere) {
              reject(
                new Error('Unable to calculate brain bounding sphere'),
              );
              return;
            }

            threeRef.current.brainRadius = sphere.radius;

            const hitGeometry = new SphereGeometry(
              sphere.radius * 1.2,
              32,
              24,
            );

            const hitMaterial = new MeshBasicMaterial({
              transparent: true,
              opacity: 0,
              depthWrite: false,
            });

            const hitMesh = new Mesh(
              hitGeometry,
              hitMaterial,
            );

            brainGroup.add(hitMesh);

            threeRef.current.hitMesh = hitMesh;

            /*
             * ------------------------------------------------------
             * PARTICLE GEOMETRY
             * ------------------------------------------------------
             */

            const particleGeometry = new BoxGeometry(
              0.004,
              0.004,
              0.004,
            );

            const particleMaterial = new ShaderMaterial({
              vertexShader,
              fragmentShader,

              wireframe: true,

              transparent: true,

              uniforms: {
                uPointer: {
                  value: new Vector3(0, 0, 0),
                },

                uColor: {
                  value: new Color(),
                },

                uRotation: {
                  value: 0,
                },

                uSize: {
                  value: 0,
                },

                uHover: {
                  value: 0,
                },
              },
            });

            const vertexCount =
              sourceGeometry.attributes.position.count;

            const instancedMesh =
              new InstancedUniformsMesh<any>(
                particleGeometry,
                particleMaterial,
                vertexCount,
              );

            threeRef.current.instancedMesh = instancedMesh;

            brainGroup.add(instancedMesh);

            /*
             * ------------------------------------------------------
             * CREATE PARTICLES
             * ------------------------------------------------------
             */

            const dummy = new Object3D();

            const positions =
              sourceGeometry.attributes.position.array;

            for (let i = 0; i < positions.length; i += 3) {
              const instanceIndex = i / 3;

              dummy.position.set(
                positions[i],
                positions[i + 1],
                positions[i + 2],
              );

              dummy.rotation.set(0, 0, 0);
              dummy.scale.set(1, 1, 1);

              dummy.updateMatrix();

              instancedMesh.setMatrixAt(
                instanceIndex,
                dummy.matrix,
              );

              instancedMesh.setUniformAt(
                'uRotation',
                instanceIndex,
                MathUtils.randFloat(-1, 1),
              );

              instancedMesh.setUniformAt(
                'uSize',
                instanceIndex,
                MathUtils.randFloat(0.3, 3),
              );

              const colorIndex = MathUtils.randInt(
                0,
                colors.length - 1,
              );

              instancedMesh.setUniformAt(
                'uColor',
                instanceIndex,
                colors[colorIndex],
              );

              instancedMesh.setUniformAt(
                'uHover',
                instanceIndex,
                0,
              );

              instancedMesh.setUniformAt(
                'uPointer',
                instanceIndex,
                new Vector3(0, 0, 0),
              );
            }

            instancedMesh.instanceMatrix.needsUpdate = true;

            /*
             * Force the scene graph to update.
             */
            brainGroup.updateMatrixWorld(true);

            console.log(
              '[BrainAnimation] Brain initialized:',
              {
                vertices: vertexCount,
                scale: normalizationScale,
                radius: sphere.radius,
              },
            );

            resolve();
          },

          undefined,

          (error) => {
            console.error(
              '[BrainAnimation] Failed to load brain.glb:',
              error,
            );

            reject(error);
          },
        );
      });
    }, [colors]);

    /*
     * ------------------------------------------------------------
     * HOVER
     * ------------------------------------------------------------
     */

    const setHover = useCallback(
      (value: number) => {
        gsap.killTweensOf(uniformsRef.current);

        gsap.to(uniformsRef.current, {
          uHover: value,
          duration: 0.3,
          ease: 'power2.out',

          onUpdate: () => {
            const mesh = threeRef.current.instancedMesh;

            if (!mesh) return;

            for (let i = 0; i < mesh.count; i++) {
              mesh.setUniformAt(
                'uHover',
                i,
                uniformsRef.current.uHover,
              );
            }
          },
        });
      },
      [],
    );

    /*
     * ------------------------------------------------------------
     * POINTER MOVE
     * ------------------------------------------------------------
     */

    const onPointerMove = useCallback(
      (event: PointerEvent) => {
        const container = containerRef.current;

        const {
          camera,
          raycaster,
          hitMesh,
          brainGroup,
          instancedMesh,
        } = threeRef.current;

        if (
          !container ||
          !camera ||
          !raycaster ||
          !hitMesh ||
          !brainGroup
        ) {
          return;
        }

        const rect = container.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) return;

        const x =
          ((event.clientX - rect.left) / rect.width) * 2 - 1;

        const y =
          -((event.clientY - rect.top) / rect.height) * 2 + 1;

        mouseRef.current.set(x, y);

        /*
         * Very subtle parallax.
         */
        targetCameraRef.current.set(
          x * 0.06,
          -y * 0.06,
        );

        /*
         * Raycast.
         */
        raycaster.setFromCamera(
          mouseRef.current,
          camera,
        );

        const intersections =
          raycaster.intersectObject(hitMesh, false);

        if (intersections.length === 0) {
          if (hoverRef.current) {
            hoverRef.current = false;
            setHover(0);
          }

          return;
        }

        /*
         * Enter hover.
         */
        if (!hoverRef.current) {
          hoverRef.current = true;
          setHover(1);
        }

        /*
         * Convert intersection point
         * from world space to brain-local space.
         */
        const localPoint =
          brainGroup.worldToLocal(
            intersections[0].point.clone(),
          );

        gsap.to(pointRef.current, {
          x: localPoint.x,
          y: localPoint.y,
          z: localPoint.z,

          duration: 0.2,

          overwrite: true,

          onUpdate: () => {
            if (!instancedMesh) return;

            for (
              let i = 0;
              i < instancedMesh.count;
              i++
            ) {
              instancedMesh.setUniformAt(
                'uPointer',
                i,
                pointRef.current,
              );
            }
          },
        });
      },
      [setHover],
    );

    /*
     * ------------------------------------------------------------
     * POINTER LEAVE
     * ------------------------------------------------------------
     */

    const onPointerLeave = useCallback(() => {
      hoverRef.current = false;

      setHover(0);

      targetCameraRef.current.set(0, 0);
    }, [setHover]);

    /*
     * ------------------------------------------------------------
     * SCROLL LISTENER
     * ------------------------------------------------------------
     */
    const onScroll = useCallback(() => {
      scrollTargetRef.current = window.scrollY * 0.001;
    }, []);

    /*
     * ------------------------------------------------------------
     * ANIMATION
     * ------------------------------------------------------------
     */

    const animate = useCallback(() => {
      if (!initializedRef.current) return;

      const camera = threeRef.current.camera;
      const renderer = threeRef.current.renderer;
      const scene = threeRef.current.scene;
      const brainGroup = threeRef.current.brainGroup;

      if (camera && renderer && scene) {
        /*
         * Smooth camera parallax.
         */
        camera.position.x = MathUtils.lerp(
          camera.position.x,
          targetCameraRef.current.x,
          0.05,
        );

        camera.position.y = MathUtils.lerp(
          camera.position.y,
          targetCameraRef.current.y,
          0.05,
        );

        camera.lookAt(0, 0, 0);

        if (brainGroup) {
          // Smoothly catch up to the scroll target
          scrollCurrentRef.current = MathUtils.lerp(scrollCurrentRef.current, scrollTargetRef.current, 0.05);
          
          // The base rotation just uses time
          const time = Date.now() * 0.0001;
          
          // Total rotation is time + smooth scroll
          brainGroup.rotation.y = time + scrollCurrentRef.current;
        }

        renderer.render(scene, camera);
      }

      animationFrameRef.current =
        requestAnimationFrame(animate);
    }, []);

    /*
     * ------------------------------------------------------------
     * INITIALIZE THREE
     * ------------------------------------------------------------
     */

    useEffect(() => {
      const container = containerRef.current;

      if (!container) return;

      if (initializedRef.current) return;

      initializedRef.current = true;

      const scene = new Scene();

      const camera = new PerspectiveCamera(
        45,
        1,
        0.1,
        100,
      );

      camera.position.set(0, 0, 3);

      camera.lookAt(0, 0, 0);

      const renderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
      });

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 1.5),
      );

      renderer.setClearColor(0x000000, 0);

      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';

      container.appendChild(renderer.domElement);

      const raycaster = new Raycaster();

      threeRef.current.scene = scene;
      threeRef.current.camera = camera;
      threeRef.current.renderer = renderer;
      threeRef.current.raycaster = raycaster;

      /*
       * Loader.
       */
      const loadingManager = new LoadingManager();

      loadingManager.onLoad = () => {
        document.documentElement.classList.add(
          'model-loaded',
        );
      };

      loaderRef.current =
        new GLTFLoader(loadingManager);

      /*
       * Resize.
       */
      resize();

      /*
       * Load model.
       */
      loadBrain()
        .then(() => {
          /*
           * Resize AGAIN after model loads.
           */
          resize();

          /*
           * Start rendering only after
           * everything is ready.
           */
          animate();
        })
        .catch((error) => {
          console.error(
            '[BrainAnimation] Initialization failed:',
            error,
          );
        });

      /*
       * Resize observer.
       */
      const observer = new ResizeObserver(() => {
        resize();
      });

      observer.observe(container);

      resizeObserverRef.current = observer;

      /*
       * Pointer events.
       */
      container.addEventListener(
        'pointermove',
        onPointerMove,
        { passive: true },
      );

      container.addEventListener(
        'pointerleave',
        onPointerLeave,
        { passive: true },
      );

      /*
       * Scroll event
       */
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll(); // initialize

      /*
       * Cleanup.
       */
      return () => {
        initializedRef.current = false;

        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(
            animationFrameRef.current,
          );
        }

        observer.disconnect();

        container.removeEventListener(
          'pointermove',
          onPointerMove,
        );

        container.removeEventListener(
          'pointerleave',
          onPointerLeave,
        );
        
        window.removeEventListener('scroll', onScroll);

        gsap.killTweensOf(uniformsRef.current);
        gsap.killTweensOf(pointRef.current);

        const {
          scene,
          renderer,
          instancedMesh,
          hitMesh,
        } = threeRef.current;

        if (instancedMesh) {
          instancedMesh.geometry.dispose();

          if (instancedMesh.material) {
            const material =
              instancedMesh.material as ShaderMaterial;

            material.dispose();
          }

          scene?.remove(instancedMesh);
        }

        if (hitMesh) {
          hitMesh.geometry.dispose();

          if (hitMesh.material) {
            (
              hitMesh.material as MeshBasicMaterial
            ).dispose();
          }

          scene?.remove(hitMesh);
        }

        if (renderer) {
          renderer.dispose();

          if (
            renderer.domElement.parentNode ===
            container
          ) {
            container.removeChild(
              renderer.domElement,
            );
          }
        }

        threeRef.current.scene = null;
        threeRef.current.camera = null;
        threeRef.current.renderer = null;
        threeRef.current.raycaster = null;
        threeRef.current.brainGroup = null;
        threeRef.current.hitMesh = null;
        threeRef.current.instancedMesh = null;

        loaderRef.current = null;
        resizeObserverRef.current = null;
      };
    }, [
      animate,
      loadBrain,
      onPointerLeave,
      onPointerMove,
      resize,
      onScroll,
    ]);

    /*
     * IMPORTANT:
     *
     * Do NOT use height: 100% here unless the parent
     * explicitly has a height.
     *
     * Give the brain its own real canvas height.
     */
    return (
      <div
        {...props}
        ref={containerRef}
        style={{
          width: '100%',
          height: '360px',
          minHeight: '360px',
          position: 'relative',
          display: 'block',
          ...style,
        }}
      />
    );
  },
);

BrainAnimation.displayName = 'BrainAnimation';

export default BrainAnimation;
