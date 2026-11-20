
export const verificationEmailTemplate = ({ name, verificationUrl }) => ({
  subject: "Verify your Connectify account",
  text: `Hi ${name || "there"},

Welcome to Connectify! You're just one step away from connecting with students, alumni, faculty, and industry leaders.

Please copy and paste the following verification link into your browser to activate your account:
${verificationUrl}

This link will expire in 24 hours. If you did not create an account on Connectify, please ignore this email.

Best regards,
The Connectify Team`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your Connectify account</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); }
        .header { background: #2563eb; padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { color: #bfdbfe; margin: 6px 0 0 0; font-size: 14px; }
        .content { padding: 32px 28px; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #0f172a; }
        .btn-wrapper { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 36px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 16px; transition: background-color 0.2s; }
        .btn:hover { background-color: #1d4ed8; }
        .fallback { background-color: #f1f5f9; padding: 16px; border-radius: 6px; word-break: break-all; font-size: 13px; color: #475569; margin: 24px 0; }
        .footer { padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Connectify</h1>
          <p>College Alumni & Student Networking Platform</p>
        </div>
        <div class="content">
          <div class="greeting">Hi ${name || "there"},</div>
          <p>Welcome to Connectify! You're just one step away from connecting with students, alumni, faculty, and industry leaders.</p>
          <p>Please click the button below to verify your email address and activate your account:</p>
          <div class="btn-wrapper">
            <a href="${verificationUrl}" class="btn" target="_blank">Verify Email Address</a>
          </div>
          <p>This verification link will expire in <strong>24 hours</strong>. If you did not create an account on Connectify, you can safely disregard this email.</p>
          <p style="margin-top: 24px; font-size: 13px; color: #64748b;">If the button above doesn't work, copy and paste this link into your browser:</p>
          <div class="fallback">
            <a href="${verificationUrl}" style="color: #2563eb;">${verificationUrl}</a>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Connectify. All rights reserved.<br>
          Empowering alumni networks and student careers.
        </div>
      </div>
    </body>
    </html>
  `,
});

export const passwordResetEmailTemplate = ({ name, resetUrl }) => ({
  subject: "Reset your Connectify password",
  text: `Hi ${name || "there"},

We received a request to reset your password for your Connectify account.

Please copy and paste the following link into your browser to reset your password:
${resetUrl}

This password reset link will expire in 1 hour. If you did not make this request, you can safely ignore this email.

Best regards,
The Connectify Team`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset your Connectify password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); }
        .header { background: #2563eb; padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; }
        .header p { color: #bfdbfe; margin: 6px 0 0 0; font-size: 14px; }
        .content { padding: 32px 28px; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #0f172a; }
        .btn-wrapper { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background-color: #ef4444; color: #ffffff !important; padding: 14px 36px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 16px; }
        .fallback { background-color: #f1f5f9; padding: 16px; border-radius: 6px; word-break: break-all; font-size: 13px; color: #475569; margin: 24px 0; }
        .footer { padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Connectify</h1>
          <p>Password Reset Request</p>
        </div>
        <div class="content">
          <div class="greeting">Hi ${name || "there"},</div>
          <p>We received a request to reset your password for your Connectify account.</p>
          <p>Click the button below to choose a new password:</p>
          <div class="btn-wrapper">
            <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
          </div>
          <p>This password reset link will expire in <strong>1 hour</strong>. If you did not make this request, you can safely ignore this email.</p>
          <div class="fallback">
            <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Connectify. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `,
});
