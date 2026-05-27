"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = exports.sendAcceptanceConfirmationEmail = exports.sendInvitationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
});
const sendInvitationEmail = async (to, inviterName, subscriptionName, shareAmount, currency, acceptUrl) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="38" fill="white" fill-opacity="0.2"/>
                    <path d="M25 35L35 45L55 28" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                      <animate attributeName="stroke-dasharray" from="0 100" to="100 100" dur="0.8s" fill="freeze"/>
                    </path>
                    <circle cx="40" cy="40" r="20" fill="none" stroke="white" stroke-width="2" stroke-dasharray="4 4">
                      <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="10s" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  <h1 style="color: white; margin: 20px 0 10px; font-size: 28px;">You're Invited!</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Join a shared subscription</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi there!</p>
                  <p style="color: #333; font-size: 16px; line-height: 1.6;">
                    <strong style="color: #667eea;">${inviterName}</strong> has invited you to share a subscription to:
                  </p>
                  <div style="background: linear-gradient(135deg, #f0f4ff 0%, #f8f0ff 100%); border-left: 4px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h2 style="color: #333; margin: 0 0 10px; font-size: 22px;">${subscriptionName}</h2>
                    <p style="color: #666; margin: 0;">Your share: <strong style="color: #667eea; font-size: 20px;">${currency} ${shareAmount.toFixed(2)}</strong></p>
                  </div>
                  <p style="color: #333; font-size: 16px; line-height: 1.6;">To accept this invitation, click the button below:</p>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; text-align: center;">
                        <a href="${acceptUrl}" style="display: inline-block; padding: 16px 40px; color: white; text-decoration: none; font-weight: 600; font-size: 16px;">Accept Invitation</a>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #999; font-size: 14px; line-height: 1.6;">If the button doesn't work, copy and paste this link into your browser:</p>
                  <p style="color: #667eea; font-size: 14px; word-break: break-all;">${acceptUrl}</p>
                </td>
              </tr>
              <tr>
                <td style="background: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                  <p style="color: #999; font-size: 12px; margin: 0;">This invitation was sent by SubsDay. If you didn't expect this email, you can safely ignore it.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
    await transporter.sendMail({
        from: `"SubsDay" <${process.env.SMTP_USER}>`,
        to,
        subject: `You're invited to share ${subscriptionName} on SubsDay!`,
        html: htmlContent,
    });
};
exports.sendInvitationEmail = sendInvitationEmail;
const sendAcceptanceConfirmationEmail = async (to, subscriberName, subscriptionName, shareAmount, currency) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="38" fill="white" fill-opacity="0.2"/>
                    <path d="M25 40L35 50L55 30" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
                      <animate attributeName="stroke-dasharray" from="0 100" to="100 100" dur="0.6s" fill="freeze"/>
                    </path>
                    <circle cx="40" cy="40" r="30" fill="none" stroke="white" stroke-width="1" opacity="0.5">
                      <animate attributeName="r" values="30;35;30" dur="2s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  <h1 style="color: white; margin: 20px 0 10px; font-size: 28px;">Invitation Accepted!</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">You're now part of the subscription</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #333; font-size: 16px; line-height: 1.6;">Great news!</p>
                  <p style="color: #333; font-size: 16px; line-height: 1.6;">
                    <strong>${subscriberName}</strong> has accepted your invitation to share:
                  </p>
                  <div style="background: linear-gradient(135deg, #f0fff4 0%, #f0fdf4 100%); border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h2 style="color: #333; margin: 0 0 10px; font-size: 22px;">${subscriptionName}</h2>
                    <p style="color: #666; margin: 0;">Their share: <strong style="color: #10b981; font-size: 20px;">${currency} ${shareAmount.toFixed(2)}</strong></p>
                  </div>
                  <p style="color: #333; font-size: 16px; line-height: 1.6;">You can now manage your shared subscription from your SubsDay dashboard.</p>
                </td>
              </tr>
              <tr>
                <td style="background: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                  <p style="color: #999; font-size: 12px; margin: 0;">This notification was sent by SubsDay.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
    await transporter.sendMail({
        from: `"SubsDay" <${process.env.SMTP_USER}>`,
        to,
        subject: `${subscriberName} accepted your invitation for ${subscriptionName}!`,
        html: htmlContent,
    });
};
exports.sendAcceptanceConfirmationEmail = sendAcceptanceConfirmationEmail;
const sendWelcomeEmail = async (to, name, subscriptionName, shareAmount, currency) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="20" width="35" height="25" rx="4" fill="white" fill-opacity="0.9">
                      <animate attributeName="y" values="20;18;20" dur="2s" repeatCount="indefinite"/>
                    </rect>
                    <rect x="55" y="20" width="35" height="25" rx="4" fill="white" fill-opacity="0.9">
                      <animate attributeName="y" values="20;22;20" dur="2s" repeatCount="indefinite"/>
                    </rect>
                    <path d="M45 30L50 32.5L45 35" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
                    </path>
                  </svg>
                  <h1 style="color: white; margin: 20px 0 10px; font-size: 28px;">Welcome to ${subscriptionName}!</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">You're all set up</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi <strong style="color: #667eea;">${name}</strong>!</p>
                  <p style="color: #333; font-size: 16px; line-height: 1.6;">
                    Welcome to your shared subscription for <strong>${subscriptionName}</strong>!
                  </p>
                  <div style="background: linear-gradient(135deg, #f0f4ff 0%, #f8f0ff 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #666; font-size: 14px;">Your monthly share</span>
                        </td>
                        <td style="text-align: right; padding: 8px 0;">
                          <span style="color: #667eea; font-size: 24px; font-weight: bold;">${currency} ${shareAmount.toFixed(2)}</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <p style="color: #333; font-size: 16px; line-height: 1.6;">
                    Log in to your SubsDay account to view all your subscriptions, set up reminders, and manage your shared plans.
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; padding: 16px 40px; color: white; text-decoration: none; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="background: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                  <p style="color: #999; font-size: 12px; margin: 0;">Enjoy your shared subscription with SubsDay!</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
    await transporter.sendMail({
        from: `"SubsDay" <${process.env.SMTP_USER}>`,
        to,
        subject: `Welcome to ${subscriptionName} on SubsDay!`,
        html: htmlContent,
    });
};
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.default = transporter;
//# sourceMappingURL=email.js.map