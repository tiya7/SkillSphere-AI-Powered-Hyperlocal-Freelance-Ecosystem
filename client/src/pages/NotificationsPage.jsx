import React, { useEffect, useState } from 'react';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  new_proposal:       { icon: '📝', color: '#dbeafe', label: 'New Proposal' },
  proposal_accepted:  { icon: '✅', color: '#dcfce7', label: 'Proposal Accepted' },
  proposal_rejected:  { icon: '❌', color: '#fee2e2', label: 'Proposal Rejected' },
  new_message:        { icon: '💬', color: '#f3e8ff', label: 'New Message' },
  payment_received:   { icon: '💰', color: '#fef3c7', label: 'Payment' },
  payment_released:   { icon: '🎉', color: '#dcfce7', label: 'Payment Released' },
  review_added:       { icon: '⭐', color: '#fef3c7', label: 'New Review' },
  gig_completed:      { icon: '🏆', color: '#dcfce7', label: 'Gig Completed' },
  dispute_opened:     { icon: '⚠️', color: '#fee2e2', label: 'Dispute Opened' },
  dispute_resolved:   { icon: '✅', color: '#dcfce7', label: 'Dispute Resolved' },
  milestone_approved: { icon: '🎯', color: '#dbeafe', label: 'Milestone Approved' },
  system:             { icon: '🔔', color: '#f4f4f5', label: 'System' },
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const loadNotifications = async (p = 1) => {
    try {
      const res = await api.get(`/notifications?page=${p}&limit=20`);
      if (p === 1) setNotifications(res.data.notifications);
      else setNotifications(prev => [...prev, ...res.data.notifications]);
      setUnreadCount(res.data.unreadCount);
      setPages(res.data.pages);
      setLoading(false);
    } catch { setLoading(false); }
  };

  useEffect(() => { loadNotifications(); }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  const deleteNotif = async (id) => {
    await api.delete(`/notifications/${id}`);
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const handleClick = async (notif) => {
    if (!notif.isRead) await markRead(notif._id);
    if (notif.link) navigate(notif.link);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="page-enter" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>Notifications</h1>
          <p style={{ color: '#71717a', fontSize: 14 }}>{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            style={{ padding: '8px 16px', background: '#f0faf4', border: '1px solid #16a34a', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#16a34a', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ width: 28, height: 28, border: '3px solid rgba(22,163,74,0.2)', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #e4e4e7' }}>
          <Bell size={40} color="#e4e4e7" style={{ marginBottom: 14 }} />
          <h3 style={{ fontSize: 16, marginBottom: 8 }}>No notifications yet</h3>
          <p style={{ color: '#71717a', fontSize: 14 }}>We'll notify you when something happens</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map(notif => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
            return (
              <div key={notif._id}
                style={{ background: notif.isRead ? 'white' : '#f0faf4', borderRadius: 14, padding: '14px 16px', border: `1px solid ${notif.isRead ? '#e4e4e7' : '#bbf7d0'}`, cursor: notif.link ? 'pointer' : 'default', display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'all 0.15s' }}
                onClick={() => handleClick(notif)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {config.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: notif.isRead ? 500 : 700, color: '#18181b' }}>{notif.title}</span>
                    <span style={{ fontSize: 12, color: '#a1a1aa', flexShrink: 0, marginLeft: 12 }}>{formatTime(notif.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#52525b', lineHeight: 1.5 }}>{notif.message}</p>
                  {!notif.isRead && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }} />
                  )}
                </div>
                <button onClick={e => { e.stopPropagation(); deleteNotif(notif._id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa', padding: 4, borderRadius: 6, display: 'flex', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = '#a1a1aa'}>
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}

          {page < pages && (
            <button onClick={() => { const next = page + 1; setPage(next); loadNotifications(next); }}
              style={{ padding: '10px', background: 'white', border: '1px solid #e4e4e7', borderRadius: 10, cursor: 'pointer', fontSize: 14, color: '#16a34a', fontWeight: 600, fontFamily: 'inherit', marginTop: 8 }}>
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
