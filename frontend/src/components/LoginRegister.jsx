import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

/* ── Animated mesh canvas background ── */
const MeshBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let w, h;

    const POINTS = 60;
    const points = [];

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };

    const init = () => {
      points.length = 0;
      for (let i = 0; i < POINTS; i++) {
        points.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 1.8 + 0.6,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Connect nearby points
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 212, 170, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw + move points
      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 170, 0.5)';
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };

    resize();
    init();
    draw();
    window.addEventListener('resize', () => { resize(); init(); });
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="mesh-canvas" />;
};

/* ── Floating label input ── */
const FloatInput = ({ id, label, type = 'text', value, onChange, disabled, icon, autoComplete }) => {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className={`float-field ${lifted ? 'lifted' : ''} ${focused ? 'focused' : ''}`}>
      <span className="float-icon">{icon}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        autoComplete={autoComplete}
        required
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

const LoginRegister = () => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('Male');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const switchTab = (t) => {
    setTab(t);
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);

    if (tab === 'login') {
      const res = await login(username.trim(), password);
      if (!res.success) setError(res.error || 'Incorrect username or password.');
    } else {
      const regRes = await register(username.trim(), password, gender);
      if (regRes.success) {
        const logRes = await login(username.trim(), password);
        if (!logRes.success) setError(logRes.error || 'Account created, but login failed.');
      } else {
        setError(regRes.error || 'Registration failed. Username may be taken.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-root">
      {/* Full-page animated background */}
      <div className="auth-bg">
        <MeshBackground />
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* Centered card */}
      <div className="auth-center">
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="logo-text">NexChat</span>
        </div>

        <p className="auth-subtitle">
          {tab === 'login' ? 'Welcome back — sign in to continue' : 'Create your account and start chatting'}
        </p>

        {/* Glass card */}
        <div className="auth-card">
          {/* Tab switcher */}
          <div className="tab-bar">
            <div className="tab-slider" style={{ transform: tab === 'login' ? 'translateX(0)' : 'translateX(100%)' }} />
            <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')} type="button">
              Sign In
            </button>
            <button className={`tab-btn ${tab === 'signup' ? 'active' : ''}`} onClick={() => switchTab('signup')} type="button">
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Error / Success */}
            {error && (
              <div className="msg-banner error-banner">
                <span className="msg-icon">⚠</span> {error}
              </div>
            )}
            {success && (
              <div className="msg-banner success-banner">
                <span className="msg-icon">✓</span> {success}
              </div>
            )}

            {/* Username */}
            <FloatInput
              id="username"
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="username"
              icon={
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              }
            />

            {/* Password with show/hide toggle */}
            <div className="password-wrap">
              <FloatInput
                id="password"
                label="Password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                icon={
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                }
              />
              <button
                type="button"
                className="show-pass-btn"
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>

            {/* Gender — signup only */}
            {tab === 'signup' && (
              <div className="gender-group">
                <span className="gender-label">Gender</span>
                <div className="gender-pills">
                  {['Male', 'Female', 'Other'].map(g => (
                    <button
                      key={g}
                      type="button"
                      className={`gender-pill ${gender === g ? 'active' : ''}`}
                      onClick={() => setGender(g)}
                      disabled={loading}
                    >
                      {g === 'Male' ? '♂ Male' : g === 'Female' ? '♀ Female' : '◈ Other'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loader" />
              ) : (
                <>
                  <span>{tab === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer switch */}
          <div className="auth-footer">
            {tab === 'login' ? (
              <>Don't have an account? <button type="button" className="switch-link" onClick={() => switchTab('signup')}>Sign up free</button></>
            ) : (
              <>Already have an account? <button type="button" className="switch-link" onClick={() => switchTab('login')}>Sign in</button></>
            )}
          </div>
        </div>

        {/* Trust badges */}
        <div className="trust-row">
          {['⚡ Real-time', '🔒 Secure JWT', '📎 File sharing'].map(t => (
            <span key={t} className="trust-badge">{t}</span>
          ))}
        </div>
      </div>

      <style>{`
        /* ─── Root ─── */
        .auth-root {
          width: 100vw; height: 100vh;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
        }

        /* ─── Background ─── */
        .auth-bg {
          position: absolute; inset: 0; z-index: 0;
          background: radial-gradient(ellipse at 20% 20%, #061220 0%, #030810 60%, #040e1a 100%);
        }

        .mesh-canvas {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          opacity: 0.7;
        }

        .bg-orb {
          position: absolute; border-radius: 50%;
          filter: blur(110px); pointer-events: none;
        }

        .bg-orb-1 {
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(0,212,170,0.18) 0%, transparent 70%);
          top: -200px; left: -200px;
          animation: orbFloat 20s infinite alternate ease-in-out;
        }

        .bg-orb-2 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%);
          bottom: -150px; right: -150px;
          animation: orbFloat 25s infinite alternate-reverse ease-in-out;
        }

        .bg-orb-3 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%);
          top: 50%; left: 60%;
          animation: orbFloat 30s infinite alternate ease-in-out;
        }

        @keyframes orbFloat {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(60px, 50px) scale(1.1); }
          100% { transform: translate(-40px, -30px) scale(0.92); }
        }

        /* ─── Center layout ─── */
        .auth-center {
          position: relative; z-index: 1;
          display: flex; flex-direction: column;
          align-items: center; gap: 20px;
          width: 100%; padding: 24px;
          animation: fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1);
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ─── Logo ─── */
        .auth-logo {
          display: flex; align-items: center; gap: 12px;
        }

        .logo-icon {
          width: 52px; height: 52px; border-radius: 16px;
          background: linear-gradient(135deg, #00d4aa, #0ea5e9);
          display: flex; align-items: center; justify-content: center;
          color: #030810;
          box-shadow: 0 0 30px rgba(0,212,170,0.35), 0 8px 20px rgba(0,0,0,0.3);
        }

        .logo-text {
          font-size: 2rem; font-weight: 800;
          background: linear-gradient(135deg, #00d4aa 30%, #0ea5e9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .auth-subtitle {
          font-size: 0.92rem;
          color: rgba(139, 154, 181, 0.85);
          font-weight: 400;
          letter-spacing: 0.1px;
        }

        /* ─── Glass Card ─── */
        .auth-card {
          width: 100%; max-width: 420px;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 28px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(0,212,170,0.06),
            0 24px 60px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.06);
        }

        /* ─── Tab bar ─── */
        .tab-bar {
          display: flex; position: relative;
          background: rgba(0,0,0,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .tab-slider {
          position: absolute;
          bottom: 0; left: 0;
          width: 50%; height: 2px;
          background: linear-gradient(90deg, #00d4aa, #0ea5e9);
          border-radius: 2px 2px 0 0;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 0 12px rgba(0,212,170,0.5);
        }

        .tab-btn {
          flex: 1; padding: 17px;
          font-size: 0.92rem; font-weight: 600;
          font-family: 'Outfit', sans-serif;
          color: rgba(139,154,181,0.7);
          transition: color 0.2s ease;
          letter-spacing: 0.1px;
        }

        .tab-btn.active { color: #eef2f7; }
        .tab-btn:hover:not(.active) { color: rgba(200,210,220,0.85); }

        /* ─── Form ─── */
        .auth-form {
          padding: 28px 28px 20px;
          display: flex; flex-direction: column; gap: 18px;
        }

        /* ─── Banners ─── */
        .msg-banner {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; border-radius: 12px;
          font-size: 0.875rem; font-weight: 500;
          animation: bannerIn 0.3s ease;
        }

        @keyframes bannerIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .error-banner {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.22);
          color: #fca5a5;
        }

        .success-banner {
          background: rgba(0,212,170,0.1);
          border: 1px solid rgba(0,212,170,0.22);
          color: #6ee7b7;
        }

        .msg-icon { font-size: 1rem; }

        /* ─── Floating label field ─── */
        .float-field {
          position: relative;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .float-field.focused {
          border-color: rgba(0,212,170,0.45);
          background: rgba(0,212,170,0.04);
          box-shadow: 0 0 0 3px rgba(0,212,170,0.1);
        }

        .float-field input {
          width: 100%;
          background: transparent;
          border: none; outline: none; box-shadow: none;
          padding: 22px 16px 8px 46px;
          font-size: 0.95rem; font-weight: 500;
          color: var(--text-primary);
          border-radius: 16px;
          height: 58px;
          transition: none;
        }

        .float-field input:focus {
          border: none; box-shadow: none;
          background: transparent;
        }

        .float-field label {
          position: absolute;
          left: 46px; top: 50%;
          transform: translateY(-50%);
          font-size: 0.92rem; font-weight: 500;
          color: rgba(139,154,181,0.65);
          pointer-events: none;
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          white-space: nowrap;
        }

        .float-field.lifted label {
          top: 12px; transform: none;
          font-size: 0.7rem; font-weight: 600;
          color: rgba(0,212,170,0.75);
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }

        .float-icon {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          color: rgba(139,154,181,0.5);
          display: flex; align-items: center;
          pointer-events: none; z-index: 1;
          transition: color 0.2s ease;
        }

        .float-field.focused .float-icon { color: rgba(0,212,170,0.7); }

        /* ─── Password wrapper ─── */
        .password-wrap { position: relative; }

        .show-pass-btn {
          position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
          color: rgba(139,154,181,0.5);
          display: flex; align-items: center;
          padding: 6px; border-radius: 8px;
          transition: color 0.15s ease;
          z-index: 2;
        }

        .show-pass-btn:hover { color: rgba(0,212,170,0.8); }

        /* ─── Gender pills ─── */
        .gender-group {
          display: flex; flex-direction: column; gap: 10px;
        }

        .gender-label {
          font-size: 0.72rem; font-weight: 700;
          color: rgba(139,154,181,0.6);
          text-transform: uppercase; letter-spacing: 0.8px;
          padding-left: 2px;
        }

        .gender-pills {
          display: flex; gap: 8px;
        }

        .gender-pill {
          flex: 1; padding: 10px 8px;
          border-radius: 12px;
          font-size: 0.82rem; font-weight: 600;
          font-family: 'Outfit', sans-serif;
          color: rgba(139,154,181,0.7);
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          transition: all 0.2s ease;
          text-align: center;
        }

        .gender-pill:hover:not(.active) {
          background: rgba(255,255,255,0.06);
          color: var(--text-primary);
        }

        .gender-pill.active {
          background: rgba(0,212,170,0.1);
          border-color: rgba(0,212,170,0.35);
          color: #5eead4;
          box-shadow: 0 0 14px rgba(0,212,170,0.12);
        }

        /* ─── Submit button ─── */
        .submit-btn {
          width: 100%;
          height: 54px;
          border-radius: 16px;
          background: linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%);
          color: #030c14;
          font-size: 0.97rem; font-weight: 700;
          font-family: 'Outfit', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          letter-spacing: 0.2px;
          box-shadow: 0 6px 24px rgba(0,212,170,0.28), 0 2px 8px rgba(0,0,0,0.3);
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          margin-top: 4px;
          position: relative; overflow: hidden;
        }

        .submit-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .submit-btn:hover:not(:disabled)::before { opacity: 1; }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(0,212,170,0.38), 0 4px 12px rgba(0,0,0,0.35);
        }

        .submit-btn:active:not(:disabled) { transform: translateY(0); }

        .submit-btn:disabled {
          opacity: 0.55; cursor: not-allowed; transform: none;
        }

        .btn-loader {
          width: 22px; height: 22px;
          border: 2.5px solid rgba(3,12,20,0.3);
          border-top-color: #030c14;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ─── Footer ─── */
        .auth-footer {
          padding: 16px 28px 24px;
          text-align: center;
          font-size: 0.875rem;
          color: rgba(139,154,181,0.65);
        }

        .switch-link {
          color: #5eead4;
          font-weight: 600;
          margin-left: 5px;
          font-family: 'Outfit', sans-serif;
          transition: color 0.15s ease;
        }

        .switch-link:hover { color: #2dd4bf; text-decoration: underline; }

        /* ─── Trust badges ─── */
        .trust-row {
          display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
        }

        .trust-badge {
          font-size: 0.75rem; font-weight: 500;
          color: rgba(139,154,181,0.5);
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 5px 12px; border-radius: 20px;
          letter-spacing: 0.2px;
        }

        /* ─── Mobile ─── */
        @media (max-width: 480px) {
          .auth-form { padding: 22px 20px 16px; }
          .auth-footer { padding: 14px 20px 20px; }
          .auth-card { border-radius: 22px; }
        }
      `}</style>
    </div>
  );
};

export default LoginRegister;
