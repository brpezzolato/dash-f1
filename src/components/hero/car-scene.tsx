"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/*
 * Carro de F1 estilizado, montado só com primitivas do Three.js.
 * Eixo Z aponta para a frente do carro; a unidade equivale a ~1 metro.
 */

const CARBON = { color: "#0c0d0e", roughness: 0.35, metalness: 0.4, clearcoat: 1, clearcoatRoughness: 0.25 };
const SILVER = { color: "#b9c2c4", roughness: 0.25, metalness: 0.9 };

function Body({ accent }: { accent: string }) {
  // Perfil lateral (z, y) do monocoque: bico → cockpit → airbox → tampa do motor.
  const geometry = useMemo(() => {
    const profile: [number, number][] = [
      [2.55, 0.16], [1.9, 0.24], [1.1, 0.36], [0.45, 0.48], [0.05, 0.5],
      [-0.25, 0.92], [-0.55, 0.96], [-1.3, 0.6], [-1.95, 0.42], [-2.15, 0.3],
      [-2.15, 0.1], [2.55, 0.1],
    ];
    const shape = new THREE.Shape(profile.map(([z, y]) => new THREE.Vector2(z, y)));
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.36,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.06,
      bevelSegments: 6,
      curveSegments: 24,
    });
    geo.translate(0, 0, -0.18);
    // A forma é desenhada no plano XY; giramos para que o eixo longo vire Z.
    geo.rotateY(-Math.PI / 2);
    return geo;
  }, []);

  return (
    <group>
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial {...CARBON} />
      </mesh>
      {/* Faixa verde-água sobre o bico e a tampa do motor. */}
      <mesh position={[0, 0.43, 1.25]} rotation={[0.17, 0, 0]}>
        <boxGeometry args={[0.07, 0.012, 1.9]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.82, -1.0]} rotation={[-0.42, 0, 0]}>
        <boxGeometry args={[0.04, 0.012, 1.3]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      {/* Barbatana da tampa do motor. */}
      <mesh position={[0, 0.88, -1.45]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.02, 0.32, 1.1]} />
        <meshPhysicalMaterial {...CARBON} />
      </mesh>
      {/* Assoalho. */}
      <mesh position={[0, 0.06, -0.2]}>
        <boxGeometry args={[1.5, 0.04, 3.6]} />
        <meshPhysicalMaterial {...CARBON} />
      </mesh>
      {/* Sidepods. */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.5, 0.3, -0.35]}>
          <RoundedBox args={[0.42, 0.36, 1.7]} radius={0.14} smoothness={4} castShadow>
            <meshPhysicalMaterial {...SILVER} />
          </RoundedBox>
          <mesh position={[side * 0.215, 0.02, 0]}>
            <boxGeometry args={[0.01, 0.06, 1.4]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Halo({ helmet }: { helmet: string }) {
  return (
    <group position={[0, 0.62, 0.25]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.27, 0.03, 12, 32, Math.PI]} />
        <meshPhysicalMaterial {...CARBON} />
      </mesh>
      <mesh position={[0, -0.06, 0.3]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.2, 8]} />
        <meshPhysicalMaterial {...CARBON} />
      </mesh>
      {/* Capacete do piloto. */}
      <mesh position={[0, -0.02, -0.12]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshPhysicalMaterial color={helmet} roughness={0.2} metalness={0.3} clearcoat={1} />
      </mesh>
    </group>
  );
}

function Wings({ accent }: { accent: string }) {
  return (
    <group>
      {/* Asa dianteira: dois elementos e placas laterais. */}
      <group position={[0, 0.1, 2.35]}>
        <mesh>
          <boxGeometry args={[1.95, 0.025, 0.36]} />
          <meshPhysicalMaterial {...CARBON} />
        </mesh>
        <mesh position={[0, 0.07, -0.12]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[1.8, 0.02, 0.18]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.98, 0.07, -0.02]}>
            <boxGeometry args={[0.025, 0.18, 0.42]} />
            <meshPhysicalMaterial {...CARBON} />
          </mesh>
        ))}
      </group>
      {/* Asa traseira com flap do DRS. */}
      <group position={[0, 0.95, -2.2]}>
        <mesh>
          <boxGeometry args={[1.25, 0.035, 0.34]} />
          <meshPhysicalMaterial {...CARBON} />
        </mesh>
        <mesh position={[0, 0.13, -0.05]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[1.22, 0.02, 0.2]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.63, -0.12, 0]}>
            <boxGeometry args={[0.03, 0.62, 0.5]} />
            <meshPhysicalMaterial {...CARBON} />
          </mesh>
        ))}
        <mesh position={[0, -0.35, 0.05]}>
          <boxGeometry args={[0.05, 0.5, 0.12]} />
          <meshPhysicalMaterial {...CARBON} />
        </mesh>
      </group>
    </group>
  );
}

function Wheel({ position, radius, width, accent, spin }: {
  position: [number, number, number];
  radius: number;
  width: number;
  accent: string;
  spin: React.RefObject<number>;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.x = spin.current;
  });

  return (
    <group position={position}>
      <group ref={ref}>
        <group rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[radius, radius, width, 40]} />
            <meshStandardMaterial color="#121212" roughness={0.9} />
          </mesh>
          {/* Aro e marcação colorida na lateral do pneu. */}
          {[-1, 1].map((side) => (
            <group key={side} position={[0, (side * width) / 2, 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[radius * 0.78, 0.012, 8, 48]} />
                <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} toneMapped={false} />
              </mesh>
              <mesh>
                <cylinderGeometry args={[radius * 0.58, radius * 0.58, 0.012, 32]} />
                <meshStandardMaterial {...SILVER} />
              </mesh>
              {/* Raios, para que a rotação fique visível. */}
              {[0, 1, 2].map((k) => (
                <mesh key={k} rotation={[0, (k * Math.PI) / 3, 0]} position={[0, side * 0.008, 0]}>
                  <boxGeometry args={[radius * 1.05, 0.01, 0.035]} />
                  <meshStandardMaterial color="#2b2f31" metalness={0.8} roughness={0.3} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}

function Suspension() {
  const arms: Array<[[number, number, number], [number, number, number]]> = [];
  for (const side of [-1, 1]) {
    arms.push([[side * 0.2, 0.32, 1.75], [side * 0.82, 0.36, 1.7]]);
    arms.push([[side * 0.2, 0.2, 1.6], [side * 0.82, 0.24, 1.7]]);
    arms.push([[side * 0.35, 0.36, -1.55], [side * 0.8, 0.4, -1.62]]);
    arms.push([[side * 0.35, 0.22, -1.7], [side * 0.8, 0.26, -1.62]]);
  }
  return (
    <group>
      {arms.map(([a, b], i) => {
        const start = new THREE.Vector3(...a);
        const end = new THREE.Vector3(...b);
        const mid = start.clone().add(end).multiplyScalar(0.5);
        const len = start.distanceTo(end);
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          end.clone().sub(start).normalize(),
        );
        return (
          <mesh key={i} position={mid} quaternion={quat}>
            <cylinderGeometry args={[0.014, 0.014, len, 6]} />
            <meshPhysicalMaterial {...CARBON} />
          </mesh>
        );
      })}
    </group>
  );
}

function Car({ accent, helmet }: { accent: string; helmet: string }) {
  const root = useRef<THREE.Group>(null);
  const spin = useRef(0);

  useFrame(({ clock, pointer }, delta) => {
    const car = root.current;
    if (!car) return;
    const t = clock.elapsedTime;

    // Entrada: o carro chega pela direita, freia e para na pose final.
    const intro = Math.min(t / 1.8, 1);
    const ease = 1 - Math.pow(1 - intro, 4);
    const speed = (1 - ease) * 26 + 1.2;
    spin.current += delta * speed;

    const targetYaw = -0.75 + pointer.x * 0.35;
    const targetPitch = 0.08 - pointer.y * 0.08;
    car.position.x = (1 - ease) * 9;
    car.position.y = Math.sin(t * 1.4) * 0.03;
    car.rotation.y = THREE.MathUtils.lerp(car.rotation.y, targetYaw + (1 - ease) * 0.6, 0.06);
    car.rotation.x = THREE.MathUtils.lerp(car.rotation.x, targetPitch, 0.06);
    // Leve inclinação na frenagem da entrada.
    car.rotation.z = (1 - ease) * 0.05 * Math.sin(t * 20);
  });

  return (
    <group ref={root} rotation={[0.08, -0.75, 0]}>
      <Body accent={accent} />
      <Halo helmet={helmet} />
      <Wings accent={accent} />
      <Suspension />
      <Wheel position={[-0.95, 0.34, 1.7]} radius={0.34} width={0.36} accent={accent} spin={spin} />
      <Wheel position={[0.95, 0.34, 1.7]} radius={0.34} width={0.36} accent={accent} spin={spin} />
      <Wheel position={[-0.95, 0.37, -1.62]} radius={0.37} width={0.44} accent={accent} spin={spin} />
      <Wheel position={[0.95, 0.37, -1.62]} radius={0.37} width={0.44} accent={accent} spin={spin} />
    </group>
  );
}

export default function CarScene({ accent = "#00d2be", helmet = "#f4f4f4" }: { accent?: string; helmet?: string }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [4.2, 2.4, 5.2], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
      eventSource={typeof document !== "undefined" ? document.documentElement : undefined}
      eventPrefix="client"
      onCreated={({ camera }) => camera.lookAt(0, 0.35, 0)}
    >
      <ambientLight intensity={0.25} />
      <spotLight position={[5, 8, 4]} angle={0.4} penumbra={1} intensity={60} castShadow />
      <pointLight position={[-4, 2, -3]} intensity={18} color={accent} />
      <Car accent={accent} helmet={helmet} />
      <ContactShadows position={[0, 0, 0]} opacity={0.65} scale={10} blur={2.4} far={2} />
      {/* Ambiente de estúdio procedural: reflexos sem baixar HDRI. */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 0]} scale={[10, 3, 1]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 2]} scale={[3, 6, 1]} rotation={[0, Math.PI / 2, 0]} />
        <Lightformer form="rect" intensity={2} color={accent} position={[5, 1, -2]} scale={[3, 6, 1]} rotation={[0, -Math.PI / 2, 0]} />
        <Lightformer form="ring" intensity={1.5} position={[0, 2, 6]} scale={3} />
      </Environment>
    </Canvas>
  );
}
