import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, Filter, X, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const SKILLS = ['React', 'Node.js', 'Python', 'Flutter', 'Figma', 'UI/UX', 'WordPress', 'MongoDB', 'AWS', 'SEO', 'Photoshop', 'Video Editing'];

const StarRating = ({ rating }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} size={12} fill={s <= Math.round(rating) ? '#f59e0b' : 'none'} color={s <= Math.round(rating) ? '#f59e0b' : '#d4d4d8'} />
    ))}
    <span style={{ fontSize: 12, color: '#71717a', marginLeft: 4 }}>{rating > 0 ? rating.toFixed(1) : 'New'}</span>
  </div>
);

const FreelancerCard = ({ freelancer, onViewProfile, onMessage, isMsgLoading }) => {
  const u = freelancer.user;
  const initials = u?.name ? u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: 22,
      border: '1px solid #e4e4e7', transition: 'all 0.2s', cursor: 'default',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #0a2416, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
          {u?.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>{initials}</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#18181b', marginBottom: 2 }}>{u?.name}</div>
          <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, marginBottom: 4 }}>{freelancer.title}</div>
          <StarRating rating={freelancer.averageRating || 0} />
        </div>
        {freelancer.isVerified && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: '#dbeafe', color: '#1e40af', height: 'fit-content' }}>✓ Verified</span>
        )}
      </div>

      {/* Bio */}
      {u?.bio && (
        <p style={{ fontSize: 13, color: '#52525b', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {u.bio}
        </p>
      )}

      {/* Skills */}
      {freelancer.skills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {freelancer.skills.slice(0, 5).map(s => (
            <span key={s.name} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#f0faf4', color: '#166534', border: '1px solid #bbf7d0', fontWeight: 500 }}>
              {s.name}
            </span>
          ))}
          {freelancer.skills.length > 5 && <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#f4f4f5', color: '#71717a' }}>+{freelancer.skills.length - 5}</span>}
        </div>
      )}

      {/* Footer */}
      <div style={{ paddingTop: 12, borderTop: '1px solid #f4f4f5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0a2416' }}>
              {freelancer.hourlyRate > 0 ? `₹${freelancer.hourlyRate?.toLocaleString()}/hr` : 'Rate negotiable'}
            </div>
            <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 1 }}>{freelancer.completedProjects || 0} projects done</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {u?.location?.city && (
              <div style={{ fontSize: 12, color: '#71717a', display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                <MapPin size={11} /> {u.location.city}
              </div>
            )}
            <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 2 }}>
              Rep: {freelancer.reputationScore || 0}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onViewProfile}
            style={{ flex: 1, padding: '9px 14px', background: 'linear-gradient(135deg, #0a2416, #16a34a)', color: 'white', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            View Profile
          </button>
          {/* ── NEW: Message button ── */}
          <button
            onClick={onMessage}
            disabled={isMsgLoading}
            title="Send a message"
            style={{ padding: '9px 14px', background: '#f0faf4', color: '#16a34a', border: '1.5px solid #16a34a', borderRadius: 9, cursor: isMsgLoading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', opacity: isMsgLoading ? 0.6 : 1, transition: 'all 0.15s' }}
            onMouseEnter={e => { if (!isMsgLoading) e.currentTarget.style.background = '#dcfce7'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f0faf4'; }}>
            <MessageSquare size={15} />
            {isMsgLoading ? '...' : 'Message'}
          </button>
        </div>
      </div>
    </div>
  );
};

const FreelancerSearchPage = () => {
  const navigate = useNavigate();
  const { isClient } = useAuth();
  const [freelancers, setFreelancers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ q: '', skills: [], city: '', minRate: '', maxRate: '', rating: '', sort: 'reputation' });
  const [localQ, setLocalQ] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [msgLoadingId, setMsgLoadingId] = useState(null);

  const fetchFreelancers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (filters.q) params.append('q', filters.q);
      if (selectedSkills.length) params.append('skills', selectedSkills.join(','));
      if (filters.city) params.append('city', filters.city);
      if (filters.minRate) params.append('minRate', filters.minRate);
      if (filters.maxRate) params.append('maxRate', filters.maxRate);
      if (filters.rating) params.append('rating', filters.rating);
      if (filters.sort) params.append('sort', filters.sort);
      const res = await api.get(`/search/freelancers?${params}`);
      setFreelancers(res.data.freelancers);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchFreelancers(); }, [filters, selectedSkills, page]);

  const handleSearch = e => { e.preventDefault(); setFilters(f => ({ ...f, q: localQ })); setPage(1); };
  const toggleSkill = s => {
    setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    setPage(1);
  };
  const clearAll = () => { setFilters({ q: '', skills: [], city: '', minRate: '', maxRate: '', rating: '', sort: 'reputation' }); setLocalQ(''); setSelectedSkills([]); setPage(1); };

  const handleMessage = async (freelancerId) => {
    if (!freelancerId) return;
    setMsgLoadingId(freelancerId);
    try {
      const res = await api.post('/chat/conversation', { recipientId: freelancerId });
      const conv = res.data.conversation;
      navigate('/messages', { state: { openConversationId: conv._id, conversation: conv } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not open chat');
    } finally {
      setMsgLoadingId(null);
    }
  };

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Find Freelancers</h1>
        <p style={{ color: '#71717a', fontSize: 14 }}>{total} freelancers available</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
          <input placeholder="Search by name, skill, or expertise..."
            value={localQ} onChange={e => setLocalQ(e.target.value)}
            style={{ width: '100%', padding: '11px 14px 11px 42px', border: '1.5px solid #e4e4e7', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
            onFocus={e => e.target.style.borderColor = '#16a34a'}
            onBlur={e => e.target.style.borderColor = '#e4e4e7'} />
        </div>
        <button type="submit" style={{ padding: '11px 20px', background: '#0a2416', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Search</button>
        <button type="button" onClick={() => setShowFilters(!showFilters)}
          style={{ padding: '11px 16px', background: showFilters ? '#f0faf4' : 'white', border: `1.5px solid ${showFilters ? '#16a34a' : '#e4e4e7'}`, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: showFilters ? '#16a34a' : '#3f3f46', fontWeight: 600, fontFamily: 'inherit' }}>
          <Filter size={15} /> Filters
        </button>
      </form>

      {/* Filter panel */}
      {showFilters && (
        <div style={{ background: 'white', border: '1px solid #e4e4e7', borderRadius: 12, padding: 20, marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 5 }}>City</label>
            <input placeholder="Pune..." value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
              style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 5 }}>Min Rate (₹/hr)</label>
            <input type="number" placeholder="500" value={filters.minRate} onChange={e => setFilters(f => ({ ...f, minRate: e.target.value }))}
              style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 5 }}>Max Rate (₹/hr)</label>
            <input type="number" placeholder="5000" value={filters.maxRate} onChange={e => setFilters(f => ({ ...f, maxRate: e.target.value }))}
              style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 5 }}>Min Rating</label>
            <select value={filters.rating} onChange={e => setFilters(f => ({ ...f, rating: e.target.value }))}
              style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: 'white' }}>
              <option value="">Any</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 5 }}>Sort By</label>
            <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
              style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: 'white' }}>
              <option value="reputation">Reputation</option>
              <option value="rating">Highest Rating</option>
              <option value="rate_low">Lowest Rate</option>
              <option value="rate_high">Highest Rate</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={clearAll}
              style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: 'white', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#71717a' }}>
              <X size={13} /> Clear All
            </button>
          </div>
        </div>
      )}

      {/* Skill pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4, flexWrap: 'wrap' }}>
        {SKILLS.map(s => (
          <button key={s} onClick={() => toggleSkill(s)}
            style={{ padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', background: selectedSkills.includes(s) ? '#0a2416' : '#f4f4f5', color: selectedSkills.includes(s) ? 'white' : '#52525b' }}>
            {s}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, border: '3px solid rgba(22,163,74,0.2)', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: '#71717a', fontSize: 14 }}>Finding freelancers...</p>
          </div>
        </div>
      ) : freelancers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #e4e4e7' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>No freelancers found</h3>
          <p style={{ color: '#71717a', fontSize: 14, marginBottom: 16 }}>Try different skills or location filters</p>
          <button onClick={clearAll} style={{ padding: '10px 20px', background: '#0a2416', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Clear Filters</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {freelancers.map(f => (
            <FreelancerCard
              key={f._id}
              freelancer={f}
              onViewProfile={() => navigate(`/freelancers/${f._id}`)}
              onMessage={() => handleMessage(f.user?._id)}
              isMsgLoading={msgLoadingId === f.user?._id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, background: page === p ? '#0a2416' : '#f4f4f5', color: page === p ? 'white' : '#52525b', transition: 'all 0.15s' }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FreelancerSearchPage;
