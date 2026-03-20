import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, DollarSign, Star, Eye, TrendingUp, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const earningsData = [
  { month: 'Oct', earnings: 32000 },
  { month: 'Nov', earnings: 45000 },
  { month: 'Dec', earnings: 28000 },
  { month: 'Jan', earnings: 52000 },
  { month: 'Feb', earnings: 41000 },
  { month: 'Mar', earnings: 67000 },
];

const recentProposals = [
  { gig: 'React Native App', client: 'TechCorp Pvt Ltd', bid: '₹55,000', status: 'pending', date: '2h ago' },
  { gig: 'E-commerce Backend', client: 'ShopEasy', bid: '₹80,000', status: 'accepted', date: '1d ago' },
  { gig: 'WordPress Site', client: 'LocalBiz', bid: '₹15,000', status: 'rejected', date: '3d ago' },
];

const statusStyles = {
  pending: { bg: 'var(--warning-light)', color: '#92400e', icon: Clock },
  accepted: { bg: 'var(--success-light)', color: '#065f46', icon: CheckCircle },
  rejected: { bg: 'var(--danger-light)', color: '#991b1b', icon: null },
};

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', marginBottom: '4px' }}>{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-muted">Track your earnings and proposals</p>
        </div>
        <Link to="/gigs" className="btn btn-primary">
          <Briefcase size={16} /> Browse Gigs
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        {[
          { label: 'Total Earnings', value: '₹2.65L', icon: DollarSign, color: '#d1fae5', iconColor: 'var(--success)', change: '+₹67k this month' },
          { label: 'Active Projects', value: '2', icon: Briefcase, color: '#dbeafe', iconColor: 'var(--brand-600)', change: '1 due this week' },
          { label: 'Reputation Score', value: '87', icon: Star, color: '#fef3c7', iconColor: 'var(--warning)', change: 'Gold tier' },
          { label: 'Profile Views', value: '248', icon: Eye, color: '#ede9fe', iconColor: '#7c3aed', change: '+42 this week' },
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

      {/* Charts + Proposals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Earnings chart */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Monthly Earnings</h3>
            <span className="badge badge-green">Last 6 months</span>
          </div>
          <div style={{ padding: '20px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={earningsData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Earnings']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: '13px' }} cursor={{ fill: 'var(--gray-50)' }} />
                <Bar dataKey="earnings" fill="var(--brand-500)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent proposals */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Recent Proposals</h3>
            <Link to="/proposals" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ padding: '8px 0' }}>
            {recentProposals.map((p, i) => {
              const s = statusStyles[p.status];
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: i < recentProposals.length - 1 ? '1px solid var(--gray-50)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--gray-800)', marginBottom: '2px' }}>{p.gig}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{p.client} · {p.bid} · {p.date}</div>
                  </div>
                  <span className="badge" style={{ background: s.bg, color: s.color, textTransform: 'capitalize' }}>{p.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Profile completeness */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Complete Your Profile</h3>
              <p className="text-muted" style={{ fontSize: '13px' }}>A complete profile gets 5x more gig invitations</p>
            </div>
            <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--brand-600)', fontFamily: 'var(--font-display)' }}>65%</span>
          </div>
          <div style={{ background: 'var(--gray-100)', borderRadius: '100px', height: '8px', marginBottom: '20px' }}>
            <div style={{ width: '65%', height: '100%', background: 'var(--brand-500)', borderRadius: '100px', transition: 'width 1s ease' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { label: 'Add Skills', done: true },
              { label: 'Upload Resume', done: false },
              { label: 'Add Portfolio', done: false },
              { label: 'Set Hourly Rate', done: true },
              { label: 'Add Work Experience', done: false },
              { label: 'Get Verified', done: false },
            ].map(({ label, done }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: done ? 'var(--success)' : 'var(--gray-500)' }}>
                <CheckCircle size={15} color={done ? 'var(--success)' : 'var(--gray-300)'} />
                {label}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px' }}>
            <Link to="/profile" className="btn btn-primary btn-sm">Complete Profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
