import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Trash2, Users, Clock, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchMyGigs, deleteGig, selectMyGigs, selectGigsLoading } from '../store/slices/gigsSlice';

const STATUS_CONFIG = {
  draft:       { bg: '#f3f4f6', color: '#374151', label: 'Draft' },
  open:        { bg: '#dcfce7', color: '#166534', label: 'Open' },
  in_progress: { bg: '#dbeafe', color: '#1e40af', label: 'In Progress' },
  completed:   { bg: '#f0faf4', color: '#166534', label: 'Completed' },
  cancelled:   { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
};

const MyGigsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const gigs = useSelector(selectMyGigs);
  const isLoading = useSelector(selectGigsLoading);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => { dispatch(fetchMyGigs()); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const result = await dispatch(deleteGig(id));
    if (deleteGig.fulfilled.match(result)) toast.success('Gig deleted');
    else toast.error(result.payload || 'Failed to delete');
  };

  const stats = {
    total: gigs.length,
    open: gigs.filter(g => g.status === 'open').length,
    inProgress: gigs.filter(g => g.status === 'in_progress').length,
    completed: gigs.filter(g => g.status === 'completed').length,
  };

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(22,163,74,0.2)', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>My Gigs</h1>
          <p style={{ color: '#71717a', fontSize: 14 }}>Manage your posted projects</p>
        </div>
        <button onClick={() => navigate('/gigs/create')}
          style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0a2416, #16a34a)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' }}>
          <Plus size={16} /> Post New Gig
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Gigs', value: stats.total, color: '#0a2416' },
          { label: 'Open', value: stats.open, color: '#16a34a' },
          { label: 'In Progress', value: stats.inProgress, color: '#2563eb' },
          { label: 'Completed', value: stats.completed, color: '#06b6d4' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: '18px 20px', border: '1px solid #e4e4e7', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#71717a', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Gigs list */}
      {gigs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #e4e4e7' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>No gigs posted yet</h3>
          <p style={{ color: '#71717a', fontSize: 14, marginBottom: 20 }}>Post your first gig to find the perfect freelancer</p>
          <button onClick={() => navigate('/gigs/create')}
            style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #0a2416, #16a34a)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Post a Gig
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {gigs.map(gig => {
            const sc = STATUS_CONFIG[gig.status] || STATUS_CONFIG.open;
            const daysLeft = gig.deadline ? Math.max(0, Math.ceil((new Date(gig.deadline) - new Date()) / 86400000)) : null;
            return (
              <div key={gig._id} style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid #e4e4e7', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: sc.bg, color: sc.color }}>{sc.label}</span>
                      <span style={{ fontSize: 12, color: '#a1a1aa' }}>{new Date(gig.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#18181b', marginBottom: 6, cursor: 'pointer' }}
                      onClick={() => navigate(`/gigs/${gig._id}`)}>
                      {gig.title}
                    </h3>
                    <p style={{ fontSize: 13, color: '#71717a', marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {gig.description}
                    </p>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0a2416' }}>₹{gig.budgetMin?.toLocaleString()} – ₹{gig.budgetMax?.toLocaleString()}</span>
                      <span style={{ fontSize: 13, color: '#71717a', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={13} /> {gig.proposalCount || 0} proposals
                      </span>
                      <span style={{ fontSize: 13, color: '#71717a', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Eye size={13} /> {gig.views || 0} views
                      </span>
                      {daysLeft !== null && (
                        <span style={{ fontSize: 13, color: daysLeft < 3 ? '#ef4444' : '#71717a', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={13} /> {daysLeft}d left
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ position: 'relative', marginLeft: 16 }}>
                    <button onClick={() => setActiveMenu(activeMenu === gig._id ? null : gig._id)}
                      style={{ padding: 8, borderRadius: 8, border: '1px solid #e4e4e7', background: 'white', cursor: 'pointer', display: 'flex' }}>
                      <MoreVertical size={16} color="#71717a" />
                    </button>
                    {activeMenu === gig._id && (
                      <div style={{ position: 'absolute', right: 0, top: 40, background: 'white', border: '1px solid #e4e4e7', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 10, minWidth: 160, overflow: 'hidden' }}>
                        <button onClick={() => { navigate(`/gigs/${gig._id}`); setActiveMenu(null); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', width: '100%', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#18181b', fontFamily: 'inherit' }}>
                          <Eye size={14} /> View Gig
                        </button>
                        <button onClick={() => { handleDelete(gig._id, gig.title); setActiveMenu(null); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', width: '100%', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#ef4444', fontFamily: 'inherit' }}>
                          <Trash2 size={14} /> Delete Gig
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyGigsPage;
