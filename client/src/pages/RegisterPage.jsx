import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <svg width="36" height="36" viewBox="0 0 40 40">
      <line x1="8" y1="22" x2="18" y2="12" stroke="#4ade80" strokeWidth="1.2"/>
      <line x1="18" y1="12" x2="28" y2="20" stroke="#4ade80" strokeWidth="1.2"/>
      <line x1="28" y1="20" x2="24" y2="32" stroke="#06b6d4" strokeWidth="1.2"/>
      <line x1="24" y1="32" x2="12" y2="30" stroke="#06b6d4" strokeWidth="1.2"/>
      <line x1="12" y1="30" x2="8" y2="22" stroke="#06b6d4" strokeWidth="1.2"/>
      <circle cx="18" cy="12" r="4" fill="#4ade80"/>
      <circle cx="8" cy="22" r="2.5" fill="#06b6d4"/>
      <circle cx="28" cy="20" r="2.5" fill="#4ade80"/>
      <circle cx="24" cy="32" r="2" fill="#06b6d4"/>
      <circle cx="12" cy="30" r="2" fill="#4ade80"/>
      <line x1="18" y1="7" x2="18" y2="10" stroke="white" strokeWidth="1"/>
      <line x1="18" y1="14" x2="18" y2="17" stroke="white" strokeWidth="1"/>
      <line x1="13" y1="12" x2="16" y2="12" stroke="white" strokeWidth="1"/>
      <line x1="20" y1="12" x2="23" y2="12" stroke="white" strokeWidth="1"/>
    </svg>
    <span style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 800, color: 'white' }}>
      Skill<span style={{ color: '#4ade80' }}>Sphere</span>
    </span>
  </div>
);

const inp = {
  width: '100%', padding: '11px 14px 11px 42px',
  border: '1.5px solid #e4e4e7', borderRadius: 10,
  fontSize: 14, outline: 'none', fontFamily: 'inherit', color: '#18181b',
};

const RegisterPage = () => {
  const { register, loginWithGoogle, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'client';
  const [form, setForm] = useState({ name: '', email: '', password: '', role: defaultRole });
  const [showPass, setShowPass] = useState(false);
  const handleSubmit = e => { e.preventDefault(); register(form); };
  const isClient = form.role === 'client';

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

      {/* LEFT Hero - changes based on role */}
      <div style={{
        background: isClient
          ? 'linear-gradient(145deg, #052e10 0%, #0a2416 40%, #163a26 80%, #0d3320 100%)'
          : 'linear-gradient(145deg, #0a1628 0%, #0c2240 40%, #0e3a5c 80%, #0a2e4a 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '64px 56px', position: 'relative', overflow: 'hidden', transition: 'background 0.5s',
      }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1 }} viewBox="0 0 500 700" preserveAspectRatio="xMidYMid slice">
          <line x1="80" y1="120" x2="200" y2="80" stroke={isClient ? '#4ade80' : '#38bdf8'} strokeWidth="1.5"/>
          <line x1="200" y1="80" x2="320" y2="150" stroke={isClient ? '#06b6d4' : '#818cf8'} strokeWidth="1.5"/>
          <line x1="320" y1="150" x2="280" y2="300" stroke={isClient ? '#4ade80' : '#38bdf8'} strokeWidth="1.5"/>
          <line x1="280" y1="300" x2="120" y2="280" stroke={isClient ? '#06b6d4' : '#818cf8'} strokeWidth="1.5"/>
          <circle cx="80" cy="120" r="6" fill={isClient ? '#4ade80' : '#38bdf8'}/>
          <circle cx="200" cy="80" r="10" fill={isClient ? '#06b6d4' : '#818cf8'}/>
          <circle cx="320" cy="150" r="7" fill={isClient ? '#4ade80' : '#38bdf8'}/>
          <circle cx="280" cy="300" r="6" fill={isClient ? '#06b6d4' : '#818cf8'}/>
          <circle cx="120" cy="280" r="5" fill={isClient ? '#4ade80' : '#38bdf8'}/>
        </svg>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 48 }}><Logo /></div>

          {/* Role toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 4, marginBottom: 40, width: 'fit-content' }}>
            {[['client', '💼', 'I want to Hire'], ['freelancer', '🧑‍💻', 'I want to Work']].map(([r, icon, label]) => (
              <button key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
                style={{ padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.2s', background: form.role === r ? 'white' : 'transparent', color: form.role === r ? '#0a2416' : 'rgba(255,255,255,0.7)', fontFamily: 'inherit' }}>
                {icon} {label}
              </button>
            ))}
          </div>

          <h1 style={{ fontSize: 38, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 16, fontFamily: 'Georgia, serif' }}>
            {isClient
              ? <>Hire the best<br /><span style={{ background: 'linear-gradient(135deg, #4ade80, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>local talent</span></>
              : <>Find great work<br /><span style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>near you</span></>}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.8, marginBottom: 36, maxWidth: 340 }}>
            {isClient
              ? 'Post projects, get proposals from verified freelancers, and pay securely through milestones.'
              : 'Build your profile, apply to gigs that match your skills, and grow your freelance career.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(isClient
              ? [['📋', 'Post gigs with budgets & milestones'], ['🤖', 'AI recommends best-fit freelancers'], ['💳', 'Pay only when work is approved']]
              : [['🎯', 'AI matches you to relevant gigs'], ['📁', 'Build a verified portfolio'], ['💰', 'Get paid securely on completion']]
            ).map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 15 }}>{icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{text}</span>
              </div>
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 48 }}>Built by Tiya Gandhi · Nayoda Internship 2026</p>
        </div>
      </div>

      {/* RIGHT Form */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 56px', background: 'white', overflowY: 'auto' }}>
        <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>

          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 26, marginBottom: 8, color: '#18181b', fontFamily: 'Georgia, serif' }}>
              {isClient ? 'Create client account' : 'Create freelancer account'}
            </h2>
            <p style={{ color: '#71717a', fontSize: 14 }}>
              Already have an account? <Link to="/login" style={{ color: '#16a34a', fontWeight: 700 }}>Sign in</Link>
            </p>
          </div>

          {/* Role cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
            {[['client', '💼', 'Hire Talent', 'Post gigs'], ['freelancer', '🧑‍💻', 'Find Work', 'Get hired']].map(([r, icon, label, sub]) => (
              <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                style={{ padding: '12px', borderRadius: 12, cursor: 'pointer', textAlign: 'left', border: form.role === r ? `2px solid ${r === 'client' ? '#16a34a' : '#06b6d4'}` : '1.5px solid #e4e4e7', background: form.role === r ? (r === 'client' ? '#f0faf4' : '#f0fdff') : 'white', transition: 'all 0.2s', fontFamily: 'inherit' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: form.role === r ? (r === 'client' ? '#16a34a' : '#06b6d4') : '#18181b' }}>{label}</div>
                <div style={{ fontSize: 11, color: '#71717a' }}>{sub}</div>
              </button>
            ))}
          </div>

          {/* Google Sign Up */}
          <div style={{ marginBottom: 18 }}>
            <GoogleLogin
              onSuccess={cred => loginWithGoogle(cred.credential, form.role)}
              onError={() => {}}
              width="100%"
              text="signup_with"
              shape="rectangular"
              theme="outline"
              size="large"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, color: '#a1a1aa', fontSize: 13 }}>
            <div style={{ flex: 1, height: 1, background: '#e4e4e7' }} />
            or register with email
            <div style={{ flex: 1, height: 1, background: '#e4e4e7' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                <input type="text" placeholder="Tiya Gandhi" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inp}
                  onFocus={e => e.target.style.borderColor = '#16a34a'} onBlur={e => e.target.style.borderColor = '#e4e4e7'} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={inp}
                  onFocus={e => e.target.style.borderColor = '#16a34a'} onBlur={e => e.target.style.borderColor = '#e4e4e7'} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                <input type={showPass ? 'text' : 'password'} placeholder="Min 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} style={{ ...inp, paddingRight: 42 }}
                  onFocus={e => e.target.style.borderColor = '#16a34a'} onBlur={e => e.target.style.borderColor = '#e4e4e7'} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              style={{ padding: '13px', background: isClient ? 'linear-gradient(135deg, #052e10, #16a34a)' : 'linear-gradient(135deg, #0a1628, #06b6d4)', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', boxShadow: isClient ? '0 4px 20px rgba(10,36,22,0.35)' : '0 4px 20px rgba(6,182,212,0.3)', marginTop: 4 }}>
              {isLoading ? 'Creating...' : <>{isClient ? 'Create Client Account' : 'Create Freelancer Account'} <ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ fontSize: 12, color: '#a1a1aa', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
            By registering you agree to our <Link to="/terms" style={{ color: '#16a34a' }}>Terms</Link> and <Link to="/privacy" style={{ color: '#16a34a' }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
