import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Safe lerp function that handles undefined cases
const safeLerp = (current: number, target: number, factor: number): number => {
  if (typeof current !== 'number' || typeof target !== 'number' || typeof factor !== 'number') {
    return target;
  }
  return current + (target - current) * factor;
};

interface ModelProps {
  url: string;
  mousePosition: { x: number; y: number };
  isHovered: boolean;
  onError?: () => void;
}

function Model({ url, mousePosition, isHovered, onError }: ModelProps) {
  const modelRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const [hasError, setHasError] = useState(false);

  // Always call useGLTF hook - this must be at the top level
  const gltf = useGLTF(url);

  // Effect to handle errors
  React.useEffect(() => {
    if (!gltf || !gltf.scene) {
      setHasError(true);
      if (onError) onError();
    }
  }, [gltf, onError]);

  // Interactive animation based on cursor position - always call useFrame
  useFrame((state) => {
    if (modelRef.current && state.clock && gltf && gltf.scene && !hasError) {
      // Base rotation
      const baseRotationY = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      
      // Cursor following - make spider look towards cursor
      const targetRotationY = (mousePosition.x / viewport.width) * Math.PI * 0.3;
      const targetRotationX = -(mousePosition.y / viewport.height) * Math.PI * 0.2;
      
      // Safe interpolation towards target rotation
      modelRef.current.rotation.y = safeLerp(
        modelRef.current.rotation.y, 
        baseRotationY + targetRotationY, 
        0.02
      );
      
      modelRef.current.rotation.x = safeLerp(
        modelRef.current.rotation.x, 
        targetRotationX, 
        0.02
      );
      
      // Scale animation when hovered
      const targetScale = isHovered ? 1.7 : 1.5;
      const currentScale = modelRef.current.scale.x;
      const newScale = safeLerp(currentScale, targetScale, 0.03);
      
      modelRef.current.scale.set(newScale, newScale, newScale);
      
      // Subtle floating motion
      modelRef.current.position.y = -0.1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });

  // Return null if there's an error or no scene
  if (hasError || !gltf || !gltf.scene) {
    return null;
  }

  return (
    <group ref={modelRef}>
      <primitive 
        object={gltf.scene} 
        scale={[1.5, 1.5, 1.5]} 
        position={[0, -0.1, 0]}
      />
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#667eea" wireframe />
    </mesh>
  );
}

// Simple fallback for when GLTF fails to load
function SimpleFallback() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial 
        color="#667eea" 
        wireframe={false}
        transparent
        opacity={0.8}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

interface Model3DProps {
  modelUrl: string;
}

const Model3D: React.FC<Model3DProps> = ({ modelUrl }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [useSimpleFallback, setUseSimpleFallback] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track mouse movement
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1; // Normalize to -1 to 1
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1; // Normalize to -1 to 1, flip Y
      setMousePosition({ x, y });
    }
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 }); // Reset to center when mouse leaves
  };

  // Error handler for GLTF loading
  const handleError = () => {
    console.warn('GLTF model failed to load, using simple fallback');
    setUseSimpleFallback(true);
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
        shadows
                  >
        {/* Lighting Setup */}
        <ambientLight intensity={0.4} color="#ffffff" />
        <directionalLight
          position={[5, 10, 5]}
          intensity={0.8}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight 
          position={[-5, 5, -5]} 
          intensity={0.3} 
          color="#667eea" 
        />
        <pointLight 
          position={[5, 5, 5]} 
          intensity={0.2} 
          color="#764ba2" 
        />

        {/* Environment for realistic reflections */}
        <Environment preset="city" />

        {/* Contact shadows for grounding */}
        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.3}
          scale={10}
          blur={2}
          far={4}
        />

        {/* 3D Model */}
        <Suspense fallback={<LoadingFallback />}>
          {useSimpleFallback ? (
            <SimpleFallback />
          ) : (
            <Model 
              url={modelUrl} 
              mousePosition={mousePosition}
              isHovered={isHovered}
              onError={handleError}
            />
          )}
        </Suspense>

        {/* Camera controls - disable auto rotation when interacting */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={8}
          maxPolarAngle={Math.PI / 2}
          autoRotate={!isHovered}
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
};

// Preload the model
useGLTF.preload('/images/spider.glb');

export default Model3D;
