import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simple, reliable lerp function that doesn't depend on Three.js utils
const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

// Minimal 3D component that doesn't rely on external models
function SimpleGeometry({ mousePosition, isHovered }: { 
  mousePosition: { x: number; y: number }; 
  isHovered: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current && groupRef.current) {
      // Smooth rotation based on mouse position
      const targetRotationY = mousePosition.x * 0.3;
      const targetRotationX = mousePosition.y * 0.2;
      
      groupRef.current.rotation.y = lerp(
        groupRef.current.rotation.y,
        targetRotationY,
        0.02
      );
      
      groupRef.current.rotation.x = lerp(
        groupRef.current.rotation.x,
        targetRotationX,
        0.02
      );
      
      // Auto rotation
      meshRef.current.rotation.y += 0.005;
      
      // Scale animation on hover
      const targetScale = isHovered ? 1.2 : 1.0;
      const currentScale = meshRef.current.scale.x;
      const newScale = lerp(currentScale, targetScale, 0.05);
      meshRef.current.scale.set(newScale, newScale, newScale);
      
      // Floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 2]} />
        <meshStandardMaterial 
          color="#667eea"
          metalness={0.3}
          roughness={0.4}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Add some accent geometry */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.8, 0.1, 8, 32]} />
        <meshStandardMaterial 
          color="#764ba2"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

// Loading component
function LoadingGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#667eea" wireframe />
    </mesh>
  );
}

interface Model3DProps {
  modelUrl: string;
}

const Model3D: React.FC<Model3DProps> = ({ modelUrl }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track mouse movement
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      setMousePosition({ x, y });
    }
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      style={{ width: '100%', height: '500px', cursor: 'pointer' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Canvas
        camera={{ 
          position: [0, 2, 5], 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        style={{ 
          background: 'none',
          borderRadius: '16px'
        }}
      >
        {/* Simple, reliable lighting */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        {/* Simplified 3D geometry that won't cause import errors */}
        <Suspense fallback={<LoadingGeometry />}>
          <SimpleGeometry 
            mousePosition={mousePosition}
            isHovered={isHovered}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Model3D;
