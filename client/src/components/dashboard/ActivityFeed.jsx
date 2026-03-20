import React from 'react';
import { CheckCircle, MessageSquare, Star, CreditCard, Briefcase, Bell } from 'lucide-react';

const iconMap = {
  gig: { icon: Briefcase, color: '#3b82f6', bg: '#eff6ff' },
  message: { icon: MessageSquare, color: '#8b5cf6', bg: '#f5f3ff' },
  review: { icon: Star, color: '#f59e0b', bg: '#fef3c7' },
  payment: { icon: CreditCard, color: '#10b981', bg: '#d1fae5' },
  complete: { icon: CheckCircle, color: '#10b981', bg: '#d1fae5' },
  default: { icon: Bell, color: '#64748b', bg: '#f1f5f9' },
};

const ActivityFeed = ({ activities = [] }) => {
  if (!activities.length) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <Bell size={32} color="var(--gray-300)" style={{ marginBottom: 12 }} />
        <p className="text-muted" style={{ fontSize: 14 }}>No recent activity</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {activities.map((item, i) => {
        const { icon: Icon, color, bg } = iconMap[item.type] || iconMap.default;
        const isLast = i === activities.length - 1;
        return (
          <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: isLast ? 0 : 20, position: 'relative' }}>
            {/* Connector line */}
            {!isLast && (
              <div style={{
                position: 'absolute', left: 17, top: 36, bottom: 0,
                width: 2, background: 'var(--gray-100)',
              }} />
            )}
            {/* Icon */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: bg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, zIndex: 1,
            }}>
              <Icon size={16} color={color} />
            </div>
            {/* Content */}
            <div style={{ flex: 1, paddingTop: 6 }}>
              <p style={{ fontSize: 14, color: 'var(--gray-800)', marginBottom: 2 }}>
                {item.text}
              </p>
              <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{item.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;
