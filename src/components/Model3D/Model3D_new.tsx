import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Model3DProps {
  modelUrl: string;
}

const Model3D: React.FC<Model3DProps> = ({ modelUrl }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const animationIdRef = useRef<number>();
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track mouse movement
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (mountRef.current) {
      const rect = mountRef.current.getBoundingClientRect();
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

  useEffect(() => {
    if (!mountRef.current) return;

    try {
      // Check WebGL support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setError('WebGL not supported');
        return;
      }

      // Scene setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        50,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 2, 5);
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      rendererRef.current = renderer;

      mountRef.current.appendChild(renderer.domElement);

      // Lighting setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);

      const pointLight1 = new THREE.PointLight(0x667eea, 0.3);
      pointLight1.position.set(-5, 5, -5);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0x764ba2, 0.2);
      pointLight2.position.set(5, 5, 5);
      scene.add(pointLight2);

      // Create fallback geometry immediately
      const createFallbackModel = () => {
        const group = new THREE.Group();
        
        // Main icosahedron
        const geometry = new THREE.IcosahedronGeometry(1.5, 2);
        const material = new THREE.MeshStandardMaterial({
          color: 0x667eea,
          metalness: 0.3,
          roughness: 0.4,
          transparent: true,
          opacity: 0.8
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Add a torus for the spider effect
        const torusGeometry = new THREE.TorusGeometry(1.8, 0.1, 8, 32);
        const torusMaterial = new THREE.MeshStandardMaterial({
          color: 0x764ba2,
          metalness: 0.8,
          roughness: 0.2,
          transparent: true,
          opacity: 0.6
        });
        const torus = new THREE.Mesh(torusGeometry, torusMaterial);
        
        group.add(mesh);
        group.add(torus);
        group.position.set(0, -1, 0);
        group.scale.setScalar(2);
        
        return group;
      };

      // Try to load GLTF model, but use fallback if GLTFLoader is not available
      try {
        // Check if GLTFLoader exists (it might not be available in production)
        if ((THREE as any).GLTFLoader) {
          const loader = new (THREE as any).GLTFLoader();
          
          loader.load(
            modelUrl,
            (gltf: any) => {
              const model = gltf.scene;
              model.position.set(0, -1, 0);
              model.scale.setScalar(2);
              
              // Enable shadows for the model
              model.traverse((child: any) => {
                if (child.isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                }
              });

              scene.add(model);
              modelRef.current = model;
              setIsLoaded(true);
              setError(null);
            },
            (progress: any) => {
              console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
            },
            (error: any) => {
              console.error('Error loading GLTF model:', error);
              // Use fallback
              const fallbackModel = createFallbackModel();
              scene.add(fallbackModel);
              modelRef.current = fallbackModel;
              setIsLoaded(true);
              setError(null);
            }
          );
        } else {
          throw new Error('GLTFLoader not available');
        }
      } catch (err) {
        console.log('GLTF loading not available, using fallback geometry');
        // Use fallback geometry
        const fallbackModel = createFallbackModel();
        scene.add(fallbackModel);
        modelRef.current = fallbackModel;
        setIsLoaded(true);
        setError(null);
      }

      // Animation loop
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);

        if (modelRef.current && cameraRef.current) {
          const time = Date.now() * 0.001;
          
          // Mouse tracking rotation
          const targetRotationY = mousePosition.x * 0.5;
          const targetRotationX = mousePosition.y * 0.3;
          
          // Smooth interpolation
          modelRef.current.rotation.y += (targetRotationY - modelRef.current.rotation.y) * 0.05;
          modelRef.current.rotation.x += (targetRotationX - modelRef.current.rotation.x) * 0.05;
          
          // Auto rotation when not hovered
          if (!isHovered) {
            modelRef.current.rotation.y += 0.005;
          }
          
          // Floating animation
          modelRef.current.position.y = -1 + Math.sin(time * 2) * 0.1;
          
          // Scale on hover
          const targetScale = isHovered ? 2.2 : 2.0;
          const currentScale = modelRef.current.scale.x;
          const newScale = currentScale + (targetScale - currentScale) * 0.1;
          modelRef.current.scale.setScalar(newScale);
        }

        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };

      animate();

      // Handle window resize
      const handleResize = () => {
        if (mountRef.current && cameraRef.current && rendererRef.current) {
          const width = mountRef.current.clientWidth;
          const height = mountRef.current.clientHeight;
          
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height);
        }
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        if (rendererRef.current && mountRef.current) {
          mountRef.current.removeChild(rendererRef.current.domElement);
          rendererRef.current.dispose();
        }
      };

    } catch (err) {
      console.error('Three.js setup error:', err);
      setError('3D rendering not supported');
    }
  }, [mousePosition, isHovered, modelUrl]);

  // CSS fallback for when Three.js fails completely
  if (error) {
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
          width: '100%',
          height: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '1000px',
          cursor: 'pointer'
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          style={{
            width: '200px',
            height: '200px',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.1 : 1})`,
            transition: 'transform 0.1s ease-out'
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
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🕷️</div>
              <div>3D Model</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '500px',
        cursor: 'pointer',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '14px',
            textAlign: 'center',
            zIndex: 10
          }}
        >
          <div style={{ 
            marginBottom: '12px', 
            fontSize: '24px',
            animation: 'spin 2s linear infinite' 
          }}>
            🕷️
          </div>
          <div>Loading 3D Model...</div>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default Model3D;
