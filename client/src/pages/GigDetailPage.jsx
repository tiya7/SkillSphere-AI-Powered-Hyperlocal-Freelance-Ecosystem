import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Clock, Users, Eye, ArrowLeft, CheckCircle, XCircle, Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchGig, selectCurrentGig, selectGigsLoading } from '../store/slices/gigsSlice';
import { submitProposal, fetchGigProposals, acceptProposal, rejectProposal, selectGigProposals, selectProposalsSubmitting } from '../store/slices/proposalsSlice';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

const CATEGORIES = {
  web_development: 'Web Development', mobile_development: 'Mobile Development',
  ui_ux_design: 'UI/UX Design', graphic_design: 'Graphic Design',
  content_writing: 'Content Writing', digital_marketing: 'Digital Marketing',
  data_science: 'Data Science', video_editing: 'Video Editing',
  photography: 'Photography', other: 'Other',
};

const GigDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isFreelancer, isClient, user } = useAuth();
  const gig = useSelector(selectCurrentGig);
  const isLoading = useSelector(selectGigsLoading);
  const gigProposals = useSelector(selectGigProposals);
  const isSubmitting = useSelector(selectProposalsSubmitting);

  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposal, setProposal] = useState({ coverLetter: '', bidAmount: '', estimatedDays: '' });
  const [messagingUserId, setMessagingUserId] = useState(null);

  useEffect(() => {
    dispatch(fetchGig(id));
  }, [id]);

  useEffect(() => {
    if (gig && isClient && gig.client?._id === user?._id) {
      dispatch(fetchGigProposals(id));
    }
  }, [gig]);

  const handleSubmitProposal = async () => {
    if (!proposal.coverLetter || !proposal.bidAmount || !proposal.estimatedDays) {
      toast.error('Please fill all fields');
      return;
    }
    const result = await dispatch(submitProposal({
      gigId: id,
      coverLetter: proposal.coverLetter,
      bidAmount: Number(proposal.bidAmount),
      estimatedDays: Number(proposal.estimatedDays),
    }));
    if (submitProposal.fulfilled.match(result)) {
      toast.success('Proposal submitted!');
      setShowProposalForm(false);
      setProposal({ coverLetter: '', bidAmount: '', estimatedDays: '' });
    } else {
      toast.error(result.payload || 'Failed to submit');
    }
  };

  const handleAccept = async (proposalId) => {
    const result = await dispatch(acceptProposal(proposalId));
    if (acceptProposal.fulfilled.match(result)) toast.success('Proposal accepted! Project started.');
    else toast.error(result.payload);
  };

  const handleReject = async (proposalId) => {
    const result = await dispatch(rejectProposal(proposalId));
    if (rejectProposal.fulfilled.match(result)) toast.success('Proposal rejected');
    else toast.error(result.payload);
  };

  // Opens or creates a conversation and navigates to /messages
  const handleMessage = async (recipientId) => {
    if (!recipientId) return;
    setMessagingUserId(recipientId);
    try {
      const res = await api.post('/chat/conversation', { recipientId, gigId: id });
      const conv = res.data.conversation;
      navigate('/messages', { state: { openConversationId: conv._id, conversation: conv } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not open chat');
    } finally {
      setMessagingUserId(null);
    }
  };

  if (isLoading || !gig) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(22,163,74,0.2)', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  const isOwner = gig.client?._id === user?._id;
  const daysLeft = gig.deadline ? Math.max(0, Math.ceil((new Date(gig.deadline) - new Date()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <div className="page-enter">
      {/* Back */}
      <button onClick={() => navigate('/gigs')}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', fontSize: 14, marginBottom: 24, padding: 0, fontFamily: 'inherit' }}>
        <ArrowLeft size={16} /> Back to Gigs
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>

        {/* Left - Gig details */}
        <div>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #e4e4e7', marginBottom: 20 }}>
            {/* Category + Status */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: '#f0faf4', color: '#16a34a' }}>
                {CATEGORIES[gig.category] || gig.category}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: gig.status === 'open' ? '#dcfce7' : '#f3f4f6', color: gig.status === 'open' ? '#166534' : '#374151' }}>
                {gig.status.replace('_', ' ')}
              </span>
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#18181b', marginBottom: 12, lineHeight: 1.3 }}>{gig.title}</h1>

            {/* Meta */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
              {gig.location?.city && (
                <span style={{ fontSize: 13, color: '#71717a', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <MapPin size={14} /> {gig.location.city}{gig.location.isRemote ? ' · Remote OK' : ''}
                </span>
              )}
              {daysLeft !== null && (
                <span style={{ fontSize: 13, color: daysLeft < 3 ? '#ef4444' : '#71717a', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={14} /> {daysLeft} days left
                </span>
              )}
              <span style={{ fontSize: 13, color: '#71717a', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Users size={14} /> {gig.proposalCount || 0} proposals
              </span>
              <span style={{ fontSize: 13, color: '#71717a', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Eye size={14} /> {gig.views || 0} views
              </span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f4f4f5', marginBottom: 20 }} />

            {/* Description */}
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Project Description</h3>
            <p style={{ fontSize: 14, color: '#52525b', lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: 20 }}>{gig.description}</p>

            {/* Skills */}
            {gig.skills?.length > 0 && (
              <>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Required Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {gig.skills.map((s) => (
                    <span key={s} style={{ padding: '6px 12px', borderRadius: 8, background: '#f0faf4', border: '1px solid #bbf7d0', fontSize: 13, color: '#166534', fontWeight: 500 }}>
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* Milestones */}
            {gig.milestones?.length > 0 && (
              <>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Payment Milestones</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {gig.milestones.map((m, i) => (
                    <div key={i} style={{ padding: '12px 16px', borderRadius: 10, background: '#f9fafb', border: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#18181b' }}>{m.title}</div>
                        {m.description && <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>{m.description}</div>}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0a2416' }}>₹{Number(m.amount).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Proposals section (client view) */}
          {isOwner && gigProposals.length > 0 && (
            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e4e4e7' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Proposals ({gigProposals.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {gigProposals.map((p) => (
                  <div key={p._id} style={{ padding: 16, borderRadius: 12, border: `1px solid ${p.status === 'accepted' ? '#16a34a' : '#e4e4e7'}`, background: p.status === 'accepted' ? '#f0faf4' : 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #0a2416, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{p.freelancer?.name?.[0]}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#18181b' }}>{p.freelancer?.name}</div>
                          <div style={{ fontSize: 12, color: '#71717a' }}>AI Match: {p.aiMatchScore}% · Skills: {p.skillMatchPercentage}%</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#0a2416' }}>₹{p.bidAmount?.toLocaleString()}</div>
                        <div style={{ fontSize: 12, color: '#71717a' }}>{p.estimatedDays} days</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: '#52525b', lineHeight: 1.6, marginBottom: 12 }}>{p.coverLetter}</p>
                    {p.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleAccept(p._id)}
                          style={{ flex: 1, padding: '8px', background: '#0a2416', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <CheckCircle size={14} /> Accept
                        </button>
                        <button onClick={() => handleReject(p._id)}
                          style={{ flex: 1, padding: '8px', background: 'white', color: '#ef4444', border: '1.5px solid #ef4444', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <XCircle size={14} /> Reject
                        </button>
                        {/* ── NEW: Message freelancer button ── */}
                        {p.freelancer?._id && (
                          <button
                            onClick={() => handleMessage(p.freelancer._id)}
                            disabled={messagingUserId === p.freelancer._id}
                            style={{ padding: '8px 14px', background: '#f0faf4', color: '#16a34a', border: '1.5px solid #16a34a', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', opacity: messagingUserId === p.freelancer._id ? 0.6 : 1 }}>
                            <MessageSquare size={14} />
                            {messagingUserId === p.freelancer._id ? '...' : 'Message'}
                          </button>
                        )}
                      </div>
                    )}
                    {p.status !== 'pending' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: p.status === 'accepted' ? '#dcfce7' : '#fee2e2', color: p.status === 'accepted' ? '#166534' : '#991b1b' }}>
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                        {/* Message button even after accept/reject */}
                        {p.freelancer?._id && (
                          <button
                            onClick={() => handleMessage(p.freelancer._id)}
                            disabled={messagingUserId === p.freelancer._id}
                            style={{ padding: '6px 12px', background: '#f0faf4', color: '#16a34a', border: '1.5px solid #16a34a', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, opacity: messagingUserId === p.freelancer._id ? 0.6 : 1 }}>
                            <MessageSquare size={13} />
                            {messagingUserId === p.freelancer._id ? '...' : 'Message'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div>
          {/* Budget card */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e4e4e7', marginBottom: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0a2416' }}>
                ₹{gig.budgetMin?.toLocaleString()} – ₹{gig.budgetMax?.toLocaleString()}
              </div>
              <div style={{ fontSize: 13, color: '#71717a', marginTop: 4 }}>{gig.budgetType === 'hourly' ? 'per hour' : 'Fixed price'}</div>
            </div>

            {/* Freelancer actions: Submit Proposal + Message Client */}
            {isFreelancer && gig.status === 'open' && !isOwner && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => setShowProposalForm(!showProposalForm)}
                  style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #0a2416, #16a34a)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Send size={16} /> {showProposalForm ? 'Cancel' : 'Submit Proposal'}
                </button>
                {/* ── NEW: Message Client button for freelancers ── */}
                {gig.client?._id && (
                  <button
                    onClick={() => handleMessage(gig.client._id)}
                    disabled={messagingUserId === gig.client._id}
                    style={{ width: '100%', padding: '11px', background: 'white', color: '#16a34a', border: '1.5px solid #16a34a', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: messagingUserId === gig.client._id ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', opacity: messagingUserId === gig.client._id ? 0.6 : 1 }}
                    onMouseEnter={e => { if (messagingUserId !== gig.client._id) { e.currentTarget.style.background = '#f0faf4'; } }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}>
                    <MessageSquare size={16} />
                    {messagingUserId === gig.client._id ? 'Opening chat...' : 'Message Client'}
                  </button>
                )}
              </div>
            )}

            {isOwner && (
              <div style={{ textAlign: 'center', padding: '10px', background: '#f0faf4', borderRadius: 8, fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
                ✓ This is your gig
              </div>
            )}
          </div>

          {/* Proposal form */}
          {showProposalForm && (
            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #16a34a', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your Proposal</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 5 }}>Cover Letter *</label>
                  <textarea placeholder="Describe why you're the best fit for this gig..."
                    value={proposal.coverLetter}
                    onChange={(e) => setProposal({ ...proposal, coverLetter: e.target.value })}
                    rows={5} style={{ width: '100%', padding: '10px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 5 }}>Your Bid (₹) *</label>
                  <input type="number" placeholder="25000" value={proposal.bidAmount}
                    onChange={(e) => setProposal({ ...proposal, bidAmount: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 5 }}>Estimated Days *</label>
                  <input type="number" placeholder="14" value={proposal.estimatedDays}
                    onChange={(e) => setProposal({ ...proposal, estimatedDays: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                </div>
                <button onClick={handleSubmitProposal} disabled={isSubmitting}
                  style={{ padding: '11px', background: 'linear-gradient(135deg, #0a2416, #16a34a)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </div>
          )}

          {/* Client info */}
          {gig.client && (
            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e4e4e7' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Posted By</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #0a2416, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{gig.client.name?.[0]}</span>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#18181b' }}>{gig.client.name}</div>
                  {gig.client.location?.city && (
                    <div style={{ fontSize: 12, color: '#71717a', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <MapPin size={11} /> {gig.client.location.city}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigDetailPage;
