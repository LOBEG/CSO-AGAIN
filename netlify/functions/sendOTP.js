export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const bodyRaw = event.body || '{}';
    let data;
    try {
      data = JSON.parse(bodyRaw);
    } catch (parseErr) {
      data = {};
    }

    const { email, phone, deliveryMethod, otp, timestamp } = data;

    console.log(`📨 OTP send request - Method: ${deliveryMethod}, Email: ${email}, Phone: ${phone}`);

    if (!email || !otp || !deliveryMethod) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: email, otp, deliveryMethod' }),
      };
    }

    // Simulate OTP delivery
    // In production, integrate with actual SMS (Twilio, AWS SNS) or Email service (SendGrid, AWS SES)
    
    if (deliveryMethod === 'email') {
      // Simulate email sending
      console.log(`✅ OTP ${otp} would be sent to email: ${email}`);
      
      // TODO: Integrate with actual email service
      // Example: SendGrid or AWS SES
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: `OTP sent to ${email}`,
          deliveryMethod: 'email',
          timestamp: new Date().toISOString(),
        }),
      };
    } else if (deliveryMethod === 'phone') {
      // Simulate SMS sending
      console.log(`✅ OTP ${otp} would be sent to phone: ${phone}`);
      
      // TODO: Integrate with actual SMS service
      // Example: Twilio or AWS SNS
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: `OTP sent to ${phone}`,
          deliveryMethod: 'phone',
          timestamp: new Date().toISOString(),
        }),
      };
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid delivery method. Must be "email" or "phone".' }),
      };
    }

  } catch (error) {
    console.error('OTP send error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        message: String(error.message || error)
      }),
    };
  }
};