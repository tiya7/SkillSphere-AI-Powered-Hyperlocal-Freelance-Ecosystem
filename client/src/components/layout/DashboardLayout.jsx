import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { fetchNotifications, selectUnreadCount } from '../../store/slices/notificationsSlice';

const DashboardLayout = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const unreadCount = useSelector(selectUnreadCount);
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  useEffect(() => {
    if (user) dispatch(fetchNotifications());
    const interval = setInterval(() => { if (user) dispatch(fetchNotifications()); }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <div style={{ flex: 1, position: 'relative', maxWidth: 400 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
            <input placeholder="Search gigs, freelancers..."
              style={{ width: '100%', padding: '8px 14px 8px 36px', border: '1.5px solid #e4e4e7', borderRadius: 10, fontSize: 13, fontFamily: 'var(--font-body)', background: '#fafafa', outline: 'none', color: '#18181b' }}
              onFocus={e => { e.target.style.borderColor = '#16a34a'; e.target.style.background = 'white'; }}
              onBlur={e => { e.target.style.borderColor = '#e4e4e7'; e.target.style.background = '#fafafa'; }} />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Notification bell */}
            <button onClick={() => navigate('/notifications')}
              style={{ width: 38, height: 38, borderRadius: 10, background: '#fafafa', border: '1.5px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.background = '#f0faf4'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e4e4e7'; e.currentTarget.style.background = '#fafafa'; }}>
              <Bell size={16} color="#52525b" />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', border: '2px solid white', fontSize: 10, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {/* Avatar */}
            <div onClick={() => navigate('/profile')}
              style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #0a2416, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(10,36,22,0.3)', cursor: 'pointer' }}>
              {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{initials}</span>}
            </div>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  );
};

export default DashboardLayout;
