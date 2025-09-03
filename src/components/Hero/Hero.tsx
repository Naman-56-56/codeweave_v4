import React, { useEffect, useRef } from 'react';
import Model3D from '../Model3D/Model3D';
import './Hero.css';

const Hero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      // Set playback rate to 0.5 (50% speed - half speed)
      videoRef.current.playbackRate = 0.5;
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
            <Model3D modelUrl="/images/spider.glb" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
