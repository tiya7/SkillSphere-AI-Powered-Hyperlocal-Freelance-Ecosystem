const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const emailTemplates = {
  verification: (name, url) => ({
    subject: 'Verify your SkillSphere account',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #0f172a; font-size: 28px; margin: 0;">Skill<span style="color: #3b82f6;">Sphere</span></h1>
          </div>
          <h2 style="color: #1e293b; font-size: 22px;">Welcome, ${name}! 👋</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            Thanks for joining SkillSphere! Please verify your email address to activate your account.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}" style="background: #3b82f6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 14px; text-align: center;">
            This link expires in 24 hours. If you didn't create an account, you can ignore this email.
          </p>
        </div>
      </div>
    `,
  }),

  passwordReset: (name, url) => ({
    subject: 'Reset your SkillSphere password',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #0f172a; font-size: 28px; margin: 0;">Skill<span style="color: #3b82f6;">Sphere</span></h1>
          </div>
          <h2 style="color: #1e293b;">Password Reset Request</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            Hi ${name}, we received a request to reset your password. Click the button below to create a new password.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}" style="background: #ef4444; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 14px; text-align: center;">
            This link expires in 1 hour. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      </div>
    `,
  }),

  welcome: (name, role) => ({
    subject: 'Welcome to SkillSphere! 🚀',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #0f172a; font-size: 28px; margin: 0;">Skill<span style="color: #3b82f6;">Sphere</span></h1>
          </div>
          <h2 style="color: #1e293b;">You're all set, ${name}! 🎉</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            Your email has been verified. Your account as a <strong>${role}</strong> is now active.
          </p>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            ${role === 'freelancer'
              ? 'Complete your profile, add your skills, and start applying to gigs!'
              : 'Post your first gig and find the perfect freelancer today!'}
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.CLIENT_URL}/dashboard" style="background: #3b82f6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  }),
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

const sendVerificationEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  const template = emailTemplates.verification(user.name, url);
  await sendEmail({ to: user.email, ...template });
};

const sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const template = emailTemplates.passwordReset(user.name, url);
  await sendEmail({ to: user.email, ...template });
};

const sendWelcomeEmail = async (user) => {
  const template = emailTemplates.welcome(user.name, user.role);
  await sendEmail({ to: user.email, ...template });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
