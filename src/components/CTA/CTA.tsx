import React from 'react';
import './CTA.css';

const CTA: React.FC = () => {
  return (
    <section className="cta" id="cta">
      <div className="container">
        <div className="cta-content">
          <div className="cta-text">
            <h2 className="cta-title">Ready to Start Building?</h2>
            <p className="cta-description">
              Join thousands of developers who are already using CodeWeave to build amazing applications.
              Get started today and see the difference our platform can make.
            </p>
          </div>
          <div className="cta-actions">
            <a href="#get-started" className="btn btn-primary">Get Started</a>
            <button className="btn btn-outline-white">View Documentation</button>
          </div>
        </div>
        
        <div className="cta-features">
          <div className="cta-feature">
            <span className="cta-feature-icon">✨</span>
            <span className="cta-feature-text">Free to get started</span>
          </div>
          <div className="cta-feature">
            <span className="cta-feature-icon">🚀</span>
            <span className="cta-feature-text">Deploy in minutes</span>
          </div>
          <div className="cta-feature">
            <span className="cta-feature-icon">💪</span>
            <span className="cta-feature-text">Enterprise ready</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
