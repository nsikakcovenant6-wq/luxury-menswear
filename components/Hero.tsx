"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Html,
  Lightformer,
  MeshReflectorMaterial,
  PerformanceMonitor,
  Preload,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, ChevronRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DragState {
  isDragging: boolean;
  lastX: number;
  lastY: number;
  rotationY: number;
  rotationX: number;
  velocityY: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/* ------------------------------------------------------------------ */
/*  Canvas loading fallback                                            */
/* ------------------------------------------------------------------ */

function CanvasLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37]" />
        <p className="whitespace-nowrap text-[10px] uppercase tracking-[0.35em] text-[#D4AF37]">
          Preparing Atelier
        </p>
      </div>
    </Html>
  );
}

/* ------------------------------------------------------------------ */
/*  Procedural tailored suit                                           */
/* ------------------------------------------------------------------ */

interface SuitModelProps {
  dragState: MutableRefObject<DragState>;
}

function SuitModel({ dragState }: SuitModelProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const baseY = 0;

  const fabricMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#0c0c0c"),
        roughness: 0.55,
        metalness: 0.2,
        clearcoat: 0.35,
        clearcoatRoughness: 0.45,
        sheen: 1,
        sheenColor: new THREE.Color("#2a2a2a"),
        side: THREE.DoubleSide,
      }),
    []
  );

  const innerMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#050505"),
        roughness: 0.85,
        metalness: 0.1,
        side: THREE.DoubleSide,
      }),
    []
  );

  const goldMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#D4AF37"),
        roughness: 0.2,
        metalness: 1,
        emissive: new THREE.Color("#D4AF37"),
        emissiveIntensity: 0.06,
      }),
    []
  );

  const frontPanelGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0.05, 0.34);
    shape.lineTo(0.45, 0.3);
    shape.lineTo(0.52, -0.2);
    shape.lineTo(0.48, -0.75);
    shape.quadraticCurveTo(0.46, -1.05, 0.4, -1.22);
    shape.lineTo(0.16, -1.25);
    shape.lineTo(0.13, -0.4);
    shape.lineTo(0.34, -0.05);
    shape.lineTo(0.09, 0.15);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.012,
      bevelSegments: 2,
      curveSegments: 12,
    });
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  const backPanelGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.5, 0.28);
    shape.quadraticCurveTo(0, 0.4, 0.5, 0.28);
    shape.lineTo(0.54, -0.4);
    shape.lineTo(0.46, -0.85);
    shape.quadraticCurveTo(0.3, -1.28, 0, -1.3);
    shape.quadraticCurveTo(-0.3, -1.28, -0.46, -0.85);
    shape.lineTo(-0.54, -0.4);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2,
      curveSegments: 16,
    });
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  const innerFillGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.13, 0.3);
    shape.lineTo(0.13, 0.3);
    shape.lineTo(0.1, -1.1);
    shape.lineTo(-0.1, -1.1);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, []);

  const sleeveGeometry = useMemo(() => new THREE.CylinderGeometry(0.09, 0.065, 1.15, 14, 1), []);
  const cuffGeometry = useMemo(() => new THREE.TorusGeometry(0.068, 0.014, 8, 20), []);
  const buttonGeometry = useMemo(() => new THREE.SphereGeometry(0.022, 12, 12), []);
  const shoulderGeometry = useMemo(() => new THREE.SphereGeometry(0.1, 12, 12), []);
  const collarGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.16, 0.36, 0.02),
      new THREE.Vector3(0, 0.44, 0.06),
      new THREE.Vector3(0.16, 0.36, 0.02),
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.028, 8, false);
  }, []);
  const pocketSquareGeometry = useMemo(() => new THREE.PlaneGeometry(0.11, 0.07), []);

  useEffect(() => {
    return () => {
      frontPanelGeometry.dispose();
      backPanelGeometry.dispose();
      innerFillGeometry.dispose();
      sleeveGeometry.dispose();
      cuffGeometry.dispose();
      buttonGeometry.dispose();
      shoulderGeometry.dispose();
      collarGeometry.dispose();
      pocketSquareGeometry.dispose();
      fabricMaterial.dispose();
      innerMaterial.dispose();
      goldMaterial.dispose();
    };
  }, [
    frontPanelGeometry,
    backPanelGeometry,
    innerFillGeometry,
    sleeveGeometry,
    cuffGeometry,
    buttonGeometry,
    shoulderGeometry,
    collarGeometry,
    pocketSquareGeometry,
    fabricMaterial,
    innerMaterial,
    goldMaterial,
  ]);

  useFrame((state, delta) => {
    const drag = dragState.current;
    const autoRotateSpeed = 0.12;

    if (!drag.isDragging) {
      drag.rotationY += drag.velocityY;
      drag.velocityY *= 0.94;
      drag.rotationY += autoRotateSpeed * delta;
      drag.rotationX = THREE.MathUtils.lerp(drag.rotationX, 0, 0.02);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        drag.rotationY,
        drag.isDragging ? 0.35 : 0.12
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        clamp(drag.rotationX, -0.35, 0.35),
        0.12
      );
      groupRef.current.position.y =
        baseY + Math.sin(state.clock.elapsedTime * 0.6) * 0.045;
    }
  });

  return (
    <group ref={groupRef} rotation={[0, 0.4, 0]} position={[0, baseY, 0]}>
      <group position={[0, 0.65, 0]}>
        <mesh geometry={backPanelGeometry} material={fabricMaterial} position={[0, 0, -0.09]} />
        <mesh geometry={innerFillGeometry} material={innerMaterial} position={[0, 0, 0.03]} />

        <mesh geometry={frontPanelGeometry} material={fabricMaterial} position={[0, 0, 0.06]} />
        <mesh
          geometry={frontPanelGeometry}
          material={fabricMaterial}
          position={[0, 0, 0.06]}
          scale={[-1, 1, 1]}
        />

        <mesh geometry={collarGeometry} material={fabricMaterial} />

        <mesh geometry={buttonGeometry} material={goldMaterial} position={[0.11, -0.15, 0.12]} />
        <mesh geometry={buttonGeometry} material={goldMaterial} position={[0.11, -0.38, 0.12]} />
        <mesh geometry={buttonGeometry} material={goldMaterial} position={[0.11, -0.61, 0.12]} />

        <mesh
          geometry={pocketSquareGeometry}
          material={goldMaterial}
          position={[0.3, 0.02, 0.14]}
          rotation={[0, 0, -0.15]}
        />

        <mesh geometry={shoulderGeometry} material={fabricMaterial} position={[-0.46, 0.28, 0]} scale={[1, 0.7, 0.9]} />
        <mesh geometry={shoulderGeometry} material={fabricMaterial} position={[0.46, 0.28, 0]} scale={[1, 0.7, 0.9]} />

        <group position={[-0.5, 0.24, 0]} rotation={[0, 0, 0.22]}>
          <mesh geometry={sleeveGeometry} material={fabricMaterial} position={[0, -0.55, 0]} />
          <mesh
            geometry={cuffGeometry}
            material={goldMaterial}
            position={[0, -1.1, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        </group>

        <group position={[0.5, 0.24, 0]} rotation={[0, 0, -0.22]}>
          <mesh geometry={sleeveGeometry} material={fabricMaterial} position={[0, -0.55, 0]} />
          <mesh
            geometry={cuffGeometry}
            material={goldMaterial}
            position={[0, -1.1, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        </group>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Cinematic camera rig                                               */
/* ------------------------------------------------------------------ */

function CameraRig() {
  const targetPos = useRef(new THREE.Vector3(0, 0.5, 4.4));

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    const autoX = Math.sin(t * 0.15) * 0.4;
    const autoY = 0.5 + Math.sin(t * 0.2) * 0.08;
    const parallaxX = state.pointer.x * 0.5;
    const parallaxY = state.pointer.y * 0.2;

    targetPos.current.set(
      autoX + parallaxX,
      autoY + parallaxY,
      4.4 - Math.abs(state.pointer.x) * 0.3
    );

    const smoothing = 1 - Math.pow(0.001, delta);
    state.camera.position.lerp(targetPos.current, smoothing);
    state.camera.lookAt(0, 0.3, 0);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  Gold lighting, particles, reflective floor                         */
/* ------------------------------------------------------------------ */

interface GoldEnvironmentProps {
  isMobile: boolean;
}

function GoldEnvironment({ isMobile }: GoldEnvironmentProps) {
  const spotRef = useRef<THREE.SpotLight>(null!);
  const targetRef = useRef<THREE.Object3D>(null!);

  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.3), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const hitPoint = useMemo(() => new THREE.Vector3(), []);
  const desiredTarget = useMemo(() => new THREE.Vector3(0, 0.3, 0), []);
  const desiredSpotPos = useMemo(() => new THREE.Vector3(0, 3.2, 2.5), []);

  useEffect(() => {
    if (spotRef.current && targetRef.current) {
      spotRef.current.target = targetRef.current;
    }
  }, []);

  useFrame((state, delta) => {
    raycaster.setFromCamera(state.pointer, state.camera);
    if (raycaster.ray.intersectPlane(plane, hitPoint)) {
      desiredTarget.set(
        THREE.MathUtils.clamp(hitPoint.x * 0.5, -1.2, 1.2),
        0.3,
        THREE.MathUtils.clamp(hitPoint.z * 0.5 + 0.5, -1, 1.5)
      );
    }
    desiredSpotPos.set(desiredTarget.x * 0.6, 3.2, desiredTarget.z * 0.6 + 2.8);

    const smoothing = 1 - Math.pow(0.0001, delta);
    if (targetRef.current) targetRef.current.position.lerp(desiredTarget, smoothing);
    if (spotRef.current) spotRef.current.position.lerp(desiredSpotPos, smoothing);
  });

  return (
    <>
      <ambientLight intensity={0.25} color="#8a8a8a" />
      <directionalLight position={[-3, 4, 2]} intensity={0.4} color="#ffffff" />
      <pointLight position={[0, 1, -2]} intensity={0.6} color="#D4AF37" />

      <spotLight
        ref={spotRef}
        angle={0.4}
        penumbra={0.65}
        intensity={22}
        color="#D4AF37"
        distance={13}
        decay={2}
      />
      <object3D ref={targetRef} />

      <Environment resolution={isMobile ? 128 : 256}>
        <Lightformer intensity={2.2} color="#D4AF37" position={[0, 3, -6]} scale={[10, 4, 1]} />
        <Lightformer
          intensity={1}
          color="#ffffff"
          position={[-6, 2, 3]}
          scale={[6, 3, 1]}
          rotation={[0, Math.PI / 4, 0]}
        />
        <Lightformer
          intensity={1.6}
          color="#D4AF37"
          position={[6, -1, 3]}
          scale={[6, 3, 1]}
          rotation={[0, -Math.PI / 4, 0]}
        />
      </Environment>

      <Sparkles
        count={isMobile ? 60 : 140}
        scale={[2.6, 3, 2.6]}
        size={3}
        speed={0.35}
        opacity={0.8}
        color="#D4AF37"
        position={[0, 0.4, 0]}
      />
      <Sparkles
        count={isMobile ? 100 : 260}
        scale={[16, 10, 16]}
        size={1.6}
        speed={0.12}
        opacity={0.35}
        color="#D4AF37"
        position={[0, 1, -3]}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]}>
        <planeGeometry args={[20, 20]} />
        <MeshReflectorMaterial
          resolution={isMobile ? 256 : 512}
          mirror={0.35}
          blur={[300, 100]}
          mixBlur={1}
          mixStrength={35}
          roughness={1}
          depthScale={1}
          minDepthThreshold={0.85}
          color="#050505"
          metalness={0.4}
        />
      </mesh>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Canvas scene wrapper                                               */
/* ------------------------------------------------------------------ */

interface SceneProps {
  dragState: MutableRefObject<DragState>;
  isMobile: boolean;
}

function Scene({ dragState, isMobile }: SceneProps) {
  const [dpr, setDpr] = useState<[number, number]>(isMobile ? [1, 1.5] : [1, 2]);

  return (
    <Canvas
      shadows={false}
      dpr={dpr}
      gl={{
        antialias: !isMobile,
        alpha: false,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0.5, 4.4], fov: isMobile ? 38 : 32, near: 0.1, far: 50 }}
      className="!touch-none"
    >
      <color attach="background" args={["#0B0B0B"]} />
      <fog attach="fog" args={["#0B0B0B", 6, 14]} />

      <PerformanceMonitor
        onIncline={() => setDpr(isMobile ? [1, 1.5] : [1, 2])}
        onDecline={() => setDpr([1, 1])}
      />

      <Suspense fallback={<CanvasLoader />}>
        <CameraRig />
        <GoldEnvironment isMobile={isMobile} />
        <SuitModel dragState={dragState} />
      </Suspense>

      <Preload all />
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/*  Circular wipe transition                                           */
/* ------------------------------------------------------------------ */

interface TransitionOverlayProps {
  onCovered: () => void;
}

function TransitionOverlay({ onCovered }: TransitionOverlayProps) {
  const [stage, setStage] = useState<"covering" | "revealing">("covering");

  return (
    <motion.div
      initial={{ clipPath: "circle(0% at 50% 85%)", opacity: 1 }}
      animate={{
        clipPath: "circle(150% at 50% 85%)",
        opacity: stage === "covering" ? 1 : 0,
      }}
      transition={
        stage === "covering"
          ? { duration: 0.9, ease: [0.83, 0, 0.17, 1] }
          : { duration: 0.7, ease: "easeInOut" }
      }
      onAnimationComplete={() => {
        if (stage === "covering") {
          onCovered();
          setStage("revealing");
        }
      }}
      className="pointer-events-none fixed inset-0 z-[60] bg-gradient-to-br from-[#0B0B0B] via-[#151008] to-[#0B0B0B]"
      style={{ boxShadow: "inset 0 0 200px rgba(212,175,55,0.15)" }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Full-screen 3D hero                                                */
/* ------------------------------------------------------------------ */

interface LuxuryHero3DProps {
  onEnter?: () => void;
}

function LuxuryHero3D({ onEnter }: LuxuryHero3DProps) {
  const dragState = useRef<DragState>({
    isDragging: false,
    lastX: 0,
    lastY: 0,
    rotationY: 0.4,
    rotationX: 0,
    velocityY: 0,
  });

  const [hasInteracted, setHasInteracted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handlePointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current.isDragging = true;
    dragState.current.lastX = e.clientX;
    dragState.current.lastY = e.clientY;
    dragState.current.velocityY = 0;
    setHasInteracted(true);
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.isDragging) return;
    const deltaX = e.clientX - dragState.current.lastX;
    const deltaY = e.clientY - dragState.current.lastY;
    const sensitivity = 0.006;

    dragState.current.rotationY += deltaX * sensitivity;
    dragState.current.rotationX = Math.min(
      0.35,
      Math.max(-0.35, dragState.current.rotationX + deltaY * sensitivity)
    );
    dragState.current.velocityY = deltaX * sensitivity;
    dragState.current.lastX = e.clientX;
    dragState.current.lastY = e.clientY;
  }, []);

  const handlePointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    dragState.current.isDragging = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // pointer capture may already be released — safe to ignore
    }
  }, []);

  const handleEnterClick = useCallback(() => {
    setIsTransitioning(true);
  }, []);

  const handleCovered = useCallback(() => {
    onEnter?.();
  }, [onEnter]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0B0B0B]">
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute inset-0 z-10 touch-none cursor-grab active:cursor-grabbing"
      >
        {hasMounted && <Scene dragState={dragState} isMobile={isMobile} />}
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between px-6 py-8 sm:px-12 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.4em] text-white">
            Benkasa
          </span>
          <span className="hidden text-xs uppercase tracking-[0.3em] text-white/40 sm:block">
            Est. Luxury Tailoring
          </span>
        </motion.div>

        <div className="flex flex-col items-center text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xs uppercase tracking-[0.4em] text-[#D4AF37]"
          >
            The Art of Tailoring
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.65 }}
            className="mt-4 text-4xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl"
          >
            BENKASA
            <br />
            COLLECTION
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="pointer-events-auto mt-10 flex flex-col items-center gap-4"
          >
            <button
              type="button"
              onClick={handleEnterClick}
              className="group flex items-center gap-3 rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/10 px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37] backdrop-blur-xl transition-all hover:bg-[#D4AF37] hover:text-[#0B0B0B]"
            >
              Enter Collection
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>

            <AnimatePresence>
              {!hasInteracted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 1.4 }}
                  className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40"
                >
                  <RotateCw size={14} />
                  Drag to rotate
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-center text-[10px] uppercase tracking-[0.3em] text-white/30"
        >
          Enter to Explore the Collection
        </motion.div>
      </div>

      {isTransitioning && <TransitionOverlay onCovered={handleCovered} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Public gate component                                              */
/* ------------------------------------------------------------------ */

interface HeroProps {
  children?: ReactNode;
}

export default function Hero({ children }: HeroProps) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    document.body.style.overflow = entered ? "auto" : "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [entered]);

  const handleEnter = () => setEntered(true);

  return (
    <>
      {!entered && (
        <div className="fixed inset-0 z-50">
          <LuxuryHero3D onEnter={handleEnter} />
        </div>
      )}
      <div className={entered ? "opacity-100" : "pointer-events-none opacity-0"}>
        {children}
      </div>
    </>
  );
}