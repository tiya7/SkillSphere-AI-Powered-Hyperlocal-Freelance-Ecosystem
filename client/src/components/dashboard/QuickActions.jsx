import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickActions = ({ actions }) => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <button
            key={i}
            onClick={() => navigate(action.to)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              gap: 10, padding: '16px', borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--gray-100)', background: 'white',
              cursor: 'pointer', transition: 'all var(--transition)',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = action.color || 'var(--brand-300)';
              e.currentTarget.style.background = action.bg || 'var(--brand-50)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--gray-100)';
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)',
              background: action.bg || '#eff6ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={18} color={action.color || '#3b82f6'} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 2 }}>
                {action.label}
              </p>
              <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>{action.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;
