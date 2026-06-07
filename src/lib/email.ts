interface SendEmailParams {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
}

/**
 * Sends a transactional email using the Brevo API.
 * Automatically falls back to mock logs if the API key is not configured or is a placeholder.
 */
export async function sendEmail({ to, subject, htmlContent }: SendEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@graduationplatform.org';
  const senderName = process.env.BREVO_SENDER_NAME || 'Exam Division';

  const isMock = !apiKey || 
                 apiKey.startsWith('YOUR_') || 
                 apiKey === 'placeholder' || 
                 apiKey.trim() === '' ||
                 to.some(t => 
                   t.email.endsWith('@uni.ac.lk') || 
                   t.email.endsWith('@example.com') || 
                   t.email.includes('cmb.ac.lk')
                 );

  if (isMock) {
    console.log(`[MOCK EMAIL SERVICE] Email to: ${to.map(t => t.email).join(', ')}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  HTML Content Snippet: ${htmlContent.replace(/<[^>]*>/g, '').substring(0, 150).trim()}...`);
    return { success: true, mock: true };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to,
        subject,
        htmlContent
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[BREVO API ERROR] Status ${response.status}: ${errorText}`);
      throw new Error(`Brevo API returned error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return { success: true, messageId: data.messageId };
  } catch (err: any) {
    console.error('[EMAIL DISPATCH ERROR]', err.message);
    throw err;
  }
}

/**
 * Premium responsive HTML template for OTP verification codes
 */
export function getOtpTemplate(otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 580px; margin: 40px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: #1e3a8a; padding: 32px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
          .body { padding: 40px 32px; }
          .intro { font-size: 15px; color: #334155; line-height: 1.6; margin-top: 0; }
          .otp-card { background: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0; border: 1px dashed #cbd5e1; }
          .otp-code { font-size: 32px; font-weight: 800; color: #1e3a8a; letter-spacing: 6px; font-family: Courier, monospace; margin: 0; }
          .footer { padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b; }
          .alert { color: #ef4444; font-weight: 600; margin-top: 16px; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>University Graduation Portal</h1>
          </div>
          <div class="body">
            <p class="intro">Hello student,</p>
            <p class="intro">You requested a verification code to access your Graduation Self-Service Portal. Please use the following single-use passcode:</p>
            <div class="otp-card">
              <div class="otp-code">${otp}</div>
            </div>
            <p class="intro">This code is cryptographically locked to your session and will automatically expire in <strong>5 minutes</strong>.</p>
            <p class="alert">If you did not initiate this request, please ignore this email immediately.</p>
          </div>
          <div class="footer">
            &copy; 2026 University Exam Division. This email was sent automatically.
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Premium responsive HTML template for registration onboarding links
 */
export function getMagicLinkTemplate(name: string, url: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Graduation Onboarding Portal</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 580px; margin: 40px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: #1e3a8a; padding: 32px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
          .body { padding: 40px 32px; }
          .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; }
          .text { font-size: 15px; color: #334155; line-height: 1.6; }
          .cta-area { text-align: center; margin: 36px 0; }
          .button { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 14px 28px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2); }
          .link-fallback { background: #f8fafc; border-radius: 8px; padding: 16px; font-size: 12px; color: #64748b; word-break: break-all; margin-top: 24px; border: 1px solid #e2e8f0; }
          .footer { padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>University Graduation Portal</h1>
          </div>
          <div class="body">
            <p class="greeting">Dear ${name},</p>
            <p class="text">Your academic records have been successfully verified and imported into the Graduation Registry. Registration for the upcoming convocation is now open.</p>
            <p class="text">Please click the button below to enter your secure portal, verify your billing address, confirm names translation, upload certificates documentation, and lock your seating seat number allocation:</p>
            <div class="cta-area">
              <a href="${url}" class="button" target="_blank">Access Graduation Portal</a>
            </div>
            <p class="text"><em>Note: This magic link is cryptographically tied to your email and is valid for 7 days. Do not share this email with others.</em></p>
            <div class="link-fallback">
              <strong>Button not working?</strong> Copy and paste this URL into your browser:<br>
              <span style="user-select: all;">${url}</span>
            </div>
          </div>
          <div class="footer">
            &copy; 2026 University Exam Division. This email was sent automatically.
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Premium responsive HTML template for profile rejection alerts
 */
export function getRejectionTemplate(name: string, reason: string, url: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Graduation Registration Rejected</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 580px; margin: 40px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: #b91c1c; padding: 32px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
          .body { padding: 40px 32px; }
          .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; }
          .text { font-size: 15px; color: #334155; line-height: 1.6; }
          .reason-card { background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0; padding: 20px; text-align: left; margin: 28px 0; }
          .reason-title { font-weight: 700; color: #991b1b; font-size: 14px; margin-bottom: 6px; }
          .reason-text { font-size: 13.5px; color: #7f1d1d; line-height: 1.5; margin: 0; }
          .cta-area { text-align: center; margin: 36px 0; }
          .button { display: inline-block; background-color: #dc2626; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 14px 28px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.2); }
          .footer { padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Graduation Registry Correction Alert</h1>
          </div>
          <div class="body">
            <p class="greeting">Dear ${name},</p>
            <p class="text">Upon review by the Exam Division Coordinator, your graduation registration details have been <strong>rejected and unlocked for editing</strong>.</p>
            <div class="reason-card">
              <div class="reason-title">Reason for spelling or document rejection:</div>
              <p class="reason-text">${reason}</p>
            </div>
            <p class="text">Your profile has been temporarily unlocked. Please click the button below to log back into your portal, edit your details, upload correct documentation (photographs/payment slips), and re-submit your registration for confirmation:</p>
            <div class="cta-area">
              <a href="${url}" class="button" target="_blank">Correct Registration Details</a>
            </div>
          </div>
          <div class="footer">
            &copy; 2026 University Exam Division. This email was sent automatically.
          </div>
        </div>
      </body>
    </html>
  `;
}
