import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendOtpEmail = async ({ email, otp, purpose, name }) => {
  const transporter = createTransporter();

  const title = purpose === 'signup' ? 'Verify Your Account' : 'Login Verification Code';
  const subtitle = purpose === 'signup'
    ? 'Use the verification code below to complete your TaskFlow account registration.'
    : 'Use the verification code below to log in to your TaskFlow account.';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 40px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
        .logo { text-align: center; margin-bottom: 24px; }
        .logo-text { font-size: 26px; font-weight: 800; color: #4f46e5; letter-spacing: -0.5px; }
        .title { font-size: 20px; font-weight: 700; color: #0f172a; text-align: center; margin-bottom: 8px; }
        .subtitle { font-size: 14px; color: #64748b; text-align: center; margin-bottom: 32px; line-height: 1.5; }
        .otp-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 28px; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #4f46e5; margin: 0; font-family: monospace; }
        .warning { font-size: 13px; color: #94a3b8; text-align: center; line-height: 1.5; }
        .footer { font-size: 12px; color: #cbd5e1; text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <span class="logo-text">TaskFlow</span>
        </div>
        <div class="title">${title}</div>
        <div class="subtitle">${name ? `Hi <strong>${name}</strong>,<br>` : ''}${subtitle}</div>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <div class="warning">
          This code is valid for <strong>5 minutes</strong>. If you did not request this email, please ignore it.
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} TaskFlow Inc. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"TaskFlow Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `[TaskFlow] ${otp} is your ${purpose === 'signup' ? 'registration' : 'login'} verification code`,
    html,
  };

  await transporter.sendMail(mailOptions);
};
