import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ icon: Icon, label, value, change, changeLabel, color = '#3b82f6', bgColor = '#eff6ff' }) => {
  const isPositive = change >= 0;

  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bgColor }}>
        <Icon size={22} color={color} strokeWidth={2} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change !== undefined && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, marginTop: 8,
          fontSize: 12, fontWeight: 600,
          color: isPositive ? 'var(--success)' : 'var(--danger)',
        }}>
          {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {Math.abs(change)}% {changeLabel || 'vs last month'}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
