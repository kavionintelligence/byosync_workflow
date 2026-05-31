"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

const SEPARATION = 36;
const AMOUNTX = 72;
const AMOUNTY = 36;

function TrustWaveField() {
  const points = useRef<THREE.Points>(null);
  const count = AMOUNTX * AMOUNTY;

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c1 = new THREE.Color("#93c5fd");
    const c2 = new THREE.Color("#2563eb");
    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        pos[i] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        pos[i + 1] = 0;
        pos[i + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
        const mix = iy / AMOUNTY;
        const c = c1.clone().lerp(c2, mix * 0.35);
        col[i] = c.r;
        col[i + 1] = c.g;
        col[i + 2] = c.b;
        i += 3;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return geo;
  }, [count]);

  useFrame(({ clock }) => {
    if (!points.current) return;
    const t = clock.elapsedTime * 0.35;
    const arr = points.current.geometry.attributes.position.array as Float32Array;
    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        arr[i + 1] =
          Math.sin(ix * 0.28 + t) * 18 +
          Math.sin(iy * 0.22 + t * 0.85) * 14;
        i += 3;
      }
    }
    points.current.geometry.attributes.position.needsUpdate = true;
    points.current.rotation.y = t * 0.04;
  });

  return (
    <points ref={points} geometry={geometry} position={[0, -2.8, -4]} rotation={[-0.35, 0, 0]}>
      <pointsMaterial
        size={0.55}
        vertexColors
        transparent
        opacity={0.45}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function ProofOrbit({ radius, speed, offset, color }: { radius: number; speed: number; offset: number; color: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed + offset;
    ref.current.rotation.y = t;
    ref.current.rotation.x = Math.sin(t * 0.5) * 0.25;
  });
  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.014, 16, 128]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * radius, Math.sin(a * 0.5) * 0.2, Math.sin(a) * radius]}>
            <octahedronGeometry args={[0.09, 0]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} metalness={0.6} roughness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

function VaultCore() {
  const core = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (core.current) core.current.rotation.y = t * 0.25;
    if (glow.current) {
      glow.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.06);
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.12} floatIntensity={0.35}>
      <group>
        <mesh ref={glow}>
          <sphereGeometry args={[1.35, 32, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.06} depthWrite={false} />
        </mesh>
        <mesh ref={core}>
          <icosahedronGeometry args={[0.72, 2]} />
          <meshPhysicalMaterial
            color="#2563eb"
            emissive="#1d4ed8"
            emissiveIntensity={0.35}
            metalness={0.15}
            roughness={0.08}
            transmission={0.92}
            thickness={1.4}
            ior={1.45}
            clearcoat={1}
            clearcoatRoughness={0.08}
            transparent
          />
        </mesh>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[1.05, 0.012, 8, 100]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[Math.PI / 2.5, 0.4, 0]}>
          <torusGeometry args={[1.18, 0.008, 8, 100]} />
          <meshBasicMaterial color="#93c5fd" transparent opacity={0.35} />
        </mesh>
      </group>
    </Float>
  );
}

export interface TrustNucleusSceneProps {
  mouse: { x: number; y: number };
}

export function TrustNucleusScene({ mouse }: TrustNucleusSceneProps) {
  const rig = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!rig.current) return;
    rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, mouse.x * 0.42, delta * 1.8);
    rig.current.rotation.x = THREE.MathUtils.lerp(rig.current.rotation.x, mouse.y * 0.22, delta * 1.8);
  });

  return (
    <>
      <fog attach="fog" args={["#f8fafc", 6, 28]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 10, 8]} intensity={1.4} color="#eff6ff" />
      <directionalLight position={[-8, -2, -4]} intensity={0.35} color="#2563eb" />
      <pointLight position={[0, 3, 2]} intensity={2.2} color="#3b82f6" distance={12} />
      <pointLight position={[-3, -1, 3]} intensity={0.9} color="#60a5fa" distance={10} />

      <Sparkles count={90} scale={[14, 10, 10]} position={[0, 1, 0]} size={2} speed={0.18} opacity={0.45} color="#2563eb" />

      <TrustWaveField />

      <group ref={rig} position={[0, 0.5, 0]}>
        <VaultCore />
        <ProofOrbit radius={1.65} speed={0.35} offset={0} color="#2563eb" />
        <ProofOrbit radius={2.05} speed={-0.22} offset={1.2} color="#3b82f6" />
        <ProofOrbit radius={2.45} speed={0.18} offset={2.4} color="#60a5fa" />
      </group>

      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.85} intensity={0.65} mipmapBlur />
      </EffectComposer>
    </>
  );
}
