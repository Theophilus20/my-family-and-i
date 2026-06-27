// lib/email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'My Family and I <noreply@myfamilyandi.xyz>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'myfamilyandi00@gmail.com';

const emailWrapper = (content) => `
  <div style="background: #F0F7F4; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <div style="max-width: 560px; margin: 0 auto;">

      <!-- Logo / Brand -->
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 22px; font-weight: 800; color: #14281E;">My Family <span style="color: #4ABA8B;">and I</span></span>
      </div>

      <!-- Card -->
      <div style="background: #ffffff; border-radius: 20px; padding: 40px 36px; box-shadow: 0 4px 24px rgba(20,40,30,0.08);">
        ${content}
      </div>

      <!-- Footer -->
      <p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 24px;">
        © 2024 My Family and I. All rights reserved.<br/>
        <span style="font-size: 11px;">You're receiving this email because you have an account with us.</span>
      </p>

    </div>
  </div>
`;

const iconCircle = (letter) => `
  <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #4ABA8B, #3A9A72); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
    <span style="color: white; font-size: 22px; font-weight: 800; line-height: 1;">${letter}</span>
  </div>
`;

const primaryButton = (href, label) => `
  <a href="${href}" style="display: inline-block; background: linear-gradient(135deg, #4ABA8B, #3A9A72); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(74,186,139,0.35);">${label}</a>
`;

const infoBox = (text) => `
  <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 16px 20px; margin-top: 28px;">
    <p style="font-size: 13px; color: #166534; margin: 0; line-height: 1.6;">${text}</p>
  </div>
`;

const divider = () => `<hr style="border: none; border-top: 1px solid #E5E7EB; margin: 28px 0;" />`;

/**
 * Send professional notification to admin and auto-reply to user
 */
export async function sendContactEmails(senderName, senderEmail, message) {
  const submittedAt = new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
  });

  const adminHtml = emailWrapper(`
    <div style="text-align: center; margin-bottom: 32px;">
      ${iconCircle('✉')}
      <h1 style="font-size: 22px; font-weight: 800; color: #14281E; margin: 0;">New Message Received</h1>
      <p style="font-size: 13px; color: #9ca3af; margin: 8px 0 0;">Received on ${submittedAt} UTC</p>
    </div>

    <div style="margin-bottom: 20px;">
      <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #4ABA8B; margin: 0 0 6px;">From</p>
      <p style="font-size: 15px; font-weight: 600; color: #14281E; margin: 0;">${senderName}</p>
      <p style="font-size: 13px; color: #6b7280; margin: 2px 0 0;">${senderEmail}</p>
    </div>

    ${divider()}

    <div style="margin-bottom: 28px;">
      <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #4ABA8B; margin: 0 0 10px;">Message</p>
      <div style="font-size: 14px; line-height: 1.7; color: #374151; background: #F9FAFB; padding: 18px 20px; border-radius: 12px; border: 1px solid #F3F4F6;">
        ${message.replace(/\n/g, '<br>')}
      </div>
    </div>

    <div style="text-align: center;">
      ${primaryButton(`mailto:${senderEmail}`, 'Reply to ${senderName}')}
    </div>
  `);

  const userHtml = emailWrapper(`
    <div style="text-align: center; margin-bottom: 32px;">
      ${iconCircle('✓')}
      <h1 style="font-size: 22px; font-weight: 800; color: #14281E; margin: 0;">Message Received!</h1>
      <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0;">We'll get back to you shortly.</p>
    </div>

    <p style="font-size: 15px; color: #374151; line-height: 1.7;">Hi <strong>${senderName.split(' ')[0]}</strong>,</p>
    <p style="font-size: 15px; color: #374151; line-height: 1.7;">Thanks for reaching out! We've received your message and our team will get back to you within <strong>1–2 business days</strong>.</p>

    ${infoBox('This is an automated confirmation. You don\'t need to do anything else — we\'ll reply to your email directly.')}
  `);

  return Promise.all([
    resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      replyTo: senderEmail,
      subject: `New Contact: ${senderName}`,
      html: adminHtml,
    }),
    resend.emails.send({
      from: FROM,
      to: senderEmail,
      subject: 'We received your message!',
      html: userHtml,
    }),
  ]);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, resetLink) {
  const html = emailWrapper(`
    <div style="text-align: center; margin-bottom: 32px;">
      ${iconCircle('#')}
      <h1 style="font-size: 22px; font-weight: 800; color: #14281E; margin: 0;">Reset Your Password</h1>
      <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0;">We received a request to reset your password.</p>
    </div>

    <p style="font-size: 15px; color: #374151; line-height: 1.7;">Click the button below to create a new password. This link expires in <strong>1 hour</strong>.</p>

    <div style="text-align: center; margin: 32px 0;">
      ${primaryButton(resetLink, 'Reset Password')}
    </div>

    ${divider()}

    ${infoBox('If you didn\'t request a password reset, you can safely ignore this email. Your password will remain unchanged.')}
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
export async function sendVerificationEmail(email, verificationLink) {
  const html = emailWrapper(`
    <div style="text-align: center; margin-bottom: 32px;">
      ${iconCircle('✓')}
      <h1 style="font-size: 22px; font-weight: 800; color: #14281E; margin: 0;">Verify Your Email</h1>
      <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0;">One last step to activate your account.</p>
    </div>

    <p style="font-size: 15px; color: #374151; line-height: 1.7;">Hi there,</p>
    <p style="font-size: 15px; color: #374151; line-height: 1.7;">Thanks for signing up! Please verify your email address to activate your account and start preserving your family's legacy.</p>

    <div style="text-align: center; margin: 32px 0;">
      ${primaryButton(verificationLink, 'Verify My Email')}
    </div>

    ${divider()}

    ${infoBox('If you didn\'t create an account with My Family and I, you can safely ignore this email.')}
  `);

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Verify your email address',
    html,
  });
}

/**
 * Send family invite email
 */
export async function sendFamilyInviteEmail(inviteEmail, ownerName, role, inviteToken) {
  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteToken}`;

  const html = emailWrapper(`
    <div style="text-align: center; margin-bottom: 32px;">
      ${iconCircle('+')}
      <h1 style="font-size: 22px; font-weight: 800; color: #14281E; margin: 0;">You're Invited!</h1>
      <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0;">Someone wants to share their family vault with you.</p>
    </div>

    <p style="font-size: 15px; color: #374151; line-height: 1.7;">Hi there,</p>
    <p style="font-size: 15px; color: #374151; line-height: 1.7;"><strong>${ownerName}</strong> has invited you to view their family vault on <strong>My Family and I</strong> as a <strong>${role}</strong>.</p>

    <div style="text-align: center; margin: 32px 0;">
      ${primaryButton(inviteLink, 'Accept Invitation')}
    </div>

    ${divider()}

    ${infoBox('If you weren\'t expecting this invite, you can safely ignore this email. No account will be created without your action.')}
  `);

  return resend.emails.send({
    from: FROM,
    to: inviteEmail,
    subject: `${ownerName} invited you to their family vault`,
    html,
  });
}