import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
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

const LoginPage = () => {
  const { login, loginWithGoogle, isLoading, requiresTwoFactor, verify2FA } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');

  const handleSubmit = e => { e.preventDefault(); login(form); };

  if (requiresTwoFactor) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a2416' }}>
        <div style={{ width: '100%', maxWidth: 400, padding: 24, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
          <h2 style={{ color: 'white', marginBottom: 8 }}>Two-Factor Auth</h2>
          <p style={{ color: '#4ade80', marginBottom: 24, fontSize: 14 }}>Enter the 6-digit code from your authenticator app</p>
          <input placeholder="000000" maxLength={6} value={twoFACode} onChange={e => setTwoFACode(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1.5px solid rgba(74,222,128,0.3)', borderRadius: 10, fontSize: 24, letterSpacing: 8, textAlign: 'center', background: 'rgba(255,255,255,0.08)', color: 'white', outline: 'none', fontFamily: 'inherit', marginBottom: 16 }} />
          <button onClick={() => verify2FA(twoFACode)} disabled={isLoading || twoFACode.length !== 6}
            style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #0a2416, #16a34a)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: isLoading || twoFACode.length !== 6 ? 0.6 : 1 }}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

      {/* LEFT - Dark green hero */}
      <div style={{ background: 'linear-gradient(145deg, #052e10 0%, #0a2416 40%, #163a26 80%, #0d3320 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 56px', position: 'relative', overflow: 'hidden' }}>
        {/* Constellation BG */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1 }} viewBox="0 0 500 700" preserveAspectRatio="xMidYMid slice">
          <line x1="80" y1="120" x2="200" y2="80" stroke="#4ade80" strokeWidth="1.5"/>
          <line x1="200" y1="80" x2="320" y2="150" stroke="#06b6d4" strokeWidth="1.5"/>
          <line x1="320" y1="150" x2="280" y2="300" stroke="#4ade80" strokeWidth="1.5"/>
          <line x1="280" y1="300" x2="120" y2="280" stroke="#06b6d4" strokeWidth="1.5"/>
          <line x1="120" y1="280" x2="80" y2="120" stroke="#16a34a" strokeWidth="1.5"/>
          <line x1="150" y1="450" x2="380" y2="420" stroke="#06b6d4" strokeWidth="1.5"/>
          <line x1="380" y1="420" x2="430" y2="580" stroke="#4ade80" strokeWidth="1.5"/>
          <circle cx="80" cy="120" r="6" fill="#4ade80"/>
          <circle cx="200" cy="80" r="10" fill="#06b6d4"/>
          <circle cx="320" cy="150" r="7" fill="#4ade80"/>
          <circle cx="280" cy="300" r="6" fill="#06b6d4"/>
          <circle cx="120" cy="280" r="5" fill="#4ade80"/>
          <circle cx="150" cy="450" r="7" fill="#06b6d4"/>
          <circle cx="380" cy="420" r="6" fill="#4ade80"/>
          <circle cx="430" cy="580" r="8" fill="#06b6d4"/>
        </svg>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 52 }}><Logo /></div>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 20, fontFamily: 'Georgia, serif' }}>
            Your talent,<br />
            <span style={{ background: 'linear-gradient(135deg, #4ade80, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              constellation-bright
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.8, marginBottom: 44, maxWidth: 340 }}>
            AI-powered freelance platform connecting clients with top talent in Pune.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[['⚡', 'AI-powered job matching'], ['🔒', 'Secure milestone payments'], ['📍', 'Hyperlocal · Pune'], ['⭐', 'Verified reputation scores']].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{text}</span>
              </div>
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 52 }}>Built by Tiya Gandhi · Nayoda Internship 2026</p>
        </div>
      </div>

      {/* RIGHT - White form */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 56px', background: 'white', overflowY: 'auto' }}>
        <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, marginBottom: 8, color: '#18181b', fontFamily: 'Georgia, serif' }}>Welcome back 👋</h2>
            <p style={{ color: '#71717a', fontSize: 14 }}>
              New here? <Link to="/register" style={{ color: '#16a34a', fontWeight: 700 }}>Create an account</Link>
            </p>
          </div>

          {/* Google Sign In */}
          <div style={{ marginBottom: 20 }}>
            <GoogleLogin
              onSuccess={cred => loginWithGoogle(cred.credential)}
              onError={() => {}}
              width="100%"
              text="signin_with"
              shape="rectangular"
              theme="outline"
              size="large"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0', color: '#a1a1aa', fontSize: 13 }}>
            <div style={{ flex: 1, height: 1, background: '#e4e4e7' }} />
            or sign in with email
            <div style={{ flex: 1, height: 1, background: '#e4e4e7' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={inp}
                  onFocus={e => e.target.style.borderColor = '#16a34a'} onBlur={e => e.target.style.borderColor = '#e4e4e7'} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                <input type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={{ ...inp, paddingRight: 42 }}
                  onFocus={e => e.target.style.borderColor = '#16a34a'} onBlur={e => e.target.style.borderColor = '#e4e4e7'} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              style={{ padding: '13px', background: 'linear-gradient(135deg, #052e10, #16a34a)', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(10,36,22,0.35)', marginTop: 4 }}>
              {isLoading ? 'Signing in...' : <> Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Divider to register */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '24px 0', color: '#a1a1aa', fontSize: 13 }}>
            <div style={{ flex: 1, height: 1, background: '#e4e4e7' }} />
            New to SkillSphere?
            <div style={{ flex: 1, height: 1, background: '#e4e4e7' }} />
          </div>

          {/* Two signup options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Link to="/register?role=client" style={{ padding: '14px 12px', borderRadius: 12, border: '1.5px solid #e4e4e7', background: 'white', textAlign: 'center', textDecoration: 'none', display: 'block', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.background = '#f0faf4'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e4e4e7'; e.currentTarget.style.background = 'white'; }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>💼</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#18181b' }}>Hire Talent</div>
              <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>Sign up as Client</div>
            </Link>
            <Link to="/register?role=freelancer" style={{ padding: '14px 12px', borderRadius: 12, border: '1.5px solid #e4e4e7', background: 'white', textAlign: 'center', textDecoration: 'none', display: 'block', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.background = '#f0fdff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e4e4e7'; e.currentTarget.style.background = 'white'; }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>🧑‍💻</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#18181b' }}>Find Work</div>
              <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>Sign up as Freelancer</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
