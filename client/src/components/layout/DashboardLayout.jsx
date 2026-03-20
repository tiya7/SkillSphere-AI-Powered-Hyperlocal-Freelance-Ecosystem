import React from 'react';
import { Outlet } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';

const DashboardLayout = () => {
  const { user } = useAuth();
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?';

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <div style={{ flex: 1, position: 'relative', maxWidth: 400 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
            <input placeholder="Search gigs, freelancers..." style={{ width: '100%', padding: '8px 14px 8px 36px', border: '1.5px solid #e4e4e7', borderRadius: 10, fontSize: 13, fontFamily: 'var(--font-body)', background: '#fafafa', outline: 'none', color: '#18181b' }}
              onFocus={(e) => { e.target.style.borderColor = '#7B1450'; e.target.style.boxShadow = '0 0 0 3px rgba(123,20,80,0.08)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }} />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{ width: 38, height: 38, borderRadius: 10, background: '#fafafa', border: '1.5px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7B1450'; e.currentTarget.style.background = '#fdf4ff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e4e4e7'; e.currentTarget.style.background = '#fafafa'; }}>
              <Bell size={16} color="#52525b" />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#7B1450', border: '1.5px solid white' }} />
            </button>
            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #7B1450, #6B21A8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(123,20,80,0.3)', cursor: 'pointer' }}>
              {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{initials}</span>}
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;