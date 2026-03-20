import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, User, Briefcase, MessageSquare, Star,
  CreditCard, Bell, Settings, LogOut, Search, BarChart2,
  Shield, Users, Menu, X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ConstellationLogo = () => (
  <svg width="32" height="32" viewBox="0 0 40 40">
    <line x1="8" y1="22" x2="18" y2="12" stroke="#4ade80" strokeWidth="1" opacity="0.8"/>
    <line x1="18" y1="12" x2="28" y2="20" stroke="#4ade80" strokeWidth="1" opacity="0.8"/>
    <line x1="28" y1="20" x2="24" y2="32" stroke="#06b6d4" strokeWidth="1" opacity="0.8"/>
    <line x1="24" y1="32" x2="12" y2="30" stroke="#06b6d4" strokeWidth="1" opacity="0.8"/>
    <line x1="12" y1="30" x2="8" y2="22" stroke="#06b6d4" strokeWidth="1" opacity="0.8"/>
    <circle cx="8" cy="22" r="2.5" fill="#06b6d4"/>
    <circle cx="18" cy="12" r="4" fill="#4ade80"/>
    <circle cx="28" cy="20" r="2.5" fill="#4ade80"/>
    <circle cx="24" cy="32" r="2" fill="#06b6d4"/>
    <circle cx="12" cy="30" r="2" fill="#4ade80"/>
    <line x1="18" y1="7" x2="18" y2="10" stroke="#ffffff" strokeWidth="1"/>
    <line x1="18" y1="14" x2="18" y2="17" stroke="#ffffff" strokeWidth="1"/>
    <line x1="13" y1="12" x2="16" y2="12" stroke="#ffffff" strokeWidth="1"/>
    <line x1="20" y1="12" x2="23" y2="12" stroke="#ffffff" strokeWidth="1"/>
  </svg>
);

const navConfig = {
  client: [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Briefcase, label: 'My Gigs', to: '/gigs' },
    { icon: Search, label: 'Find Freelancers', to: '/freelancers' },
    { icon: MessageSquare, label: 'Messages', to: '/messages' },
    { icon: CreditCard, label: 'Payments', to: '/payments' },
    { icon: Star, label: 'Reviews', to: '/reviews' },
    { icon: Bell, label: 'Notifications', to: '/notifications' },
    { icon: User, label: 'Profile', to: '/profile' },
    { icon: Settings, label: 'Settings', to: '/settings' },
  ],
  freelancer: [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Search, label: 'Browse Gigs', to: '/gigs' },
    { icon: Briefcase, label: 'My Proposals', to: '/proposals' },
    { icon: MessageSquare, label: 'Messages', to: '/messages' },
    { icon: CreditCard, label: 'Earnings', to: '/payments' },
    { icon: BarChart2, label: 'Analytics', to: '/analytics' },
    { icon: Star, label: 'Reviews', to: '/reviews' },
    { icon: Bell, label: 'Notifications', to: '/notifications' },
    { icon: User, label: 'Profile', to: '/profile' },
    { icon: Settings, label: 'Settings', to: '/settings' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/admin/dashboard' },
    { icon: Users, label: 'Users', to: '/admin/users' },
    { icon: Briefcase, label: 'Gigs', to: '/admin/gigs' },
    { icon: CreditCard, label: 'Payments', to: '/admin/payments' },
    { icon: Shield, label: 'Disputes', to: '/admin/disputes' },
    { icon: BarChart2, label: 'Analytics', to: '/admin/analytics' },
    { icon: Settings, label: 'Settings', to: '/admin/settings' },
  ],
};

const roleConfig = {
  admin:      { bg: 'rgba(255,255,255,0.15)', color: 'white',    label: 'Admin' },
  freelancer: { bg: 'rgba(74,222,128,0.2)',   color: '#4ade80',  label: 'Freelancer' },
  client:     { bg: 'rgba(6,182,212,0.2)',    color: '#06b6d4',  label: 'Client' },
};

const Sidebar = () => {
  const { user, logout, isFreelancer, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = isAdmin ? 'admin' : isFreelancer ? 'freelancer' : 'client';
  const navItems = navConfig[role];
  const rc = roleConfig[role];
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?';

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a2416' }}>

      {/* Logo */}
      <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
          <ConstellationLogo />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
            Skill<span style={{ color: '#4ade80' }}>Sphere</span>
          </span>
        </div>
        <span style={{
          display: 'inline-block', fontSize: 10, fontWeight: 700,
          padding: '3px 10px', borderRadius: 100,
          background: rc.bg, color: rc.color,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>{rc.label}</span>
      </div>

      {/* User card */}
      <div style={{
        margin: '12px', padding: '12px', borderRadius: 12,
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
          background: 'linear-gradient(135deg, #16a34a, #06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>
          {user?.avatar
            ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{initials}</span>
          }
        </div>
        <div style={{ overflow: 'hidden', minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '4px 10px', overflowY: 'auto' }}>
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard' || to === '/admin/dashboard'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 10, marginBottom: 2,
              fontSize: 14, fontWeight: 500, textDecoration: 'none',
              transition: 'all 0.15s',
              color: isActive ? '#4ade80' : 'rgba(255,255,255,0.65)',
              background: isActive ? 'rgba(74,222,128,0.12)' : 'transparent',
              borderLeft: isActive ? '3px solid #4ade80' : '3px solid transparent',
            })}
            onClick={() => setMobileOpen(false)}
          >
            {({ isActive }) => (
              <><Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} color={isActive ? '#4ade80' : 'rgba(255,255,255,0.45)'} />{label}</>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '10px 10px 14px' }}>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 10 }} />
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '9px 12px', borderRadius: 10, background: 'none',
            border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
            color: 'rgba(255,255,255,0.45)', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sidebar"><SidebarContent /></aside>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'none', position: 'fixed', bottom: 20, right: 20, zIndex: 200,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #0a2416, #16a34a)',
          color: 'white', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(10,36,22,0.5)',
          alignItems: 'center', justifyContent: 'center',
        }}
        className="mobile-menu-btn"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,36,22,0.8)', zIndex: 150, backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        >
          <div style={{ width: 'var(--sidebar-width)', height: '100%' }} onClick={(e) => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;