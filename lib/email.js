// lib/email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'My Family and I <noreply@myfamilyandi.xyz>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'myfamilyandi00@gmail.com';

const emailWrapper = (content) => `
  <div style="background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; padding: 40px 20px;">
    <div style="max-width: 520px; margin: 0 auto;">

      <!-- Brand -->
      <div style="margin-bottom: 32px;">
        <span style="font-size: 18px; font-weight: 800; color: #14281E;">My Family <span style="color: #4ABA8B;">and I</span></span>
      </div>

      <!-- Content -->
      ${content}

      <!-- Footer -->
      <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.6;">
          © 2024 My Family and I. All rights reserved.<br/>
          You're receiving this because you have an account with us.
        </p>
      </div>

    </div>
  </div>
`;

const primaryButton = (href, label) => `
  <a href="${href}" style="display: inline-block; background: #4ABA8B; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 24px 0;">${label}</a>
`;

const infoBox = (text) => `
  <p style="font-size: 12px; color: #9ca3af; margin: 24px 0 0; line-height: 1.6;">${text}</p>
`;

/**
 * Send contact emails to admin and user
 */
export async function sendContactEmails(senderName, senderEmail, message) {
  const submittedAt = new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
  });

  const adminHtml = emailWrapper(`
    <h1 style="font-size: 20px; font-weight: 700; color: #14281E; margin: 0 0 8px;">New message from ${senderName}</h1>
    <p style="font-size: 14px; color: #6b7280; margin: 0 0 32px;">${submittedAt} UTC</p>

    <p style="font-size: 13px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 4px;">From</p>
    <p style="font-size: 15px; color: #14281E; font-weight: 600; margin: 0 0 4px;">${senderName}</p>
    <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px;">${senderEmail}</p>

    <p style="font-size: 13px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 8px;">Message</p>
    <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0 0 32px; white-space: pre-wrap;">${message}</p>

    ${primaryButton(`mailto:${senderEmail}`, `Reply to ${senderName}`)}
  `);

  const userHtml = emailWrapper(`
    <h1 style="font-size: 20px; font-weight: 700; color: #14281E; margin: 0 0 16px;">We got your message.</h1>
    <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0 0 16px;">Hi ${senderName.split(' ')[0]},</p>
    <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0;">Thanks for reaching out. We'll get back to you within 1–2 business days.</p>
    ${infoBox('This is an automated confirmation. No action needed.')}
  `);

  return Promise.all([
    resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      replyTo: senderEmail,
      subject: `New message from ${senderName}`,
      html: adminHtml,
    }),
    resend.emails.send({
      from: FROM,
      to: senderEmail,
      subject: 'We received your message',
      html: userHtml,
    }),
  ]);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, resetLink) {
  const html = emailWrapper(`
    <h1 style="font-size: 20px; font-weight: 700; color: #14281E; margin: 0 0 16px;">Reset your password</h1>
    <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0 0 8px;">Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>

    ${primaryButton(resetLink, 'Reset password')}

    ${infoBox("If you didn't request this, you can safely ignore this email. Your password won't change.")}
  `);

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Reset your password',
    html,
  });
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(email, name, verifyToken, plan) {
  const base = 'https://myfamilyandi.xyz';
  const planParam = plan ? `&plan=${plan}` : '';
  const verificationLink = `${base}/verify?token=${verifyToken}${planParam}`;

  const html = emailWrapper(`
    <h1 style="font-size: 20px; font-weight: 700; color: #14281E; margin: 0 0 16px;">Confirm your email address</h1>
    <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0 0 8px;">Hi ${name},</p>
    <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0 0 8px;">Please verify your email to activate your account and start preserving your family's legacy.</p>

    ${primaryButton(verificationLink, 'Verify my email')}

    <p style="font-size: 13px; color: #9ca3af; margin: 16px 0 0; line-height: 1.6;">
      Or paste this link into your browser:<br/>
      <a href="${verificationLink}" style="color: #4ABA8B; word-break: break-all;">${verificationLink}</a>
    </p>

    ${infoBox("If you didn't create an account with My Family and I, you can safely ignore this email.")}
  `);

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Confirm your email address',
    html,
  });
}

/**
 * Send family invite email
 */
export async function sendFamilyInviteEmail(inviteEmail, ownerName, role, inviteToken) {
  const inviteLink = `https://myfamilyandi.xyz/invite/${inviteToken}`;

  const html = emailWrapper(`
    <h1 style="font-size: 20px; font-weight: 700; color: #14281E; margin: 0 0 16px;">You've been invited</h1>
    <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0 0 8px;">Hi there,</p>
    <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0 0 8px;"><strong>${ownerName}</strong> has invited you to access their family vault on <strong>My Family and I</strong> as a <strong>${role}</strong>.</p>

    ${primaryButton(inviteLink, 'Accept invitation')}

    ${infoBox("If you weren't expecting this, you can safely ignore it. No account will be created without your action.")}
  `);

  return resend.emails.send({
    from: FROM,
    to: inviteEmail,
    subject: `${ownerName} invited you to their family vault`,
    html,
  });
}