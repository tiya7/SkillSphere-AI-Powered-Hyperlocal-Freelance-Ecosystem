import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Clock, ChevronDown, X, Briefcase, RefreshCw } from 'lucide-react';
import { fetchGigs, setFilters, clearFilters, selectGigs, selectGigsLoading, selectGigsFilters, selectGigsTotal, selectGigsPages } from '../store/slices/gigsSlice';
import { useAuth } from '../hooks/useAuth';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'web_development', label: 'Web Development' },
  { value: 'mobile_development', label: 'Mobile Development' },
  { value: 'ui_ux_design', label: 'UI/UX Design' },
  { value: 'graphic_design', label: 'Graphic Design' },
  { value: 'content_writing', label: 'Content Writing' },
  { value: 'digital_marketing', label: 'Digital Marketing' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'video_editing', label: 'Video Editing' },
  { value: 'photography', label: 'Photography' },
  { value: 'other', label: 'Other' },
];

const STATUS_COLORS = {
  open: { bg: '#dcfce7', color: '#166534' },
  in_progress: { bg: '#dbeafe', color: '#1e40af' },
  completed: { bg: '#f3f4f6', color: '#374151' },
};

const GigCard = ({ gig, onClick }) => {
  const sc = STATUS_COLORS[gig.status] || STATUS_COLORS.open;
  const daysLeft = gig.deadline
    ? Math.max(0, Math.ceil((new Date(gig.deadline) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div onClick={() => onClick(gig._id)} style={{
      background: 'white', borderRadius: 16, padding: 22,
      border: '1px solid rgba(10,36,22,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      cursor: 'pointer', transition: 'all 0.2s',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(10,36,22,0.1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: '#f0faf4', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {CATEGORIES.find((c) => c.value === gig.category)?.label || gig.category}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: sc.bg, color: sc.color }}>
          {gig.status.replace('_', ' ')}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#18181b', marginBottom: 8, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {gig.title}
      </h3>

      {/* Description */}
      <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {gig.description}
      </p>

      {/* Skills */}
      {gig.skills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {gig.skills.slice(0, 4).map((skill) => (
            <span key={skill} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#f4f4f5', color: '#52525b', fontWeight: 500 }}>
              {skill}
            </span>
          ))}
          {gig.skills.length > 4 && (
            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#f4f4f5', color: '#52525b' }}>+{gig.skills.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f4f4f5' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0a2416' }}>
            ₹{gig.budgetMin?.toLocaleString()} – ₹{gig.budgetMax?.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 2 }}>{gig.budgetType === 'hourly' ? 'per hour' : 'fixed price'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {daysLeft !== null && (
            <div style={{ fontSize: 12, color: daysLeft < 3 ? '#ef4444' : '#71717a', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
              <Clock size={12} /> {daysLeft}d left
            </div>
          )}
          <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>{gig.proposalCount || 0} proposals</div>
        </div>
      </div>

      {/* Client info */}
      {gig.client && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #f4f4f5' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #0a2416, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 10, color: 'white', fontWeight: 700 }}>{gig.client.name?.[0]}</span>
          </div>
          <span style={{ fontSize: 12, color: '#71717a' }}>{gig.client.name}</span>
          {gig.location?.city && (
            <span style={{ fontSize: 12, color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: 3, marginLeft: 'auto' }}>
              <MapPin size={11} /> {gig.location.city}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const GigMarketplacePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isClient } = useAuth();
  const gigs = useSelector(selectGigs);
  const isLoading = useSelector(selectGigsLoading);
  const filters = useSelector(selectGigsFilters);
  const total = useSelector(selectGigsTotal);
  const pages = useSelector(selectGigsPages);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    dispatch(fetchGigs({ ...filters, page }));
  }, [filters, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: localSearch }));
    setPage(1);
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    setPage(1);
  };

  const handleClear = () => {
    dispatch(clearFilters());
    setLocalSearch('');
    setPage(1);
  };

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>{isClient ? 'My Gig Marketplace' : 'Browse Gigs'}</h1>
          <p style={{ color: '#71717a', fontSize: 14 }}>{total} gigs available</p>
        </div>
        {isClient && (
          <button onClick={() => navigate('/gigs/create')}
            style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0a2416, #16a34a)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Briefcase size={16} /> Post a Gig
          </button>
        )}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
          <input
            placeholder="Search gigs by title, skills..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            style={{ width: '100%', padding: '11px 14px 11px 42px', border: '1.5px solid #e4e4e7', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
            onFocus={(e) => e.target.style.borderColor = '#16a34a'}
            onBlur={(e) => e.target.style.borderColor = '#e4e4e7'}
          />
        </div>
        <button type="submit" style={{ padding: '11px 20px', background: '#0a2416', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Search
        </button>
        <button type="button" onClick={() => setShowFilters(!showFilters)}
          style={{ padding: '11px 16px', background: showFilters ? '#f0faf4' : 'white', border: `1.5px solid ${showFilters ? '#16a34a' : '#e4e4e7'}`, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: showFilters ? '#16a34a' : '#3f3f46', fontWeight: 600 }}>
          <Filter size={15} /> Filters
        </button>
      </form>

      {/* Filters panel */}
      {showFilters && (
        <div style={{ background: 'white', border: '1px solid #e4e4e7', borderRadius: 12, padding: 20, marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {/* Category */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 6 }}>Category</label>
            <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: 'white' }}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Budget Min */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 6 }}>Min Budget (₹)</label>
            <input type="number" placeholder="0" value={filters.budgetMin}
              onChange={(e) => handleFilterChange('budgetMin', e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
          </div>

          {/* Budget Max */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 6 }}>Max Budget (₹)</label>
            <input type="number" placeholder="100000" value={filters.budgetMax}
              onChange={(e) => handleFilterChange('budgetMax', e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
          </div>

          {/* Location */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 6 }}>Location</label>
            <input placeholder="City name..." value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
          </div>

          {/* Sort */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 6 }}>Sort By</label>
            <select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: 'white' }}>
              <option value="newest">Newest First</option>
              <option value="budget_high">Highest Budget</option>
              <option value="budget_low">Lowest Budget</option>
              <option value="proposals">Fewest Proposals</option>
            </select>
          </div>

          {/* Clear */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={handleClear}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: 'white', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#71717a' }}>
              <X size={14} /> Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {CATEGORIES.map((cat) => (
          <button key={cat.value}
            onClick={() => handleFilterChange('category', cat.value)}
            style={{
              padding: '7px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
              background: filters.category === cat.value ? '#0a2416' : '#f4f4f5',
              color: filters.category === cat.value ? 'white' : '#52525b',
            }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Gigs grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, border: '3px solid rgba(22,163,74,0.2)', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: '#71717a', fontSize: 14 }}>Loading gigs...</p>
          </div>
        </div>
      ) : gigs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ fontSize: 18, marginBottom: 8, color: '#18181b' }}>No gigs found</h3>
          <p style={{ color: '#71717a', fontSize: 14, marginBottom: 20 }}>Try changing your filters or search terms</p>
          <button onClick={handleClear}
            style={{ padding: '10px 20px', background: '#0a2416', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={14} /> Clear Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {gigs.map((gig) => <GigCard key={gig._id} gig={gig} onClick={(id) => navigate(`/gigs/${id}`)} />)}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
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

export default GigMarketplacePage;
