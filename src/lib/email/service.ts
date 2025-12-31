import { emailTemplates } from './templates';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.EMAIL_API_KEY || '';
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@coachcrm.com';
  }

  /**
   * Send email using your preferred email service
   * This is a placeholder - integrate with Resend, SendGrid, or AWS SES
   */
  private async sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
    // TODO: Integrate with your email service provider
    // Example with Resend:
    /*
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.fromEmail,
        to,
        subject,
        html,
        text,
      }),
    });

    return response.ok;
    */

    // For now, just log (remove in production)
    console.log('Email would be sent:', { to, subject });
    return true;
  }

  /**
   * Send trial ending notification
   */
  async sendTrialEndingNotification(
    email: string,
    userName: string,
    daysLeft: number,
    plan: string
  ): Promise<boolean> {
    const template = emailTemplates.trialEnding(daysLeft, userName, plan);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send payment success notification
   */
  async sendPaymentSuccessNotification(
    email: string,
    userName: string,
    amount: number,
    plan: string,
    nextBillingDate: string
  ): Promise<boolean> {
    const template = emailTemplates.paymentSuccess(userName, amount, plan, nextBillingDate);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send payment failed notification
   */
  async sendPaymentFailedNotification(
    email: string,
    userName: string,
    amount: number,
    plan: string,
    retryDate: string
  ): Promise<boolean> {
    const template = emailTemplates.paymentFailed(userName, amount, plan, retryDate);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    email: string,
    userName: string,
    plan: string,
    trialDays: number = 7
  ): Promise<boolean> {
    const template = emailTemplates.welcomeEmail(userName, plan, trialDays);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send team invitation email
   */
  async sendTeamInvitation(
    email: string,
    inviterName: string,
    organizationName: string,
    role: string,
    inviteLink: string
  ): Promise<boolean> {
    const template = emailTemplates.teamInvitation(inviterName, organizationName, role, inviteLink);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }
}

export const emailService = new EmailService();
