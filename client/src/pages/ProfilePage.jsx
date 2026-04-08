import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, Plus, Trash2, Save, Shield, User, MapPin, Link2, Github, Linkedin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { updateUser } from '../store/slices/authSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SKILL_CATEGORIES = ['React', 'Node.js', 'Python', 'UI/UX Design', 'WordPress', 'React Native', 'MongoDB', 'TypeScript', 'Figma', 'AWS', 'Docker', 'Flutter'];

const ProfilePage = () => {
  const { user, isFreelancer, isClient } = useAuth();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 'intermediate' });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerFreelancer, handleSubmit: handleFreelancerSubmit, reset: resetFreelancer } = useForm();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/profile/me');
      setProfile(res.data.profile);
      setSkills(res.data.profile?.skills || []);
      reset({
        name: user?.name,
        phone: user?.phone,
        bio: user?.bio,
        'location.city': user?.location?.city,
        'location.country': user?.location?.country,
      });
      if (res.data.profile) {
        resetFreelancer({
          title: res.data.profile.title,
          hourlyRate: res.data.profile.hourlyRate,
          githubUrl: res.data.profile.githubUrl,
          linkedinUrl: res.data.profile.linkedinUrl,
          websiteUrl: res.data.profile.websiteUrl,
        });
      }
    } catch (err) {
      toast.error('Failed to load profile');
    }
  };

  const saveBasicProfile = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.put('/profile/update', data);
      dispatch(updateUser(res.data.user));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const saveFreelancerProfile = async (data) => {
    setIsLoading(true);
    try {
      await api.put('/profile/freelancer', { ...data, skills });
      toast.success('Freelancer profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await api.post('/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      dispatch(updateUser({ avatar: res.data.avatar }));
      toast.success('Avatar updated!');
    } catch {
      toast.error('Avatar upload failed');
    }
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    if (skills.find(s => s.name.toLowerCase() === newSkill.name.toLowerCase())) {
      toast.error('Skill already added');
      return;
    }
    setSkills([...skills, newSkill]);
    setNewSkill({ name: '', proficiency: 'intermediate' });
  };

  const removeSkill = (name) => setSkills(skills.filter(s => s.name !== name));

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    ...(isFreelancer ? [{ id: 'professional', label: 'Professional' }] : []),
    { id: 'security', label: 'Security & 2FA' },
  ];

  return (
    <div className="page-enter">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>My Profile</h1>
        <p className="text-muted">Manage your account information and preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
        {/* Avatar card */}
        <div>
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'var(--brand-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: '0 auto' }}>
                  {user?.avatar
                    ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: 'white', fontWeight: '700', fontSize: '36px' }}>{user?.name?.[0]}</span>
                  }
                </div>
                <label style={{ position: 'absolute', bottom: 0, right: 0, width: '30px', height: '30px', background: 'var(--brand-600)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white' }}>
                  <Camera size={14} color="white" />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                </label>
              </div>
              <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{user?.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--gray-400)', marginBottom: '12px' }}>{user?.email}</div>
              {user?.isEmailVerified
                ? <span className="badge badge-green">✓ Email Verified</span>
                : <span className="badge badge-yellow">Email Not Verified</span>
              }
            </div>
          </div>

          {/* Tab nav */}
          <div className="card">
            <div style={{ padding: '8px' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontSize: '14px', fontWeight: '500',
                    background: activeTab === tab.id ? 'var(--brand-50)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--brand-700)' : 'var(--gray-600)',
                    marginBottom: '2px', transition: 'all var(--transition)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
          </div>
          <div className="card-body">
            {/* Basic Info */}
            {activeTab === 'basic' && (
              <form onSubmit={handleSubmit(saveBasicProfile)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="label">Full Name</label>
                    <input className="input" {...register('name', { required: 'Required' })} />
                    {errors.name && <span className="error-text">{errors.name.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="label">Phone Number</label>
                    <input className="input" placeholder="+91 9XXXXXXX00" {...register('phone')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Bio</label>
                  <textarea className="input" rows={3} placeholder="Tell others about yourself..." {...register('bio')} style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="label">City</label>
                    <input className="input" placeholder="Pune" {...register('location.city')} />
                  </div>
                  <div className="form-group">
                    <label className="label">Country</label>
                    <input className="input" placeholder="India" {...register('location.country')} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ alignSelf: 'flex-start' }}>
                  <Save size={15} /> {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {/* Professional (Freelancer) */}
            {activeTab === 'professional' && isFreelancer && (
              <form onSubmit={handleFreelancerSubmit(saveFreelancerProfile)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="form-group">
                  <label className="label">Professional Title</label>
                  <input className="input" placeholder="e.g. Full Stack Developer" {...registerFreelancer('title', { required: 'Required' })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="label">Hourly Rate (₹)</label>
                    <input className="input" type="number" placeholder="500" {...registerFreelancer('hourlyRate')} />
                  </div>
                  <div className="form-group">
                    <label className="label">Milestone Rate (₹)</label>
                    <input className="input" type="number" placeholder="5000" {...registerFreelancer('milestoneRate')} />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="label" style={{ marginBottom: '10px', display: 'block' }}>Skills</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {skills.map(skill => (
                      <div key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--brand-50)', borderRadius: '100px', border: '1px solid var(--brand-200)' }}>
                        <span style={{ fontSize: '13px', color: 'var(--brand-700)', fontWeight: '500' }}>{skill.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--brand-400)' }}>· {skill.proficiency}</span>
                        <button type="button" onClick={() => removeSkill(skill.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-400)', display: 'flex', padding: '0' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      className="input" placeholder="Add skill..." style={{ flex: 1 }}
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <select className="input" style={{ width: '140px' }} value={newSkill.proficiency} onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="expert">Expert</option>
                    </select>
                    <button type="button" onClick={addSkill} className="btn btn-secondary">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Social links */}
                <div>
                  <label className="label" style={{ marginBottom: '10px', display: 'block' }}>Social Links</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ position: 'relative' }}>
                      <Github size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                      <input className="input" style={{ paddingLeft: '36px' }} placeholder="github.com/username" {...registerFreelancer('githubUrl')} />
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Linkedin size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                      <input className="input" style={{ paddingLeft: '36px' }} placeholder="linkedin.com/in/username" {...registerFreelancer('linkedinUrl')} />
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Link2 size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                      <input className="input" style={{ paddingLeft: '36px' }} placeholder="yourwebsite.com" {...registerFreelancer('websiteUrl')} />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ alignSelf: 'flex-start' }}>
                  <Save size={15} /> {isLoading ? 'Saving...' : 'Save Professional Info'}
                </button>
              </form>
            )}

            {/* Security */}
            {activeTab === 'security' && <SecurityTab user={user} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Security tab with password change + 2FA
const SecurityTab = ({ user }) => {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState('idle'); // idle | setup | confirm
  const [qrCode, setQrCode] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const dispatch = useDispatch();

  const changePassword = async (data) => {
    setIsLoading(true);
    try {
      await api.put('/profile/change-password', data);
      toast.success('Password changed!');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const setup2FA = async () => {
    try {
      const res = await api.post('/auth/2fa/setup');
      setQrCode(res.data.qrCode);
      setTwoFAStep('confirm');
    } catch { toast.error('2FA setup failed'); }
  };

  const enable2FA = async () => {
    try {
      await api.post('/auth/2fa/enable', { token: twoFACode });
      dispatch(updateUser({ twoFactorEnabled: true }));
      toast.success('2FA enabled!');
      setTwoFAStep('idle');
    } catch { toast.error('Invalid code'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Change password */}
      <div>
        <h4 style={{ fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={16} color="var(--brand-600)" /> Change Password
        </h4>
        <form onSubmit={handleSubmit(changePassword)} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '400px' }}>
          <div className="form-group">
            <label className="label">Current Password</label>
            <input type="password" className="input" {...register('currentPassword', { required: 'Required' })} />
            {errors.currentPassword && <span className="error-text">{errors.currentPassword.message}</span>}
          </div>
          <div className="form-group">
            <label className="label">New Password</label>
            <input type="password" className="input" {...register('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} />
            {errors.newPassword && <span className="error-text">{errors.newPassword.message}</span>}
          </div>
          <div className="form-group">
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" {...register('confirmPassword', { validate: v => v === watch('newPassword') || 'Passwords do not match' })} />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword.message}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={isLoading} style={{ alignSelf: 'flex-start' }}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* 2FA */}
      <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '24px' }}>
        <h4 style={{ fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={16} color="var(--brand-600)" /> Two-Factor Authentication
        </h4>
        <p className="text-muted" style={{ fontSize: '14px', marginBottom: '16px' }}>
          {user?.twoFactorEnabled ? '✅ 2FA is currently enabled on your account.' : 'Add an extra layer of security to your account.'}
        </p>
        {twoFAStep === 'idle' && !user?.twoFactorEnabled && (
          <button onClick={setup2FA} className="btn btn-secondary btn-sm">Enable 2FA</button>
        )}
        {twoFAStep === 'confirm' && (
          <div style={{ maxWidth: '300px' }}>
            <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '12px' }}>Scan this QR code with Google Authenticator or Authy:</p>
            <img src={qrCode} alt="QR Code" style={{ width: '180px', height: '180px', marginBottom: '16px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '8px' }} />
            <div className="form-group">
              <label className="label">Enter 6-digit code to confirm</label>
              <input className="input" placeholder="000000" maxLength={6} value={twoFACode} onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button onClick={enable2FA} className="btn btn-primary btn-sm" disabled={twoFACode.length !== 6}>Confirm & Enable</button>
              <button onClick={() => setTwoFAStep('idle')} className="btn btn-secondary btn-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
