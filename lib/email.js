// lib/email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'My Family and I <noreply@myfamilyandi.xyz>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'myfamilyandi00@gmail.com';

/**
 * Send professional notification to admin and auto-reply to user
 */
export async function sendContactEmails(senderName, senderEmail, message) {
  const submittedAt = new Date().toLocaleString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric', 
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC' 
  });

  const adminHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff; color: #111827;">
      <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 24px; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 800; margin: 0; color: #111827;">New Message</h1>
        <p style="font-size: 14px; color: #6b7280; margin: 8px 0 0;">Received on ${submittedAt} UTC</p>
      </div>
      
      <div style="margin-bottom: 32px;">
        <div style="margin-bottom: 20px;">
          <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #4ABA8B; margin: 0 0 4px;">From</p>
          <p style="font-size: 16px; margin: 0;"><strong>${senderName}</strong> (${senderEmail})</p>
        </div>
        
        <div>
          <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #4ABA8B; margin: 0 0 4px;">Message</p>
          <div style="font-size: 15px; line-height: 1.6; color: #374151; background: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #f3f4f6;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
        <a href="mailto:${senderEmail}" style="display: inline-block; background: #4ABA8B; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">Reply to Sender</a>
      </div>
    </div>
  `;

  const userHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff; color: #111827;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 48px; height: 48px; background: #4ABA8B; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <span style="color: white; font-size: 24px;">✓</span>
        </div>
        <h1 style="font-size: 24px; font-weight: 800; margin: 0;">Message Received</h1>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #374151;">Hi ${senderName.split(' ')[0]},</p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151;">Thanks for reaching out! We've received your message and our team will get back to you within 1-2 business days.</p>
      
      <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 20px; border-radius: 12px; margin: 32px 0;">
        <p style="font-size: 14px; color: #166534; margin: 0;"><strong>Note:</strong> This is an automated confirmation. You don't need to do anything else. We'll reply to your email directly.</p>
      </div>

      <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 40px;">
        © 2024 My Family and I. All rights reserved.
      </p>
    </div>
  `;

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
      subject: `We received your message!`,
      html: userHtml,
    })
  ]);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, resetLink) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff; color: #111827;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 48px; height: 48px; background: #4ABA8B; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <span style="color: white; font-size: 24px;">🔒</span>
        </div>
        <h1 style="font-size: 24px; font-weight: 800; margin: 0;">Reset Your Password</h1>
      </div>
      <p style="font-size: 16px; line-height: 1.6; color: #374151;">We received a request to reset your password. Click the button below to create a new one.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetLink}" style="display: inline-block; background: #4ABA8B; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">Reset Password</a>
      </div>
      <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 20px; border-radius: 12px; margin: 32px 0;">
        <p style="font-size: 14px; color: #166534; margin: 0;"><strong>Note:</strong> If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>
      </div>
      <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 40px;">© 2024 My Family and I. All rights reserved.</p>
    </div>
  `;

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
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff; color: #111827;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 48px; height: 48px; background: #4ABA8B; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <span style="color: white; font-size: 24px;">✓</span>
        </div>
        <h1 style="font-size: 24px; font-weight: 800; margin: 0;">Verify Your Email</h1>
      </div>
      <p style="font-size: 16px; line-height: 1.6; color: #374151;">Hi there,</p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151;">Thanks for signing up! Please verify your email address to activate your account and get started.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verificationLink}" style="display: inline-block; background: #4ABA8B; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">Verify Email</a>
      </div>
      <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 20px; border-radius: 12px; margin: 32px 0;">
        <p style="font-size: 14px; color: #166534; margin: 0;"><strong>Note:</strong> If you didn't create an account, you can safely ignore this email.</p>
      </div>
      <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 40px;">© 2024 My Family and I. All rights reserved.</p>
    </div>
  `;

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
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff; color: #111827;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 48px; height: 48px; background: #4ABA8B; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <span style="color: white; font-size: 24px; font-weight: 800;">+</span>
        </div>
        <h1 style="font-size: 24px; font-weight: 800; margin: 0;">You're Invited!</h1>
      </div>
      <p style="font-size: 16px; line-height: 1.6; color: #374151;">Hi there,</p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151;"><strong>${ownerName}</strong> has invited you to view their family vault on <strong>My Family and I</strong> as a <strong>${role}</strong>.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${inviteLink}" style="display: inline-block; background: #4ABA8B; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">Accept Invitation</a>
      </div>
      <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 20px; border-radius: 12px; margin: 32px 0;">
        <p style="font-size: 14px; color: #166534; margin: 0;"><strong>Note:</strong> If you weren't expecting this invite, you can safely ignore this email.</p>
      </div>
      <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 40px;">© 2024 My Family and I. All rights reserved.</p>
    </div>
  `;

  return resend.emails.send({
    from: FROM,
    to: inviteEmail,
    subject: `${ownerName} invited you to their family vault`,
    html,
  });
}