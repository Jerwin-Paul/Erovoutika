import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// Your verified domain email or use Resend's test email for development
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const FROM_NAME = process.env.FROM_NAME || 'Attendance System';

interface SendPasswordResetEmailParams {
  to: string;
  userName: string;
  resetUrl: string;
  systemName?: string;
  schoolName?: string;
}

export async function sendPasswordResetEmail({
  to,
  userName,
  resetUrl,
  systemName = 'Attendance Monitoring System',
  schoolName = 'Your School',
}: SendPasswordResetEmailParams): Promise<{ success: boolean; error?: string }> {
  
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return { success: false, error: 'Email service not configured' };
  }

  const firstName = userName.split(' ')[0];

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: `Reset Your Password - ${systemName}`,
      html: generatePasswordResetEmailHTML({
        firstName,
        resetUrl,
        systemName,
        schoolName,
      }),
      text: generatePasswordResetEmailText({
        firstName,
        resetUrl,
        systemName,
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Password reset email sent successfully:', data?.id);
    return { success: true };
  } catch (err) {
    console.error('Failed to send password reset email:', err);
    return { success: false, error: 'Failed to send email' };
  }
}

// HTML Email Template
function generatePasswordResetEmailHTML({
  firstName,
  resetUrl,
  systemName,
  schoolName,
}: {
  firstName: string;
  resetUrl: string;
  systemName: string;
  schoolName: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                🔐 Password Reset Request
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                ${systemName} • ${schoolName}
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong>${firstName}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Security Notice -->
              <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                  ⏰ <strong>This link expires in 1 hour</strong> for your security.<br>
                  If you didn't request this reset, you can safely ignore this email.
                </p>
              </div>
              
              <!-- Alternative Link -->
              <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 0; padding: 12px; background-color: #f4f4f5; border-radius: 6px; word-break: break-all;">
                <a href="${resetUrl}" style="color: #4f46e5; font-size: 12px; text-decoration: none;">
                  ${resetUrl}
                </a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.5;">
                This is an automated message from ${systemName}.<br>
                Please do not reply to this email.
              </p>
              <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} ${schoolName}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// Plain Text Email Template (fallback)
function generatePasswordResetEmailText({
  firstName,
  resetUrl,
  systemName,
}: {
  firstName: string;
  resetUrl: string;
  systemName: string;
}): string {
  return `
Hi ${firstName},

We received a request to reset your password for ${systemName}.

Click the link below to reset your password:
${resetUrl}

⏰ This link expires in 1 hour for your security.

If you didn't request this password reset, you can safely ignore this email.

---
This is an automated message. Please do not reply to this email.
`.trim();
}
