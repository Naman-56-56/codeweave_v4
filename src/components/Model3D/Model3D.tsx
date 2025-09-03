import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Error Boundary Component
class ThreeJSErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Three.js Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Spider Model Component
function SpiderModel({ 
  url, 
  mousePosition, 
  isHovered 
}: { 
  url: string; 
  mousePosition: { x: number; y: number }; 
  isHovered: boolean;
}) {
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Smooth mouse tracking
      const targetRotationY = mousePosition.x * 0.5;
      const targetRotationX = mousePosition.y * 0.3;
      
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotationY,
        0.05
      );
      
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        targetRotationX,
        0.05
      );
      
      // Floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Scale on hover
      const targetScale = isHovered ? 1.1 : 1.0;
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1)
      );
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={scene}
      position={[0, -1, 0]}
      scale={2}
    />
  );
}

// Fallback component for when model fails to load
function ModelFallback() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.5, 2]} />
      <meshStandardMaterial 
        color="#667eea"
        metalness={0.3}
        roughness={0.4}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// Loading component
function LoadingSpinner() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[1, 0.3, 8, 32]} />
      <meshStandardMaterial 
        color="#667eea" 
        transparent 
        opacity={0.6}
      />
    </mesh>
  );
}

// CSS Fallback (when Three.js completely fails)
const CSSFallback: React.FC<{ mousePosition: { x: number; y: number }; isHovered: boolean }> = ({ 
  mousePosition, 
  isHovered 
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      const time = Date.now() * 0.001;
      setRotation({
        x: mousePosition.y * 15 + Math.sin(time) * 5,
        y: mousePosition.x * 15 + time * 10
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePosition]);

  return (
    <div
      style={{
        width: '200px',
        height: '200px',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.1 : 1})`,
        transition: 'transform 0.1s ease-out',
        margin: 'auto'
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          borderRadius: '20px',
          transform: 'translateZ(50px)',
          boxShadow: '0 0 50px rgba(102, 126, 234, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      />
    </div>
  );
};

interface Model3DProps {
  modelUrl: string;
}

const Model3D: React.FC<Model3DProps> = ({ modelUrl }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
      }
    } catch (e) {
      setWebGLSupported(false);
    }
  }, []);

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

  // If WebGL is not supported, use CSS fallback
  if (!webGLSupported) {
    return (
      <div 
        ref={containerRef}
        style={{ 
          width: '100%', 
          height: '500px', 
          cursor: 'pointer',
          perspective: '1000px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <CSSFallback mousePosition={mousePosition} isHovered={isHovered} />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      style={{ width: '100%', height: '500px', cursor: 'pointer' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ThreeJSErrorBoundary 
        fallback={
          <div style={{ 
            width: '100%', 
            height: '100%', 
            perspective: '1000px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CSSFallback mousePosition={mousePosition} isHovered={isHovered} />
          </div>
        }
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
          dpr={[1, 2]}
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-5, 5, -5]} intensity={0.3} color="#667eea" />

          {/* Environment for reflections */}
          <Environment preset="city" />

          {/* Ground shadows */}
          <ContactShadows
            position={[0, -2, 0]}
            opacity={0.3}
            scale={10}
            blur={2}
            far={4}
          />

          {/* 3D Model with fallback */}
          <Suspense fallback={<LoadingSpinner />}>
            <ThreeJSErrorBoundary fallback={<ModelFallback />}>
              <SpiderModel 
                url={modelUrl} 
                mousePosition={mousePosition}
                isHovered={isHovered}
              />
            </ThreeJSErrorBoundary>
          </Suspense>

          {/* Camera controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={8}
            maxPolarAngle={Math.PI / 2}
            autoRotate={!isHovered}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </ThreeJSErrorBoundary>
    </div>
  );
};

// Preload the model
useGLTF.preload('/images/spider.glb');

export default Model3D;
