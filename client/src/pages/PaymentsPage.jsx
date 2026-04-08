import React, { useEffect, useState } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending: { icon: Clock, color: '#92400e', bg: '#fef3c7', label: 'Pending Payment' },
  in_escrow: { icon: ShieldCheck, color: '#1e40af', bg: '#dbeafe', label: 'In Escrow' },
  released: { icon: CheckCircle, color: '#166534', bg: '#dcfce7', label: 'Released' },
  refunded: { icon: RefreshCw, color: '#374151', bg: '#f3f4f6', label: 'Refunded' },
  disputed: { icon: AlertCircle, color: '#991b1b', bg: '#fee2e2', label: 'Disputed' },
  failed: { icon: AlertCircle, color: '#dc2626', bg: '#fee2e2', label: 'Failed' },
};

// Dynamically load Razorpay checkout script
const loadRazorpayScript = () =>
  new Promise(resolve => {
    if (document.getElementById('razorpay-script')) { resolve(true); return; }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PaymentsPage = () => {
  const { user, isClient, isFreelancer } = useAuth();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  const loadPayments = async () => {
    try {
      const res = await api.get('/payments/my');
      setPayments(res.data.payments);
      setStats(res.data.stats);
      setLoading(false);
    } catch { setLoading(false); }
  };

  useEffect(() => { loadPayments(); }, []);

  // Open Razorpay checkout for a pending payment
  const handlePayNow = async (payment) => {
    setPayingId(payment._id);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error('Could not load payment gateway. Check your connection.'); return; }

      // If the payment already has a Razorpay order, use it; else re-initiate
      let orderId = payment.razorpayOrderId;
      let currentPaymentId = payment._id;

      if (!orderId) {
        // Re-create order
        const res = await api.post('/payments/initiate', {
          gigId: payment.gig?._id,
          proposalId: payment.proposal,
          amount: payment.amount,
          type: payment.type,
          milestoneIndex: payment.milestoneIndex,
        });
        orderId = res.data.razorpayOrder.id;
        currentPaymentId = res.data.payment._id;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: Math.round(payment.amount * 100),
        currency: 'INR',
        name: 'SkillSphere',
        description: `Payment for: ${payment.gig?.title || 'Project'}`,
        image: '/logo192.png',
        order_id: orderId,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: currentPaymentId,
            });
            toast.success('Payment successful! Funds are now in escrow 🔐');
            loadPayments();
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#16a34a' },
        modal: {
          ondismiss: () => { setPayingId(null); },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        toast.error(`Payment failed: ${resp.error.description}`);
        setPayingId(null);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
    } finally {
      setPayingId(null);
    }
  };

  const handleRelease = async (id) => {
    if (!window.confirm('Release payment to freelancer? This cannot be undone.')) return;
    try {
      await api.put(`/payments/${id}/release`);
      toast.success('Payment released successfully!');
      loadPayments();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to release'); }
  };

  const handleRefund = async (id) => {
    if (!window.confirm('Request refund? This will return the money to you.')) return;
    try {
      await api.put(`/payments/${id}/refund`);
      toast.success('Refund processed');
      loadPayments();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to refund'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(22,163,74,0.2)', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Payments</h1>
        <p style={{ color: '#71717a', fontSize: 14 }}>{isClient ? 'Manage your project payments' : 'Track your earnings'}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {(isClient ? [
          { label: 'Total Spent', value: `₹${(stats.total || 0).toLocaleString()}`, icon: CreditCard, color: '#0a2416' },
          { label: 'In Escrow', value: `₹${(stats.inEscrow || 0).toLocaleString()}`, icon: ShieldCheck, color: '#1e40af' },
          { label: 'Total Transactions', value: stats.count || 0, icon: ArrowUpRight, color: '#16a34a' },
        ] : [
          { label: 'Total Earned', value: `₹${(stats.released || 0).toLocaleString()}`, icon: ArrowDownLeft, color: '#0a2416' },
          { label: 'Pending Release', value: `₹${(stats.inEscrow || 0).toLocaleString()}`, icon: Clock, color: '#1e40af' },
          { label: 'Total Payments', value: stats.count || 0, icon: CreditCard, color: '#16a34a' },
        ]).map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 14, padding: 22, border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0faf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0a2416', fontFamily: 'var(--font-display)' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#71717a' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Razorpay info banner for clients with pending payments */}
      {isClient && payments.some(p => p.status === 'pending') && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertCircle size={18} color="#d97706" />
          <p style={{ fontSize: 13, color: '#92400e', margin: 0 }}>
            You have pending payments. Click <strong>"Pay Now"</strong> to fund escrow securely via Razorpay.
          </p>
        </div>
      )}

      {/* Payments list */}
      {payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #e4e4e7' }}>
          <CreditCard size={40} color="#e4e4e7" style={{ marginBottom: 14 }} />
          <h3 style={{ fontSize: 16, marginBottom: 8 }}>No payments yet</h3>
          <p style={{ color: '#71717a', fontSize: 14 }}>{isClient ? 'Accept a proposal to make your first payment' : 'Complete projects to receive payments'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {payments.map(p => {
            const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
            const Icon = sc.icon;
            return (
              <div key={p._id} style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e4e4e7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: sc.bg, color: sc.color, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Icon size={11} /> {sc.label}
                      </span>
                      <span style={{ fontSize: 11, color: '#a1a1aa' }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#18181b', marginBottom: 6 }}>{p.gig?.title}</h3>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, color: '#71717a' }}>
                        {isClient ? `To: ${p.freelancer?.name}` : `From: ${p.client?.name}`}
                      </span>
                      <span style={{ fontSize: 13, color: '#a1a1aa' }}>{typeof p.type === 'string' ? p.type.replace('_', ' ') : p.type?.label}</span>
                      {p.milestoneIndex >= 0 && <span style={{ fontSize: 13, color: '#a1a1aa' }}>Milestone {p.milestoneIndex + 1}</span>}
                      {p.razorpayPaymentId && <span style={{ fontSize: 11, color: '#a1a1aa', fontFamily: 'monospace' }}>ID: {p.razorpayPaymentId.slice(-8)}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: 16 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#0a2416' }}>₹{p.amount?.toLocaleString()}</div>
                    {isFreelancer && p.status === 'released' && (
                      <div style={{ fontSize: 12, color: '#16a34a', marginTop: 2 }}>You receive: ₹{p.freelancerAmount?.toLocaleString()}</div>
                    )}
                    {isClient && p.platformFee > 0 && (
                      <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>Fee: ₹{p.platformFee?.toLocaleString()}</div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid #f4f4f5', flexWrap: 'wrap' }}>
                  {/* Client pays pending payment via Razorpay */}
                  {isClient && p.status === 'pending' && (
                    <button
                      onClick={() => handlePayNow(p)}
                      disabled={payingId === p._id}
                      style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #0a2416, #16a34a)', color: 'white', border: 'none', borderRadius: 9, cursor: payingId === p._id ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7, opacity: payingId === p._id ? 0.7 : 1 }}>
                      <CreditCard size={14} />
                      {payingId === p._id ? 'Opening Razorpay...' : 'Pay Now via Razorpay'}
                    </button>
                  )}
                  {/* Client releases escrow */}
                  {isClient && p.status === 'in_escrow' && (
                    <>
                      <button onClick={() => handleRelease(p._id)}
                        style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #0a2416, #16a34a)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle size={14} /> Release Payment
                      </button>
                      <button onClick={() => handleRefund(p._id)}
                        style={{ padding: '8px 16px', background: 'white', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                        Request Refund
                      </button>
                    </>
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

export default PaymentsPage;
