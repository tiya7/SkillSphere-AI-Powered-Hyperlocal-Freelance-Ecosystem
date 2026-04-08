import React, { useEffect, useState } from 'react';
import { AlertTriangle, Plus, X } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  open:                  { bg: '#fee2e2', color: '#991b1b', label: 'Open' },
  under_review:          { bg: '#fef3c7', color: '#92400e', label: 'Under Review' },
  resolved_client:       { bg: '#dcfce7', color: '#166534', label: 'Resolved (Client)' },
  resolved_freelancer:   { bg: '#dcfce7', color: '#166534', label: 'Resolved (Freelancer)' },
  closed:                { bg: '#f3f4f6', color: '#374151', label: 'Closed' },
};

const DisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ gigId: '', paymentId: '', againstId: '', reason: '' });

  useEffect(() => {
    Promise.all([
      api.get('/disputes/my'),
      api.get('/payments/my'),
    ]).then(([d, p]) => {
      setDisputes(d.data.disputes);
      setPayments(p.data.payments.filter(pay => pay.status === 'in_escrow' || pay.status === 'released'));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!form.paymentId || !form.reason) { toast.error('Please fill all required fields'); return; }
    const payment = payments.find(p => p._id === form.paymentId);
    if (!payment) return;
    try {
      await api.post('/disputes', {
        gigId: payment.gig?._id || payment.gig,
        paymentId: form.paymentId,
        againstId: form.againstId || (payment.client?._id === form.myId ? payment.freelancer?._id : payment.client?._id),
        reason: form.reason,
      });
      toast.success('Dispute opened. Admin will review within 48 hours.');
      setShowForm(false);
      const res = await api.get('/disputes/my');
      setDisputes(res.data.disputes);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to open dispute'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(22,163,74,0.2)', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  return (
    <div className="page-enter" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>Disputes</h1>
          <p style={{ color: '#71717a', fontSize: 14 }}>Raise or view payment disputes</p>
        </div>
        {payments.length > 0 && (
          <button onClick={() => setShowForm(!showForm)}
            style={{ padding: '10px 18px', background: showForm ? '#fee2e2' : 'linear-gradient(135deg, #0a2416, #16a34a)', color: showForm ? '#ef4444' : 'white', border: showForm ? '1px solid #ef4444' : 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
            {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Open Dispute</>}
          </button>
        )}
      </div>

      {/* Open dispute form */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #fee2e2', marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#991b1b' }}>⚠️ Open a Dispute</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 5 }}>Select Payment *</label>
              <select value={form.paymentId} onChange={e => setForm({ ...form, paymentId: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e4e4e7', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', background: 'white' }}>
                <option value="">-- Select a payment --</option>
                {payments.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.gig?.title} — ₹{p.amount?.toLocaleString()} ({p.status})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 5 }}>Reason for Dispute *</label>
              <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                placeholder="Describe the issue in detail. What went wrong? What is your expected resolution?"
                rows={5} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e4e4e7', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 }} />
            </div>
            <div style={{ padding: 14, background: '#fef3c7', borderRadius: 10, fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
              ⚠️ <strong>Before opening a dispute</strong>, please try to resolve the issue directly with the other party through chat. Disputes are reviewed by admins and may take 2-5 business days.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSubmit}
                style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }}>
                Open Dispute
              </button>
              <button onClick={() => setShowForm(false)}
                style={{ padding: '10px 20px', background: 'white', color: '#52525b', border: '1px solid #e4e4e7', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disputes list */}
      {disputes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #e4e4e7' }}>
          <AlertTriangle size={40} color="#e4e4e7" style={{ marginBottom: 14 }} />
          <h3 style={{ fontSize: 16, marginBottom: 8 }}>No disputes</h3>
          <p style={{ color: '#71717a', fontSize: 14 }}>You have no active or past disputes</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {disputes.map(d => {
            const sc = STATUS_CONFIG[d.status] || STATUS_CONFIG.open;
            return (
              <div key={d._id} style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid #e4e4e7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: sc.bg, color: sc.color, display: 'inline-block', marginBottom: 8 }}>{sc.label}</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#18181b', marginBottom: 4 }}>{d.gig?.title}</h3>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <span style={{ fontSize: 13, color: '#71717a' }}>Raised by: <strong>{d.raisedBy?.name}</strong></span>
                      <span style={{ fontSize: 13, color: '#71717a' }}>Against: <strong>{d.against?.name}</strong></span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#a1a1aa' }}>{new Date(d.createdAt).toLocaleDateString('en-IN')}</div>
                    {d.payment?.amount && <div style={{ fontSize: 14, fontWeight: 700, color: '#0a2416', marginTop: 4 }}>₹{d.payment.amount.toLocaleString()}</div>}
                  </div>
                </div>
                <p style={{ fontSize: 14, color: '#52525b', lineHeight: 1.6, marginBottom: d.resolution ? 12 : 0 }}>{d.reason}</p>
                {d.resolution && (
                  <div style={{ padding: 12, background: '#f0faf4', borderRadius: 10, marginTop: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>✅ Resolution</div>
                    <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.5 }}>{d.resolution}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DisputesPage;
