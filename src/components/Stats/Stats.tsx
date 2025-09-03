import React from 'react';
import './Stats.css';

interface StatItemProps {
  number: string;
  label: string;
  suffix?: string;
}

const StatItem: React.FC<StatItemProps> = ({ number, label, suffix = '' }) => (
  <div className="stat-item">
    <div className="stat-number">{number}{suffix}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const Stats: React.FC = () => {
  const stats = [
    { number: "10K", label: "Developers", suffix: "+" },
    { number: "50K", label: "Projects", suffix: "+" },
    { number: "99.9", label: "Uptime", suffix: "%" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <section className="stats" id="stats">
      <div className="container">
        <div className="stats-header">
          <h2 className="stats-title">Trusted by Developers Worldwide</h2>
          <p className="stats-subtitle">
            Join thousands of developers who are already building amazing applications with CodeWeave
          </p>
        </div>
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <StatItem 
              key={index}
              number={stat.number}
              label={stat.label}
              suffix={stat.suffix}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
