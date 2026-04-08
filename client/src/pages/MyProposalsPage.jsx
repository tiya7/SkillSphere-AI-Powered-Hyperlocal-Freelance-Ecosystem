import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchMyProposals, withdrawProposal, selectMyProposals, selectProposalsLoading } from '../store/slices/proposalsSlice';

const STATUS_CONFIG = {
  pending:     { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  accepted:    { bg: '#dcfce7', color: '#166534', label: 'Accepted ✓' },
  rejected:    { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
  withdrawn:   { bg: '#f3f4f6', color: '#374151', label: 'Withdrawn' },
  negotiating: { bg: '#dbeafe', color: '#1e40af', label: 'Negotiating' },
};

const MyProposalsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const proposals = useSelector(selectMyProposals);
  const isLoading = useSelector(selectProposalsLoading);

  useEffect(() => { dispatch(fetchMyProposals()); }, []);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this proposal?')) return;
    const result = await dispatch(withdrawProposal(id));
    if (withdrawProposal.fulfilled.match(result)) toast.success('Proposal withdrawn');
    else toast.error(result.payload);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(22,163,74,0.2)', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>My Proposals</h1>
        <p style={{ color: '#71717a', fontSize: 14 }}>{proposals.length} total proposals submitted</p>
      </div>

      {proposals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #e4e4e7' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
          <h3 style={{ fontSize: 18, marginBottom: 8, color: '#18181b' }}>No proposals yet</h3>
          <p style={{ color: '#71717a', fontSize: 14, marginBottom: 20 }}>Browse gigs and submit your first proposal</p>
          <button onClick={() => navigate('/gigs')}
            style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0a2416, #16a34a)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Browse Gigs
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {proposals.map((p) => {
            const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
            return (
              <div key={p._id} style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid #e4e4e7', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                    {p.gig?.category && (
                      <span style={{ fontSize: 11, color: '#a1a1aa' }}>{p.gig.category.replace('_', ' ')}</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#18181b', marginBottom: 6, cursor: 'pointer' }}
                    onClick={() => navigate(`/gigs/${p.gig?._id}`)}>
                    {p.gig?.title || 'Gig Unavailable'}
                  </h3>
                  <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.6, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.coverLetter}
                  </p>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: '#52525b', fontWeight: 600 }}>Bid: ₹{p.bidAmount?.toLocaleString()}</span>
                    <span style={{ fontSize: 13, color: '#71717a', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} /> {p.estimatedDays} days
                    </span>
                    <span style={{ fontSize: 13, color: '#71717a' }}>
                      AI Match: {p.aiMatchScore}%
                    </span>
                    <span style={{ fontSize: 13, color: '#a1a1aa' }}>
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  <button onClick={() => navigate(`/gigs/${p.gig?._id}`)}
                    style={{ padding: '8px 14px', background: '#f0faf4', border: '1px solid #16a34a', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#16a34a', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                    View Gig <ArrowRight size={13} />
                  </button>
                  {p.status === 'pending' && (
                    <button onClick={() => handleWithdraw(p._id)}
                      style={{ padding: '8px 14px', background: 'white', border: '1px solid #e4e4e7', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#ef4444', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <XCircle size={13} /> Withdraw
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyProposalsPage;
