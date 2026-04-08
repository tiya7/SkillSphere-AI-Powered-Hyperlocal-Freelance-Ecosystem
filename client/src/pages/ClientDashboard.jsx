import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, CreditCard, Star, Plus, ArrowRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const spendData = [
  { month: 'Oct', amount: 0 },
  { month: 'Nov', amount: 0 },
  { month: 'Dec', amount: 0 },
  { month: 'Jan', amount: 0 },
  { month: 'Feb', amount: 0 },
  { month: 'Mar', amount: 0 },
];

const recentGigs = [];
const statusStyles = {
  active: { bg: 'var(--brand-100)', color: 'var(--brand-700)', label: 'Active' },
  review: { bg: 'var(--warning-light)', color: '#92400e', label: 'In Review' },
  completed: { bg: 'var(--success-light)', color: '#065f46', label: 'Completed' },
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', marginBottom: '4px' }}>{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-muted">Here's what's happening with your projects</p>
        </div>
        <Link to="/gigs/create" className="btn btn-primary">
          <Plus size={16} /> Post a Gig
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        {[
          { label: 'Active Gigs', value: '-', icon: Briefcase, color: '#dbeafe', iconColor: 'var(--brand-600)', change: '-' },
          { label: 'Hired Freelancers', value: '-', icon: Users, color: '#d1fae5', iconColor: 'var(--success)', change: '-' },
          { label: 'Total Spent', value: '₹-', icon: CreditCard, color: '#fef3c7', iconColor: 'var(--warning)', change: '+₹-' },
          { label: 'Avg. Rating Given', value: '-', icon: Star, color: '#ede9fe', iconColor: '#7c3aed', change: 'Based on 12 reviews' },
        ].map(({ label, value, icon: Icon, color, iconColor, change }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: color }}>
              <Icon size={22} color={iconColor} />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={12} /> {change}
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Recent Gigs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Spending chart */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Monthly Spending</h3>
            <span className="badge badge-blue">Last 6 months</span>
          </div>
          <div style={{ padding: '20px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={spendData}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Spent']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: '13px' }} />
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2.5} fill="url(#spendGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent gigs */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Recent Gigs</h3>
            <Link to="/gigs" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ padding: '8px 0' }}>
            {recentGigs.length === 0 ? (
  <div style={{ padding: '40px 24px', textAlign: 'center' }}>
    <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
    <p style={{ fontSize: 14, fontWeight: 600, color: '#18181b', marginBottom: 4 }}>No gigs yet</p>
    <p style={{ fontSize: 13, color: '#71717a' }}>Post your first gig to get started</p>
  </div>
) : recentGigs.map((g, i) => {
              const s = statusStyles[gig.status];
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: i < recentGigs.length - 1 ? '1px solid var(--gray-50)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--gray-800)', marginBottom: '2px' }}>{gig.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{gig.freelancer} · {gig.budget}</div>
                  </div>
                  <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: '24px', padding: '24px', background: 'linear-gradient(135deg, var(--brand-600), var(--brand-900))', borderRadius: 'var(--radius-xl)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '6px' }}>Ready to start your next project?</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px' }}>Browse 10,000+ verified freelancers in your area</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/freelancers" className="btn btn-secondary">Browse Freelancers</Link>
            <Link to="/gigs/create" style={{ background: 'white', color: 'var(--brand-700)', padding: '10px 20px', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <Plus size={16} /> Post a Gig
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
