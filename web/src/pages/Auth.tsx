// src/pages/Auth.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

const Auth: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};

    if (!loginData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!loginData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!validateLogin()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(loginData.email, loginData.password);
      navigate('/dashboard');
    } catch {
      setError("Invalid email or password. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;
    const rect = btn.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 700);
  };

  return (
    <div className="auth-wrapper-blue">
      <div className="blob-blue blob-1-blue" />
      <div className="blob-blue blob-2-blue" />
      <div className="blob-blue blob-3-blue" />

      <div className="auth-card-blue">
        {/* Left Panel - Content Box */}
        <div className="left-panel-blue">
          <div className="content-box">
            <div className="logo-mark-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" fill="none" />
                <circle cx="12" cy="12" r="3" fill="white" stroke="none" />
              </svg>
            </div>
            
            <h1 className="brand-title">Swasthya AI</h1>
            <p className="brand-tagline">AI-Powered Healthcare Platform</p>
            
            <div className="divider-line"></div>
            
            <h2 className="hero-text">Connect. Heal. Grow.</h2>
            
            <p className="description">
              Join thousands of verified doctors providing smarter healthcare through AI-powered 
              patient management and online consultations.
            </p>
            
            <div className="features-list">
              <div className="feature-item">
                <div className="check-icon">✓</div>
                <div>
                  <strong>Manage Patients Efficiently</strong>
                  <p>Access patient records securely and track consultations & follow-ups.</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="check-icon">✓</div>
                <div>
                  <strong>Smart Appointment Scheduling</strong>
                  <p>Reduce no-shows and organize your daily practice with ease.</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="check-icon">✓</div>
                <div>
                  <strong>AI-Powered Healthcare</strong>
                  <p>Get AI-driven insights and tools to make smarter clinical decisions.</p>
                </div>
              </div>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Active Doctors</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">50,000+</div>
                <div className="stat-label">Happy Patients</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">99%</div>
                <div className="stat-label">Satisfaction Rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Platform Access</div>
              </div>
            </div>
          </div>
          
          <div className="wave-shape-blue" />
          <div className="dots-grid-blue">
            {Array.from({ length: 20 }).map((_, i) => <span key={i} />)}
          </div>
          <div className="floating-shapes-blue">
            <span className="floating-dot-blue floating-dot-1-blue" />
            <span className="floating-dot-blue floating-dot-2-blue" />
            <span className="floating-dot-blue floating-dot-3-blue" />
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="right-panel-blue">
          <div className="form-header-blue">
            <h1>Welcome Back</h1>
            <p>Login to your doctor account</p>
          </div>

          <div className={shake ? "shake" : ""}>
            <div className="field-blue">
              <label>Email Address</label>
              <div className="input-wrap-blue">
                <span className="input-icon-blue">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="doctor@swasthya.com"
                  value={loginData.email}
                  onChange={(e) => { setLoginData({ ...loginData, email: e.target.value }); setError(""); }}
                />
              </div>
              {errors.email && <p className="error-msg-blue visible">{errors.email}</p>}
            </div>

            <div className="field-blue">
              <label>Password</label>
              <div className="input-wrap-blue">
                <span className="input-icon-blue">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => { setLoginData({ ...loginData, password: e.target.value }); setError(""); }}
                />
                <button className="eye-toggle-blue" onClick={() => setShowPassword(!showPassword)} type="button">
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="error-msg-blue visible">{errors.password}</p>}
              {error && <p className="error-msg-blue visible">{error}</p>}
            </div>

            <div className="extras-row-blue">
              <label className="remember-label-blue" onClick={() => setRemember(!remember)}>
                <input type="checkbox" readOnly checked={remember} />
                <span className={`custom-check-blue${remember ? " checked" : ""}`}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Keep me logged in
              </label>
              <button className="forgot-link-blue">Forgot Password?</button>
            </div>

            <button
              className="btn-login-blue"
              onClick={(e) => { handleRipple(e); handleLogin(e); }}
              disabled={loading}
            >
              {loading && <span className="btn-spinner-blue" />}
              <span className="btn-text-blue">{loading ? "Signing in…" : "Login"}</span>
            </button>
          </div>

          <p className="signup-row-blue">
            Don't have an account? <Link to="/signup" className="signup-link-blue">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;