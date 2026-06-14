// src/pages/SignUp.tsx (Complete without handleRipple)
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

interface SignupData {
  fullName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  medicalRegistrationNumber: string;
  specialization: string;
}

const SignUp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const [signupData, setSignupData] = useState<SignupData>({
    fullName: "",
    phone: "",
    password: "",
    confirmPassword: "",
    medicalRegistrationNumber: "",
    specialization: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!signupData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (signupData.fullName.length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!signupData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s+-]{10,}$/.test(signupData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!signupData.password) {
      newErrors.password = "Password is required";
    } else if (signupData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!signupData.medicalRegistrationNumber.trim()) {
      newErrors.medicalRegistrationNumber = "Medical Registration Number is required";
    }
    if (!signupData.specialization) {
      newErrors.specialization = "Please select a specialization";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(async () => {
      const userData = {
        id: Date.now().toString(),
        name: signupData.fullName,
        email: `${signupData.phone}@example.com`,
        role: 'doctor',
        specialization: signupData.specialization,
        medicalRegistrationNumber: signupData.medicalRegistrationNumber
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      await login(signupData.phone, signupData.password);
      navigate('/dashboard');
    }, 1500);
  };

  const specializations = [
    "Select Specialization",
    "Cardiologist",
    "Dermatologist",
    "General Physician",
    "Dentist",
    "Pediatrician",
    "Neurologist",
    "Orthopedic Surgeon",
    "Ophthalmologist",
    "Psychiatrist",
    "Radiologist",
    "Surgeon"
  ];

  return (
    <div className="auth-wrapper-blue">
      <div className="blob-blue blob-1-blue" />
      <div className="blob-blue blob-2-blue" />
      <div className="blob-blue blob-3-blue" />

      <div className="auth-card-blue signup-card-blue">
        {/* Left Panel - Brand Section */}
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
            
            <h2 className="hero-text">Join Our Community</h2>
            
            <p className="description">
              Connect with patients and grow your practice with AI-powered technology.
              Join thousands of verified doctors providing smarter healthcare.
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

        {/* Right Panel - Signup Form */}
        <div className="right-panel-blue signup-right-panel">
          <div className="form-header-blue">
            <h1>Sign Up</h1>
            <p>Create your doctor account</p>
          </div>

          {/* Progress Steps */}
          <div className="progress-steps-blue">
            <div className={`step-blue ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number-blue">1</div>
              <span>Account</span>
            </div>
            <div className={`step-line-blue ${currentStep >= 2 ? 'active' : ''}`}></div>
            <div className={`step-blue ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number-blue">2</div>
              <span>Verification</span>
            </div>
            <div className={`step-line-blue ${currentStep >= 3 ? 'active' : ''}`}></div>
            <div className={`step-blue ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number-blue">3</div>
              <span>Review</span>
            </div>
          </div>

          <div className={shake ? "shake" : ""}>
            {/* Step 1: Account Details */}
            {currentStep === 1 && (
              <>
                <div className="field-blue">
                  <label>Full Name</label>
                  <div className="input-wrap-blue">
                    <span className="input-icon-blue">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="12" r="4" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Dr. John Doe"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    />
                  </div>
                  {errors.fullName && <p className="error-msg-blue visible">{errors.fullName}</p>}
                </div>

                <div className="field-blue">
                  <label>Phone Number</label>
                  <div className="input-wrap-blue">
                    <span className="input-icon-blue">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                    />
                  </div>
                  {errors.phone && <p className="error-msg-blue visible">{errors.phone}</p>}
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
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
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
                  <small>Password must be at least 6 characters</small>
                  {errors.password && <p className="error-msg-blue visible">{errors.password}</p>}
                </div>

                <div className="field-blue">
                  <label>Confirm Password</label>
                  <div className="input-wrap-blue">
                    <span className="input-icon-blue">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    />
                    <button className="eye-toggle-blue" onClick={() => setShowConfirmPassword(!showConfirmPassword)} type="button">
                      {showConfirmPassword ? (
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
                  {errors.confirmPassword && <p className="error-msg-blue visible">{errors.confirmPassword}</p>}
                </div>
              </>
            )}

            {/* Step 2: Doctor Verification */}
            {currentStep === 2 && (
              <>
                <div className="field-blue">
                  <label>Medical Registration Number</label>
                  <div className="input-wrap-blue">
                    <span className="input-icon-blue">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Enter your medical registration number"
                      value={signupData.medicalRegistrationNumber}
                      onChange={(e) => setSignupData({ ...signupData, medicalRegistrationNumber: e.target.value })}
                    />
                  </div>
                  <small>Mandatory to verify that you are a licensed doctor</small>
                  {errors.medicalRegistrationNumber && <p className="error-msg-blue visible">{errors.medicalRegistrationNumber}</p>}
                </div>

                <div className="field-blue">
                  <label>Specialization</label>
                  <div className="input-wrap-blue">
                    <span className="input-icon-blue">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                    </span>
                    <select
                      value={signupData.specialization}
                      onChange={(e) => setSignupData({ ...signupData, specialization: e.target.value })}
                    >
                      {specializations.map((spec, index) => (
                        <option key={index} value={spec === "Select Specialization" ? "" : spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.specialization && <p className="error-msg-blue visible">{errors.specialization}</p>}
                </div>
              </>
            )}

            {/* Step 3: Review Details */}
            {currentStep === 3 && (
              <div className="review-card-blue">
                <h3>Review Your Details</h3>
                <div className="review-section-blue">
                  <h4>Account Details</h4>
                  <div className="review-item-blue">
                    <strong>Full Name:</strong> <span>{signupData.fullName}</span>
                  </div>
                  <div className="review-item-blue">
                    <strong>Phone Number:</strong> <span>{signupData.phone}</span>
                  </div>
                </div>
                <div className="review-section-blue">
                  <h4>Professional Details</h4>
                  <div className="review-item-blue">
                    <strong>Medical Registration Number:</strong> <span>{signupData.medicalRegistrationNumber}</span>
                  </div>
                  <div className="review-item-blue">
                    <strong>Specialization:</strong> <span>{signupData.specialization}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="button-group-blue">
              {currentStep > 1 && (
                <button type="button" onClick={handleBack} className="btn-secondary-blue">
                  Back
                </button>
              )}
              {currentStep < 3 ? (
                <button type="button" onClick={handleNext} className="btn-login-blue">
                  Continue
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} className="btn-login-blue" disabled={loading}>
                  {loading && <span className="btn-spinner-blue" />}
                  <span className="btn-text-blue">{loading ? "Creating Account…" : "Create Account"}</span>
                </button>
              )}
            </div>

            {/* Login Link */}
            <p className="signup-row-blue">
              Already have an account? <Link to="/login" className="signup-link-blue">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;