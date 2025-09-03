import React, { useEffect, useRef, useState } from 'react';
import Model3D from '../Model3D/Model3D';
import './Hero.css';

// Error boundary for 3D model
class Model3DErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('3D Model failed to load:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ 
          width: '100%', 
          height: '500px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          opacity: 0.3,
          fontSize: '14px',
          color: 'rgba(255,255,255,0.5)'
        }}>
          ✨ Loading experience...
        </div>
      );
    }

    return this.props.children;
  }
}

const Hero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [is3DSupported, setIs3DSupported] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      // Set playback rate to 0.5 (50% speed - half speed)
      videoRef.current.playbackRate = 0.5;
    }

    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setIs3DSupported(false);
    }
  }, []);

  return (
    <section className="hero" id="home">
      {/* Background Video */}
      <div className="video-background">
        <video 
          ref={videoRef}
          autoPlay 
          muted 
          loop 
          playsInline
          className="background-video"
        >
          <source src="/images/4024-176369946_small.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Video overlay for better text readability */}
        <div className="video-overlay"></div>
      </div>
      
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            Welcome to <span className="brand-name">CodeWeave</span>
          </h1>
          <p className="hero-description">
            To Enhance Not Replace
          </p>
          <p className="hero-subtitle">
           A modern platform designed to empower creators by building exceptional web applications while seamlessly learning the core concepts that shape the future of technology.</p>
          
          <div className="hero-buttons">
            <button className="btn btn-primary">Get Started</button>
            <button className="btn btn-secondary">Learn More</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="model-container">
            {is3DSupported ? (
              <Model3DErrorBoundary>
                <Model3D modelUrl="/images/spider.glb" />
              </Model3DErrorBoundary>
            ) : (
              <div style={{ 
                width: '100%', 
                height: '500px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                opacity: 0.3,
                fontSize: '16px',
                color: 'rgba(255,255,255,0.5)'
              }}>
                🎨 Interactive experience requires WebGL
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
