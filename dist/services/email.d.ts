import nodemailer from 'nodemailer';
declare const transporter: nodemailer.Transporter<import("nodemailer/lib/smtp-transport").SentMessageInfo, import("nodemailer/lib/smtp-transport").Options>;
export declare const sendInvitationEmail: (to: string, inviterName: string, subscriptionName: string, shareAmount: number, currency: string, acceptUrl: string) => Promise<void>;
export declare const sendAcceptanceConfirmationEmail: (to: string, subscriberName: string, subscriptionName: string, shareAmount: number, currency: string) => Promise<void>;
export declare const sendWelcomeEmail: (to: string, name: string, subscriptionName: string, shareAmount: number, currency: string) => Promise<void>;
export default transporter;
//# sourceMappingURL=email.d.ts.map