import React, { useEffect, useState } from 'react';
import { TrendingUp, Eye, Briefcase, Star, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const COLORS = ['#0a2416', '#16a34a', '#06b6d4', '#f59e0b', '#ef4444'];

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/proposals/my').catch(() => ({ data: { proposals: [] } })),
      api.get('/reviews/me').catch(() => ({ data: { received: [] } })),
      api.get('/payments/my').catch(() => ({ data: { payments: [], stats: {} } })),
    ]).then(([p, r, pay]) => {
      setProposals(p.data.proposals);
      setReviews(r.data.received);
      setPayments(pay.data.payments);
      setLoading(false);
    });
  }, []);

  const proposalStats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
  };

  const pieData = [
    { name: 'Accepted', value: proposalStats.accepted },
    { name: 'Pending', value: proposalStats.pending },
    { name: 'Rejected', value: proposalStats.rejected },
  ].filter(d => d.value > 0);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const totalEarned = payments.filter(p => p.status === 'released').reduce((s, p) => s + (p.freelancerAmount || 0), 0);

  // Monthly earnings chart
  const monthlyData = payments.filter(p => p.status === 'released').reduce((acc, p) => {
    const month = new Date(p.createdAt).toLocaleString('en-IN', { month: 'short' });
    const existing = acc.find(a => a.month === month);
    if (existing) existing.earnings += p.freelancerAmount || 0;
    else acc.push({ month, earnings: p.freelancerAmount || 0 });
    return acc;
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(22,163,74,0.2)', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>My Analytics</h1>
        <p style={{ color: '#71717a', fontSize: 14 }}>Track your performance on SkillSphere</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { icon: Briefcase, label: 'Total Proposals', value: proposalStats.total, color: '#2563eb', bg: '#eff6ff' },
          { icon: TrendingUp, label: 'Acceptance Rate', value: proposalStats.total > 0 ? `${Math.round((proposalStats.accepted / proposalStats.total) * 100)}%` : '0%', color: '#16a34a', bg: '#f0faf4' },
          { icon: Star, label: 'Avg Rating', value: avgRating > 0 ? `${avgRating} ★` : 'N/A', color: '#f59e0b', bg: '#fef3c7' },
          { icon: DollarSign, label: 'Total Earned', value: `₹${totalEarned.toLocaleString()}`, color: '#0a2416', bg: '#f0faf4' },
          { icon: Eye, label: 'Reviews Received', value: reviews.length, color: '#7c3aed', bg: '#f5f3ff' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#18181b', fontFamily: 'var(--font-display)' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#71717a' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Earnings chart */}
        <div style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid #e4e4e7' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Monthly Earnings</h3>
          {monthlyData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa', fontSize: 14 }}>No earnings data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Earnings']} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Bar dataKey="earnings" fill="#16a34a" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Proposal breakdown */}
        <div style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid #e4e4e7' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Proposal Breakdown</h3>
          {pieData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa', fontSize: 14 }}>No proposal data yet</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <PieChart width={160} height={160}>
                <Pie data={pieData} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
              </PieChart>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pieData.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i] }} />
                    <span style={{ fontSize: 13, color: '#52525b' }}>{d.name}: <strong>{d.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      {reviews.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid #e4e4e7' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Reviews</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.slice(0, 5).map(r => (
              <div key={r._id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 12, borderBottom: '1px solid #f4f4f5' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #0a2416, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{r.reviewer?.name?.[0]}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#18181b' }}>{r.reviewer?.name}</span>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? '#f59e0b' : '#e4e4e7', fontSize: 13 }}>★</span>)}
                    </div>
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.5 }}>{r.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
