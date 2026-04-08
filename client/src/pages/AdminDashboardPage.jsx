import React, { useEffect, useState } from 'react';
import { Users, Briefcase, CreditCard, AlertTriangle, Star, TrendingUp, Shield, CheckCircle, XCircle, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, sub, color = '#16a34a', bg = '#f0faf4' }) => (
  <div style={{ background: 'white', borderRadius: 14, padding: 22, border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#18181b', fontFamily: 'var(--font-display)' }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#52525b' }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 1 }}>{sub}</div>}
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/analytics'),
    ]).then(([statsRes, analyticsRes]) => {
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'users') loadUsers();
    if (tab === 'disputes') loadDisputes();
  }, [tab, userSearch, userPage]);

  const loadUsers = async () => {
    const res = await api.get(`/admin/users?search=${userSearch}&page=${userPage}&limit=15`);
    setUsers(res.data.users);
    setUserTotal(res.data.total);
  };

  const loadDisputes = async () => {
    const res = await api.get('/disputes?status=open');
    setDisputes(res.data.disputes);
  };

  const toggleSuspend = async (id, isSuspended) => {
    const reason = isSuspended ? '' : window.prompt('Reason for suspension:');
    if (!isSuspended && !reason) return;
    await api.put(`/admin/users/${id}/suspend`, { suspend: !isSuspended, reason });
    toast.success(`User ${isSuspended ? 'unsuspended' : 'suspended'}`);
    loadUsers();
  };

  const resolveDispute = async (id) => {
    const favor = window.prompt('Resolve in favor of: "client" or "freelancer"');
    if (!['client', 'freelancer'].includes(favor)) return;
    const resolution = window.prompt('Enter resolution notes:');
    if (!resolution) return;
    await api.put(`/disputes/${id}/resolve`, { favor, resolution });
    toast.success('Dispute resolved');
    loadDisputes();
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(22,163,74,0.2)', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  const s = stats?.stats;

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Admin Dashboard</h1>
        <p style={{ color: '#71717a', fontSize: 14 }}>Platform overview and management</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28, background: 'white', padding: 4, borderRadius: 12, border: '1px solid #e4e4e7', width: 'fit-content' }}>
        {[['overview', '📊 Overview'], ['users', '👥 Users'], ['disputes', '⚠️ Disputes'], ['logs', '📋 Logs']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: tab === key ? '#0a2416' : 'transparent', color: tab === key ? 'white' : '#52525b', fontFamily: 'inherit', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && s && (
        <>
          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 16, marginBottom: 28 }}>
            <StatCard icon={Users} label="Total Users" value={s.users.total} sub={`${s.users.freelancers} freelancers · ${s.users.clients} clients`} color="#16a34a" bg="#f0faf4" />
            <StatCard icon={Briefcase} label="Total Gigs" value={s.gigs.total} sub={`${s.gigs.open} open · ${s.gigs.active} active`} color="#2563eb" bg="#eff6ff" />
            <StatCard icon={CreditCard} label="Platform Revenue" value={`₹${(s.payments.platformRevenue || 0).toLocaleString()}`} sub={`₹${(s.payments.revenue || 0).toLocaleString()} total transacted`} color="#d97706" bg="#fef3c7" />
            <StatCard icon={AlertTriangle} label="Open Disputes" value={s.disputes.open} sub={`${s.disputes.total} total`} color={s.disputes.open > 0 ? '#ef4444' : '#16a34a'} bg={s.disputes.open > 0 ? '#fee2e2' : '#f0faf4'} />
            <StatCard icon={Star} label="Reviews" value={s.reviews.total} sub="Total platform reviews" color="#f59e0b" bg="#fef3c7" />
          </div>

          {/* Charts */}
          {analytics && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
              <div style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid #e4e4e7' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>New Users (Last 30 Days)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics.newUsers} barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => v.split('-')[2]} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12 }} />
                    <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid #e4e4e7' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Revenue (Last 30 Days)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={analytics.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => v.split('-')[2]} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12 }} />
                    <Line type="monotone" dataKey="revenue" stroke="#0a2416" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent users and gigs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e4e4e7', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f4f4f5', fontWeight: 700, fontSize: 15 }}>Recent Users</div>
              {stats?.recentUsers?.map(u => (
                <div key={u._id} style={{ padding: '12px 20px', borderBottom: '1px solid #f9fafb', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #0a2416, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>{u.name?.[0]}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#18181b' }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: '#71717a' }}>{u.email}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: u.role === 'freelancer' ? '#f0faf4' : '#eff6ff', color: u.role === 'freelancer' ? '#16a34a' : '#2563eb' }}>{u.role}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e4e4e7', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f4f4f5', fontWeight: 700, fontSize: 15 }}>Recent Gigs</div>
              {stats?.recentGigs?.map(g => (
                <div key={g._id} style={{ padding: '12px 20px', borderBottom: '1px solid #f9fafb' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#18181b', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.title}</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 12, color: '#71717a' }}>₹{g.budgetMin?.toLocaleString()} – ₹{g.budgetMax?.toLocaleString()}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 100, background: g.status === 'open' ? '#dcfce7' : '#f3f4f6', color: g.status === 'open' ? '#166534' : '#374151' }}>{g.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* USERS TAB */}
      {tab === 'users' && (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <input placeholder="Search by name or email..." value={userSearch} onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
              style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e4e4e7', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
            <span style={{ padding: '10px 14px', background: 'white', border: '1px solid #e4e4e7', borderRadius: 10, fontSize: 14, color: '#71717a' }}>{userTotal} users</span>
          </div>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e4e4e7', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#71717a', borderBottom: '1px solid #e4e4e7' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #0a2416, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>{u.name?.[0]}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#18181b' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#71717a' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: u.role === 'admin' ? '#fef3c7' : u.role === 'freelancer' ? '#f0faf4' : '#eff6ff', color: u.role === 'admin' ? '#92400e' : u.role === 'freelancer' ? '#16a34a' : '#2563eb' }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: u.isSuspended ? '#fee2e2' : '#dcfce7', color: u.isSuspended ? '#991b1b' : '#166534' }}>
                        {u.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#a1a1aa' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {u.role !== 'admin' && (
                        <button onClick={() => toggleSuspend(u._id, u.isSuspended)}
                          style={{ padding: '5px 10px', background: u.isSuspended ? '#f0faf4' : '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: u.isSuspended ? '#16a34a' : '#ef4444', fontFamily: 'inherit' }}>
                          {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {userTotal > 15 && (
              <div style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                {Array.from({ length: Math.ceil(userTotal / 15) }, (_, i) => i + 1).slice(0, 5).map(p => (
                  <button key={p} onClick={() => setUserPage(p)}
                    style={{ width: 32, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: userPage === p ? '#0a2416' : '#f4f4f5', color: userPage === p ? 'white' : '#52525b' }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* DISPUTES TAB */}
      {tab === 'disputes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {disputes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #e4e4e7' }}>
              <Shield size={40} color="#e4e4e7" style={{ marginBottom: 14 }} />
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>No open disputes</h3>
              <p style={{ color: '#71717a', fontSize: 14 }}>All disputes have been resolved</p>
            </div>
          ) : disputes.map(d => (
            <div key={d._id} style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid #fee2e2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: '#fee2e2', color: '#991b1b' }}>Open Dispute</span>
                    <span style={{ fontSize: 12, color: '#a1a1aa' }}>{new Date(d.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#18181b', marginBottom: 8 }}>{d.gig?.title}</h3>
                  <p style={{ fontSize: 13, color: '#52525b', lineHeight: 1.6, marginBottom: 10 }}>{d.reason}</p>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ fontSize: 13, color: '#71717a' }}>Raised by: <strong>{d.raisedBy?.name}</strong></span>
                    <span style={{ fontSize: 13, color: '#71717a' }}>Against: <strong>{d.against?.name}</strong></span>
                    <span style={{ fontSize: 13, color: '#71717a' }}>Amount: <strong>₹{d.payment?.amount?.toLocaleString()}</strong></span>
                  </div>
                </div>
                <button onClick={() => resolveDispute(d._id)}
                  style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #0a2416, #16a34a)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', marginLeft: 16 }}>
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOGS TAB */}
      {tab === 'logs' && <AdminLogsTab />}
    </div>
  );
};

const AdminLogsTab = () => {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get('/admin/logs').then(r => setLogs(r.data.logs)); }, []);
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e4e4e7', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f4f4f5', fontWeight: 700, fontSize: 15 }}>Admin Activity Logs</div>
      {logs.map((log, i) => (
        <div key={log._id} style={{ padding: '12px 20px', borderBottom: '1px solid #f9fafb', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0faf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={16} color="#16a34a" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#18181b' }}>{log.admin?.name} · <span style={{ color: '#16a34a' }}>{log.action.replace(/_/g, ' ')}</span></div>
            <div style={{ fontSize: 12, color: '#a1a1aa' }}>{new Date(log.createdAt).toLocaleString('en-IN')}</div>
          </div>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: '#f4f4f5', color: '#71717a' }}>{log.targetType}</span>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboardPage;
