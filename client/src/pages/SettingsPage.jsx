import React, { useState } from 'react';
import { Shield, Bell, Lock, User, Eye, EyeOff, Save } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { updateUser } from '../store/slices/authSlice';

const SettingsPage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [tab, setTab] = useState('account');
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notifications, setNotifications] = useState({ email_proposals: true, email_messages: true, email_payments: true, email_reviews: true });
  const [twoFA, setTwoFA] = useState({ qrCode: null, secret: null, token: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setIsSaving(true);
    try {
      await api.put('/profile/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    setIsSaving(false);
  };

  const setup2FA = async () => {
    try {
      const res = await api.post('/auth/2fa/setup');
      setTwoFA({ qrCode: res.data.qrCode, secret: res.data.secret, token: '' });
    } catch (err) { toast.error('Failed to setup 2FA'); }
  };

  const enable2FA = async () => {
    try {
      await api.post('/auth/2fa/enable', { token: twoFA.token });
      dispatch(updateUser({ twoFactorEnabled: true }));
      toast.success('2FA enabled successfully!');
      setTwoFA({ qrCode: null, secret: null, token: '' });
    } catch (err) { toast.error('Invalid code. Try again.'); }
  };

  const inpStyle = { width: '100%', padding: '11px 14px 11px 42px', border: '1.5px solid #e4e4e7', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', color: '#18181b' };

  return (
    <div className="page-enter" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: '#71717a', fontSize: 14 }}>Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28, background: 'white', padding: 4, borderRadius: 12, border: '1px solid #e4e4e7', width: 'fit-content' }}>
        {[['account', User, 'Account'], ['security', Lock, 'Security'], ['notifications', Bell, 'Notifications']].map(([key, Icon, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: tab === key ? '#0a2416' : 'transparent', color: tab === key ? 'white' : '#52525b', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ACCOUNT TAB */}
      {tab === 'account' && (
        <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #e4e4e7' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Account Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 16, background: '#f0faf4', borderRadius: 12, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 4 }}>Email Address</div>
              <div style={{ fontSize: 15, color: '#18181b' }}>{user?.email}</div>
              <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>{user?.isEmailVerified ? '✅ Verified' : '⚠️ Not verified'}</div>
            </div>
            <div style={{ padding: 16, background: '#fafafa', borderRadius: 12, border: '1px solid #e4e4e7' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#52525b', marginBottom: 4 }}>Account Role</div>
              <div style={{ fontSize: 15, color: '#18181b', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
            <div style={{ padding: 16, background: '#fafafa', borderRadius: 12, border: '1px solid #e4e4e7' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#52525b', marginBottom: 4 }}>Member Since</div>
              <div style={{ fontSize: 15, color: '#18181b' }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</div>
            </div>
            <div style={{ padding: 16, background: '#fafafa', borderRadius: 12, border: '1px solid #e4e4e7' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#52525b', marginBottom: 4 }}>Auth Provider</div>
              <div style={{ fontSize: 15, color: '#18181b', textTransform: 'capitalize' }}>{user?.authProvider || 'Email'}</div>
            </div>
          </div>
          <div style={{ marginTop: 24, padding: 16, background: '#fee2e2', borderRadius: 12, border: '1px solid #fca5a5' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#991b1b', marginBottom: 6 }}>⚠️ Danger Zone</div>
            <p style={{ fontSize: 13, color: '#991b1b', marginBottom: 12 }}>Deleting your account is permanent and cannot be undone.</p>
            <button style={{ padding: '8px 16px', background: 'white', border: '1.5px solid #ef4444', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#ef4444', fontFamily: 'inherit' }}
              onClick={() => toast.error('Contact support to delete your account')}>
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* SECURITY TAB */}
      {tab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Change password */}
          <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #e4e4e7' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={18} color="#0a2416" /> Change Password
            </h3>
            {user?.authProvider === 'google' ? (
              <div style={{ padding: 14, background: '#fef3c7', borderRadius: 10, fontSize: 13, color: '#92400e' }}>
                You signed in with Google. Password change is not available for Google accounts.
              </div>
            ) : (
              <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
                  { key: 'newPassword', label: 'New Password', placeholder: 'Min 8 characters' },
                  { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 5 }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                      <input type={showPass[key] ? 'text' : 'password'} placeholder={placeholder}
                        value={passwords[key]} onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                        required style={inpStyle}
                        onFocus={e => e.target.style.borderColor = '#16a34a'} onBlur={e => e.target.style.borderColor = '#e4e4e7'} />
                      <button type="button" onClick={() => setShowPass({ ...showPass, [key]: !showPass[key] })}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa' }}>
                        {showPass[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
                <button type="submit" disabled={isSaving}
                  style={{ padding: '11px 20px', background: 'linear-gradient(135deg, #0a2416, #16a34a)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, width: 'fit-content' }}>
                  <Save size={15} /> {isSaving ? 'Saving...' : 'Change Password'}
                </button>
              </form>
            )}
          </div>

          {/* 2FA */}
          <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #e4e4e7' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} color="#0a2416" /> Two-Factor Authentication
            </h3>
            <p style={{ fontSize: 14, color: '#71717a', lineHeight: 1.6, marginBottom: 20 }}>
              Add an extra layer of security to your account using an authenticator app like Google Authenticator.
            </p>
            {user?.twoFactorEnabled ? (
              <div style={{ padding: 14, background: '#f0faf4', borderRadius: 10, border: '1px solid #bbf7d0', fontSize: 14, color: '#166534', fontWeight: 600 }}>
                ✅ Two-Factor Authentication is enabled
              </div>
            ) : twoFA.qrCode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ padding: 14, background: '#fafafa', borderRadius: 10, border: '1px solid #e4e4e7' }}>
                  <p style={{ fontSize: 13, color: '#52525b', marginBottom: 12 }}>1. Scan this QR code with your authenticator app</p>
                  <img src={twoFA.qrCode} alt="QR Code" style={{ width: 160, height: 160, borderRadius: 10 }} />
                  <p style={{ fontSize: 12, color: '#a1a1aa', marginTop: 8 }}>Or enter manually: <code style={{ background: '#f4f4f5', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{twoFA.secret}</code></p>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 5 }}>2. Enter the 6-digit code to confirm</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input placeholder="000000" maxLength={6} value={twoFA.token} onChange={e => setTwoFA({ ...twoFA, token: e.target.value })}
                      style={{ padding: '10px 14px', border: '1.5px solid #e4e4e7', borderRadius: 10, fontSize: 18, letterSpacing: 6, outline: 'none', width: 160, textAlign: 'center', fontFamily: 'inherit' }} />
                    <button onClick={enable2FA} disabled={twoFA.token.length !== 6}
                      style={{ padding: '10px 20px', background: twoFA.token.length === 6 ? 'linear-gradient(135deg, #0a2416, #16a34a)' : '#f4f4f5', color: twoFA.token.length === 6 ? 'white' : '#a1a1aa', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }}>
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={setup2FA}
                style={{ padding: '10px 20px', background: '#0a2416', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={15} /> Set Up 2FA
              </button>
            )}
          </div>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {tab === 'notifications' && (
        <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #e4e4e7' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Email Notification Preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { key: 'email_proposals', label: 'New Proposals', desc: 'When someone submits a proposal on your gig' },
              { key: 'email_messages', label: 'New Messages', desc: 'When you receive a new chat message' },
              { key: 'email_payments', label: 'Payment Updates', desc: 'When payments are made or released' },
              { key: 'email_reviews', label: 'New Reviews', desc: 'When someone leaves you a review' },
            ].map(({ key, label, desc }) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 12, border: '1px solid #e4e4e7', background: '#fafafa' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#18181b' }}>{label}</div>
                  <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>{desc}</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
                  <input type="checkbox" checked={notifications[key]} onChange={e => setNotifications({ ...notifications, [key]: e.target.checked })} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: notifications[key] ? '#16a34a' : '#d4d4d8', borderRadius: 12, transition: 'all 0.2s' }}>
                    <span style={{ position: 'absolute', height: 18, width: 18, left: notifications[key] ? 22 : 3, bottom: 3, background: 'white', borderRadius: '50%', transition: 'all 0.2s' }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
          <button onClick={() => toast.success('Preferences saved!')} style={{ marginTop: 20, padding: '10px 20px', background: 'linear-gradient(135deg, #0a2416, #16a34a)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Save size={15} /> Save Preferences
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
