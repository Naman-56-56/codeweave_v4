import React from 'react';
import './Features.css';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-description">{description}</p>
  </div>
);

const Features: React.FC = () => {
  const features = [
    {
      icon: "🚀",
      title: "Fast Development",
      description: "Build applications quickly with our modern toolchain and optimized workflows."
    },
    {
      icon: "⚡",
      title: "High Performance",
      description: "Optimized for speed and efficiency, delivering exceptional user experiences."
    },
    {
      icon: "🎨",
      title: "Beautiful Design",
      description: "Create stunning interfaces with our comprehensive design system and components."
    },
    {
      icon: "🔧",
      title: "Easy to Use",
      description: "Intuitive APIs and clear documentation make development a breeze."
    },
    {
      icon: "🔒",
      title: "Secure by Default",
      description: "Built-in security features and best practices to keep your applications safe."
    },
    {
      icon: "📱",
      title: "Mobile Ready",
      description: "Responsive components that work perfectly across all devices and screen sizes."
    }
  ];

  return (
    <section className="features" id="features">
      <div className="container">
        <div className="features-header">
          <h2 className="section-title">Why Choose CodeWeave?</h2>
          <p className="section-subtitle">
            Discover the powerful features that make CodeWeave the perfect choice for modern web development
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
