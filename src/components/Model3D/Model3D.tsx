import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  url: string;
  mousePosition: { x: number; y: number };
  isHovered: boolean;
}

function Model({ url, mousePosition, isHovered }: ModelProps) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  // Interactive animation based on cursor position
  useFrame((state) => {
    if (modelRef.current) {
      // Base rotation
      const baseRotationY = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      
      // Cursor following - make spider look towards cursor
      const targetRotationY = (mousePosition.x / viewport.width) * Math.PI * 0.3;
      const targetRotationX = -(mousePosition.y / viewport.height) * Math.PI * 0.2;
      
      // Smooth interpolation towards target rotation
      modelRef.current.rotation.y = THREE.MathUtils.lerp(
        modelRef.current.rotation.y, 
        baseRotationY + targetRotationY, 
        0.02
      );
      
      modelRef.current.rotation.x = THREE.MathUtils.lerp(
        modelRef.current.rotation.x, 
        targetRotationX, 
        0.02
      );
      
      // Scale animation when hovered
      const targetScale = isHovered ? 1.7 : 1.5;
      const currentScale = modelRef.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.03);
      
      modelRef.current.scale.set(newScale, newScale, newScale);
      
      // Subtle floating motion
      modelRef.current.position.y = 0.1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });

  return (
    <group ref={modelRef}>
      <primitive 
        object={scene} 
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
          <Model 
            url={modelUrl} 
            mousePosition={mousePosition}
            isHovered={isHovered}
          />
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
