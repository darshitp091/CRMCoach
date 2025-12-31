'use client';

import { memo, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Optimized sphere with reduced polygon count for better performance
const AnimatedSphere = memo(function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Optimized rotation calculation
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.x = time * 0.15;
      meshRef.current.rotation.y = time * 0.2;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]} scale={2.5}>
      <MeshDistortMaterial
        color="#6366F1"
        attach="material"
        distort={0.4}
        speed={1.5}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
});

// Optimized particles with reduced count
const FloatingParticles = memo(function FloatingParticles() {
  const count = 50; // Reduced from 100 for better performance
  const particlesRef = useRef<THREE.Points>(null);

  // Memoize particle positions to avoid recalculation
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.getElapsedTime();
      particlesRef.current.rotation.x = time * 0.03;
      particlesRef.current.rotation.y = time * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#D946EF"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
});

export const OptimizedBackground = memo(function OptimizedBackground() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 opacity-40 will-change-transform">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{
          antialias: false, // Disable for better performance
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]} // Limit pixel ratio for better performance
        performance={{ min: 0.5 }} // Adaptive performance
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#06B6D4" intensity={0.5} />
        <AnimatedSphere />
        <FloatingParticles />
      </Canvas>
    </div>
  );
});
