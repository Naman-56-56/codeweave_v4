import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import Features from '../components/Features/Features';
import Stats from '../components/Stats/Stats';
import CTA from '../components/CTA/CTA';
import Footer from '../components/Footer/Footer';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      <Navbar />
      <main className="main-content">
        <Hero />
        <Features />
        <Stats />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
