import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginRegister = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('Male');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    if (isLogin) {
      const res = await login(username.trim(), password);
      if (!res.success) {
        setError(res.error || 'Failed to login');
      }
    } else {
      const regRes = await register(username.trim(), password, gender);
      if (regRes.success) {
        // Automatically login after successful registration
        const logRes = await login(username.trim(), password);
        if (!logRes.success) {
          setError(logRes.error || 'Account created but failed to log in');
        }
      } else {
        setError(regRes.error || 'Registration failed');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="logo-svg">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{isLogin ? 'Sign in to access your secure chat workspace' : 'Join and start chatting in real-time'}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="e.g. rifat"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={loading}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? (
              <span className="spinner"></span>
            ) : (
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>

        <div className="auth-toggle">
          <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
          <button 
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            disabled={loading}
          >
            {isLogin ? 'Sign Up Now' : 'Sign In Now'}
          </button>
        </div>
      </div>

      <style>{`
        .auth-wrapper {
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .auth-card {
          width: 100%;
          max-width: 440px;
          padding: 40px;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .brand-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: var(--accent-gradient);
          color: white;
          margin-bottom: 20px;
          box-shadow: 0 8px 20px rgba(121, 40, 202, 0.25);
        }

        .auth-header h1 {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .auth-header p {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .auth-submit {
          margin-top: 10px;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 48px;
        }

        .auth-error {
          background: rgba(255, 0, 128, 0.15);
          border: 1px solid rgba(255, 0, 128, 0.3);
          color: #ff5599;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.9rem;
          margin-bottom: 20px;
          text-align: center;
          font-weight: 500;
        }

        .auth-toggle {
          display: flex;
          justify-content: center;
          gap: 8px;
          font-size: 0.9rem;
          margin-top: 24px;
          color: var(--text-secondary);
        }

        .auth-toggle button {
          color: var(--accent-secondary);
          font-weight: 600;
        }

        .auth-toggle button:hover {
          color: var(--text-primary);
          text-decoration: underline;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LoginRegister;
