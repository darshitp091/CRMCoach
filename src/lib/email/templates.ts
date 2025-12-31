interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const emailTemplates = {
  trialEnding: (daysLeft: number, userName: string, plan: string): EmailTemplate => ({
    subject: `Your CoachCRM trial ends in ${daysLeft} days`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Your Trial is Ending Soon</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Your <strong>${plan} Plan</strong> trial will end in <strong>${daysLeft} days</strong>.</p>
              <p>To continue enjoying all the features without interruption, your payment method will be charged automatically when the trial ends.</p>
              <p><strong>What happens next:</strong></p>
              <ul>
                <li>Your subscription will automatically activate</li>
                <li>You'll continue to have full access to all features</li>
                <li>No action needed from you!</li>
              </ul>
              <p>If you'd like to change your plan or update your payment method:</p>
              <a href="https://coachcrm.com/dashboard/billing" class="button">Manage Subscription</a>
            </div>
            <div class="footer">
              <p>CoachCRM - Professional Coaching Management</p>
              <p>© 2025 CoachCRM. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${userName},\n\nYour ${plan} Plan trial will end in ${daysLeft} days.\n\nTo continue enjoying all the features without interruption, your payment method will be charged automatically when the trial ends.\n\nWhat happens next:\n- Your subscription will automatically activate\n- You'll continue to have full access to all features\n- No action needed from you!\n\nIf you'd like to change your plan or update your payment method, visit: https://coachcrm.com/dashboard/billing\n\nCoachCRM - Professional Coaching Management\n© 2025 CoachCRM. All rights reserved.`,
  }),

  paymentSuccess: (userName: string, amount: number, plan: string, nextBillingDate: string): EmailTemplate => ({
    subject: 'Payment Successful - CoachCRM',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .invoice-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb; }
            .invoice-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
            .total { font-size: 18px; font-weight: bold; color: #10b981; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payment Successful!</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Thank you for your payment! Your subscription has been renewed successfully.</p>

              <div class="invoice-box">
                <h3>Payment Details</h3>
                <div class="invoice-row">
                  <span>Plan:</span>
                  <strong>${plan} Plan</strong>
                </div>
                <div class="invoice-row">
                  <span>Amount Paid:</span>
                  <strong>₹${amount.toLocaleString()}</strong>
                </div>
                <div class="invoice-row">
                  <span>Next Billing Date:</span>
                  <strong>${nextBillingDate}</strong>
                </div>
                <div class="invoice-row total">
                  <span>Status:</span>
                  <span style="color: #10b981;">● Active</span>
                </div>
              </div>

              <p>Your subscription is now active and you have full access to all features.</p>
              <a href="https://coachcrm.com/dashboard/billing" class="button">View Invoice</a>
            </div>
            <div class="footer">
              <p>Need help? Contact us at support@coachcrm.com</p>
              <p>© 2025 CoachCRM. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${userName},\n\nThank you for your payment! Your subscription has been renewed successfully.\n\nPayment Details:\n- Plan: ${plan} Plan\n- Amount Paid: ₹${amount.toLocaleString()}\n- Next Billing Date: ${nextBillingDate}\n- Status: Active\n\nYour subscription is now active and you have full access to all features.\n\nView your invoice at: https://coachcrm.com/dashboard/billing\n\nNeed help? Contact us at support@coachcrm.com\n© 2025 CoachCRM. All rights reserved.`,
  }),

  paymentFailed: (userName: string, amount: number, plan: string, retryDate: string): EmailTemplate => ({
    subject: '⚠️ Payment Failed - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .warning-box { background: #fef2f2; border: 2px solid #fecaca; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Payment Failed</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>We were unable to process your payment for the <strong>${plan} Plan</strong> subscription.</p>

              <div class="warning-box">
                <h3 style="color: #dc2626; margin-top: 0;">Action Required</h3>
                <p><strong>Amount Due:</strong> ₹${amount.toLocaleString()}</p>
                <p><strong>We'll retry on:</strong> ${retryDate}</p>
                <p>Please update your payment method to avoid service interruption.</p>
              </div>

              <p><strong>Common reasons for payment failure:</strong></p>
              <ul>
                <li>Insufficient funds</li>
                <li>Expired or invalid card</li>
                <li>Bank declined the transaction</li>
              </ul>

              <p>Update your payment method now to keep your subscription active:</p>
              <a href="https://coachcrm.com/dashboard/billing" class="button">Update Payment Method</a>

              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                If payment fails after all retry attempts, your account will be downgraded to the free plan.
              </p>
            </div>
            <div class="footer">
              <p>Need help? Contact us at support@coachcrm.com</p>
              <p>© 2025 CoachCRM. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${userName},\n\nWe were unable to process your payment for the ${plan} Plan subscription.\n\nAction Required:\n- Amount Due: ₹${amount.toLocaleString()}\n- We'll retry on: ${retryDate}\n\nPlease update your payment method to avoid service interruption.\n\nCommon reasons for payment failure:\n- Insufficient funds\n- Expired or invalid card\n- Bank declined the transaction\n\nUpdate your payment method at: https://coachcrm.com/dashboard/billing\n\nIf payment fails after all retry attempts, your account will be downgraded to the free plan.\n\nNeed help? Contact us at support@coachcrm.com\n© 2025 CoachCRM. All rights reserved.`,
  }),

  welcomeEmail: (userName: string, plan: string, trialDays: number): EmailTemplate => ({
    subject: 'Welcome to CoachCRM! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .feature-box { background: white; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #667eea; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to CoachCRM!</h1>
              <p style="font-size: 18px; margin: 10px 0;">You're all set up and ready to go</p>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Welcome to CoachCRM! We're excited to have you on board.</p>
              <p>You're starting your <strong>${trialDays}-day free trial</strong> of the <strong>${plan} Plan</strong>. No credit card charged yet!</p>

              <h3>What you can do now:</h3>

              <div class="feature-box">
                <strong>👥 Add Your Clients</strong>
                <p>Start by adding your coaching clients to the system</p>
              </div>

              <div class="feature-box">
                <strong>📅 Schedule Sessions</strong>
                <p>Book and manage coaching sessions with your clients</p>
              </div>

              <div class="feature-box">
                <strong>👨‍💼 Invite Your Team</strong>
                <p>Add team members and assign them roles</p>
              </div>

              <div class="feature-box">
                <strong>📊 Track Progress</strong>
                <p>Monitor client progress and analyze your business metrics</p>
              </div>

              <a href="https://coachcrm.com/dashboard" class="button">Go to Dashboard</a>

              <p style="margin-top: 30px;"><strong>Need help getting started?</strong></p>
              <p>Check out our <a href="https://coachcrm.com/docs">documentation</a> or contact our support team at support@coachcrm.com</p>
            </div>
            <div class="footer">
              <p>Happy coaching! 🚀</p>
              <p>© 2025 CoachCRM. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${userName},\n\nWelcome to CoachCRM! We're excited to have you on board.\n\nYou're starting your ${trialDays}-day free trial of the ${plan} Plan. No credit card charged yet!\n\nWhat you can do now:\n\n👥 Add Your Clients\nStart by adding your coaching clients to the system\n\n📅 Schedule Sessions\nBook and manage coaching sessions with your clients\n\n👨‍💼 Invite Your Team\nAdd team members and assign them roles\n\n📊 Track Progress\nMonitor client progress and analyze your business metrics\n\nGo to your dashboard: https://coachcrm.com/dashboard\n\nNeed help getting started?\nCheck out our documentation at https://coachcrm.com/docs or contact support@coachcrm.com\n\nHappy coaching! 🚀\n© 2025 CoachCRM. All rights reserved.`,
  }),

  teamInvitation: (inviterName: string, organizationName: string, role: string, inviteLink: string): EmailTemplate => ({
    subject: `You've been invited to join ${organizationName} on CoachCRM`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .role-badge { display: inline-block; background: #667eea; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🤝 Team Invitation</h1>
            </div>
            <div class="content">
              <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on CoachCRM!</p>

              <p>You've been assigned the role of:</p>
              <div class="role-badge">${role.toUpperCase()}</div>

              <p>CoachCRM is a professional coaching management platform that helps teams:</p>
              <ul>
                <li>Manage clients and coaching sessions</li>
                <li>Track progress and goals</li>
                <li>Collaborate with team members</li>
                <li>Analyze business performance</li>
              </ul>

              <a href="${inviteLink}" class="button">Accept Invitation</a>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This invitation will expire in 7 days.
              </p>
            </div>
            <div class="footer">
              <p>© 2025 CoachCRM. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `${inviterName} has invited you to join ${organizationName} on CoachCRM!\n\nYou've been assigned the role of: ${role.toUpperCase()}\n\nCoachCRM is a professional coaching management platform that helps teams:\n- Manage clients and coaching sessions\n- Track progress and goals\n- Collaborate with team members\n- Analyze business performance\n\nAccept your invitation: ${inviteLink}\n\nThis invitation will expire in 7 days.\n\n© 2025 CoachCRM. All rights reserved.`,
  }),
};
