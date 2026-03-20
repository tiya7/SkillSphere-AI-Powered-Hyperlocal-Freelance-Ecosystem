import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

// ─── Forgot Password Page ─────────────────────────────────────────────────────
export const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', padding: '24px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card-body page-enter">
          <div style={{ marginBottom: '32px' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--gray-500)', fontSize: '14px', marginBottom: '24px' }}>
              <ArrowLeft size={16} /> Back to login
            </Link>

            {sent ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--success-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle size={28} color="var(--success)" />
                </div>
                <h2 style={{ marginBottom: '12px' }}>Check your email</h2>
                <p className="text-muted">We've sent a password reset link to your email address. The link expires in 1 hour.</p>
                <Link to="/login" className="btn btn-primary btn-full" style={{ marginTop: '24px', display: 'flex' }}>
                  Back to Login
                </Link>
              </div>
            ) : (
              <>
                <h2 style={{ marginBottom: '8px' }}>Reset password</h2>
                <p className="text-muted">Enter your email and we'll send you a reset link.</p>

                <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="label">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                      <input
                        className={`input ${errors.email ? 'error' : ''}`}
                        style={{ paddingLeft: '38px' }}
                        placeholder="your@email.com"
                        type="email"
                        {...register('email', { required: 'Email required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                      />
                    </div>
                    {errors.email && <span className="error-text">{errors.email.message}</span>}
                  </div>

                  <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Reset Password Page ──────────────────────────────────────────────────────
export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password: data.password });
      toast.success('Password reset! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', padding: '24px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card-body page-enter">
          <h2 style={{ marginBottom: '8px' }}>Create new password</h2>
          <p className="text-muted" style={{ marginBottom: '28px' }}>Choose a strong password for your account.</p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input
                  className={`input ${errors.password ? 'error' : ''}`}
                  style={{ paddingLeft: '38px', paddingRight: '40px' }}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars, upper + lower + number"
                  {...register('password', {
                    required: 'Password required',
                    minLength: { value: 8, message: 'Min 8 characters' },
                    pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must include uppercase, lowercase, and number' },
                  })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password.message}</span>}
            </div>

            <div className="form-group">
              <label className="label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input
                  className={`input ${errors.confirmPassword ? 'error' : ''}`}
                  style={{ paddingLeft: '38px', paddingRight: '40px' }}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (val) => val === watch('password') || 'Passwords do not match',
                  })}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Email Verification Page ──────────────────────────────────────────────────
export const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        setMessage(res.data.message);
        setStatus('success');
      } catch (err) {
        setMessage(err.response?.data?.message || 'Verification failed');
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', padding: '24px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card-body" style={{ textAlign: 'center' }}>
          {status === 'loading' && (
            <>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p className="text-muted">Verifying your email...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div style={{ width: '64px', height: '64px', background: 'var(--success-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={28} color="var(--success)" />
              </div>
              <h2 style={{ marginBottom: '8px' }}>Email Verified!</h2>
              <p className="text-muted" style={{ marginBottom: '24px' }}>{message}</p>
              <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex' }}>Go to Login</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
              <h2 style={{ marginBottom: '8px' }}>Verification Failed</h2>
              <p className="text-muted" style={{ marginBottom: '24px' }}>{message}</p>
              <Link to="/login" className="btn btn-secondary" style={{ display: 'inline-flex' }}>Back to Login</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
