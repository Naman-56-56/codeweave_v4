import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleSectionChange = () => {
      const sections = ['home', 'features', 'stats', 'cta'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleSectionChange);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleSectionChange);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      closeMenu();
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <a href="#home" className="navbar-brand" onClick={(e) => handleNavClick(e, 'home')}>
          <div className="brand-logo-container">
            <div className="brand-logo-wrapper">
              <img 
                src="/images/Group_3-removebg-preview.png" 
                alt="CodeWeave Logo" 
                className="brand-logo-img"
              />
              <div className="brand-logo-glow"></div>
              <div className="brand-logo-ring"></div>
            </div>
          </div>
          <div className="brand-content">
            <span className="brand-text">CodeWeave</span>
            <span className="brand-tagline">Build. Ship. Scale.</span>
          </div>
        </a>
        
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-nav">
            <li className="nav-item">
              <a 
                href="#home" 
                className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, 'home')}
              >
                <span className="nav-text">Home</span>
                <span className="nav-indicator"></span>
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#features" 
                className={`nav-link ${activeSection === 'features' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, 'features')}
              >
                <span className="nav-text">Features</span>
                <span className="nav-indicator"></span>
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#stats" 
                className={`nav-link ${activeSection === 'stats' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, 'stats')}
              >
                <span className="nav-text">Stats</span>
                <span className="nav-indicator"></span>
              </a>
            </li>
            <li className="nav-item dropdown">
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a href="#" className="nav-link dropdown-toggle">
                <span className="nav-text">Solutions</span>
                <span className="dropdown-arrow">⌄</span>
                <span className="nav-indicator"></span>
              </a>
              <div className="dropdown-menu">
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a href="#" className="dropdown-item">
                  <span className="dropdown-icon">🚀</span>
                  <div>
                    <span className="dropdown-title">Startups</span>
                    <span className="dropdown-desc">Get started quickly</span>
                  </div>
                </a>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a href="#" className="dropdown-item">
                  <span className="dropdown-icon">🏢</span>
                  <div>
                    <span className="dropdown-title">Enterprise</span>
                    <span className="dropdown-desc">Scale with confidence</span>
                  </div>
                </a>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a href="#" className="dropdown-item">
                  <span className="dropdown-icon">👥</span>
                  <div>
                    <span className="dropdown-title">Teams</span>
                    <span className="dropdown-desc">Collaborate better</span>
                  </div>
                </a>
              </div>
            </li>
            <li className="nav-item">
              <a href="#pricing" className="nav-link">
                <span className="nav-text">Pricing</span>
                <span className="nav-indicator"></span>
              </a>
            </li>
            <li className="nav-item">
              <a href="#docs" className="nav-link">
                <span className="nav-text">Docs</span>
                <span className="nav-indicator"></span>
              </a>
            </li>
          </ul>
          
          <div className="navbar-actions">
            <a href="#get-started" className="btn-get-started">
              <span className="btn-text">Get Started</span>
            </a>
          </div>
        </div>
        
        <button 
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="toggle-line"></span>
          <span className="toggle-line"></span>
          <span className="toggle-line"></span>
        </button>
      </div>
      
      {isMenuOpen && <div className="navbar-overlay" onClick={closeMenu}></div>}
    </nav>
  );
};

export default Navbar;
