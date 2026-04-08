import React, { useEffect, useState } from 'react';
import { Star, ThumbsUp, Flag } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const StarRating = ({ rating, size = 16, interactive = false, onRate }) => (
  <div style={{ display: 'flex', gap: 3 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} size={size} onClick={() => interactive && onRate && onRate(s)}
        fill={s <= Math.round(rating) ? '#f59e0b' : 'none'} color={s <= Math.round(rating) ? '#f59e0b' : '#d4d4d8'}
        style={{ cursor: interactive ? 'pointer' : 'default' }} />
    ))}
  </div>
);

const ReviewCard = ({ review, onFlag }) => (
  <div style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid #e4e4e7', marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #0a2416, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {review.reviewer?.avatar ? <img src={review.reviewer.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{review.reviewer?.name?.[0]}</span>}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#18181b' }}>{review.reviewer?.name}</div>
          <div style={{ fontSize: 12, color: '#71717a' }}>{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <StarRating rating={review.rating} size={14} />
        <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 2 }}>{review.gig?.title}</div>
      </div>
    </div>
    {review.comment && <p style={{ fontSize: 14, color: '#52525b', lineHeight: 1.7, marginBottom: 12 }}>{review.comment}</p>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
      {Object.entries(review.categories || {}).map(([key, val]) => (
        <div key={key} style={{ textAlign: 'center', padding: '8px 4px', background: '#fafafa', borderRadius: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0a2416' }}>{val}/5</div>
          <div style={{ fontSize: 10, color: '#71717a', textTransform: 'capitalize' }}>{key}</div>
        </div>
      ))}
    </div>
    <button onClick={() => onFlag(review._id)} style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
      <Flag size={12} /> Report
    </button>
  </div>
);

const ReviewsPage = () => {
  const { user } = useAuth();
  const [given, setGiven] = useState([]);
  const [received, setReceived] = useState([]);
  const [tab, setTab] = useState('received');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reviews/me').then(res => {
      setGiven(res.data.given);
      setReceived(res.data.received);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleFlag = async (id) => {
    const reason = window.prompt('Why are you reporting this review?');
    if (!reason) return;
    await api.put(`/reviews/${id}/flag`, { reason });
    toast.success('Review reported. Admin will review it.');
  };

  const avgRating = received.length > 0 ? (received.reduce((s, r) => s + r.rating, 0) / received.length).toFixed(1) : 0;

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Reviews & Ratings</h1>
        <p style={{ color: '#71717a', fontSize: 14 }}>Your reputation on SkillSphere</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Average Rating', value: avgRating, sub: `${received.length} reviews` },
          { label: 'Reviews Received', value: received.length, sub: 'from clients/freelancers' },
          { label: 'Reviews Given', value: given.length, sub: 'you reviewed others' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid #e4e4e7', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0a2416', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
              {s.label === 'Average Rating' && received.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Star size={20} fill="#f59e0b" color="#f59e0b" />
                  {s.value}
                </div>
              ) : s.value}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#52525b', marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: '#a1a1aa' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'white', padding: 4, borderRadius: 12, border: '1px solid #e4e4e7', width: 'fit-content' }}>
        {[['received', 'Reviews Received'], ['given', 'Reviews Given']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.15s', background: tab === key ? '#0a2416' : 'transparent', color: tab === key ? 'white' : '#52525b', fontFamily: 'inherit' }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ width: 28, height: 28, border: '3px solid rgba(22,163,74,0.2)', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
        </div>
      ) : (tab === 'received' ? received : given).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #e4e4e7' }}>
          <Star size={40} color="#e4e4e7" style={{ marginBottom: 14 }} />
          <h3 style={{ fontSize: 16, marginBottom: 8 }}>No reviews {tab === 'received' ? 'received' : 'given'} yet</h3>
          <p style={{ color: '#71717a', fontSize: 14 }}>Complete projects to {tab === 'received' ? 'earn reviews' : 'leave reviews'}</p>
        </div>
      ) : (
        <div>{(tab === 'received' ? received : given).map(r => <ReviewCard key={r._id} review={r} onFlag={handleFlag} />)}</div>
      )}
    </div>
  );
};

export default ReviewsPage;
