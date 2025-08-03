import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email templates
const emailTemplates = {
  'subscription-welcome': {
    subject: 'Welcome to Opsless!',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Opsless!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your DevOps automation journey starts now</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Welcome to Opsless! You've successfully subscribed to our <strong>${data.planName}</strong> plan. 
            Your subscription is now active and you have access to all the features included in your plan.
          </p>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">Your Plan Features:</h3>
            <ul style="color: #666; line-height: 1.8;">
              ${Object.entries(data.planFeatures).map(([key, value]) => {
                if (typeof value === 'boolean' && value) {
                  return `<li>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>`;
                } else if (typeof value === 'number') {
                  return `<li>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value}</li>`;
                }
                return '';
              }).join('')}
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your subscription will be active until <strong>${data.endDate}</strong>. 
            You can manage your subscription anytime from your dashboard.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you have any questions or need help getting started, don't hesitate to reach out to our support team.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Opsless Team
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2024 Opsless. All rights reserved.</p>
          <p style="margin: 10px 0 0 0;">
            <a href="${process.env.FRONTEND_URL}/support" style="color: #667eea;">Support</a> | 
            <a href="${process.env.FRONTEND_URL}/help" style="color: #667eea;">Help Center</a>
          </p>
        </div>
      </div>
    `
  },
  
  'subscription-expiring': {
    subject: 'Your Opsless subscription is expiring soon',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Subscription Expiring Soon</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Don't lose access to your DevOps automation tools</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your <strong>${data.planName}</strong> subscription will expire in <strong>${data.daysLeft} days</strong> 
            (on ${data.endDate}). To continue enjoying uninterrupted access to Opsless features, 
            please renew your subscription.
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">What happens when your subscription expires?</h3>
            <ul style="color: #856404; line-height: 1.8;">
              <li>Access to advanced features will be limited</li>
              <li>Your deployments will continue running but new deployments will be paused</li>
              <li>AI assistant and monitoring features will be disabled</li>
              <li>You'll lose access to priority support</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/pricing" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
              Renew Subscription
            </a>
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Dashboard
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If you have any questions about your subscription, feel free to contact our support team.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Opsless Team
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2024 Opsless. All rights reserved.</p>
        </div>
      </div>
    `
  },
  
  'subscription-expired': {
    subject: 'Your Opsless subscription has expired',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Subscription Expired</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Renew now to restore full access</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your <strong>${data.planName}</strong> subscription expired on <strong>${data.endDate}</strong>. 
            Your access to Opsless features has been limited.
          </p>
          
          <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #721c24; margin-top: 0;">Current Limitations:</h3>
            <ul style="color: #721c24; line-height: 1.8;">
              <li>New deployments are paused</li>
              <li>AI assistant is disabled</li>
              <li>Advanced monitoring features are limited</li>
              <li>Priority support is unavailable</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/pricing" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Renew Now
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Don't worry - your existing deployments and data are safe. Renew your subscription to restore full access.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Opsless Team
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2024 Opsless. All rights reserved.</p>
        </div>
      </div>
    `
  },
  
  'subscription-cancelled': {
    subject: 'Subscription Cancellation Confirmed',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Cancellation Confirmed</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">We're sorry to see you go</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We've confirmed the cancellation of your <strong>${data.planName}</strong> subscription.
          </p>
          
          ${data.cancelAtPeriodEnd ? `
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #0c5460; margin-top: 0;">Access Until Period End</h3>
              <p style="color: #0c5460; margin-bottom: 0;">
                You'll continue to have access to all features until <strong>${data.endDate}</strong>. 
                After that, your subscription will be deactivated.
              </p>
            </div>
          ` : `
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #0c5460; margin-top: 0;">Immediate Cancellation</h3>
              <p style="color: #0c5460; margin-bottom: 0;">
                Your subscription has been cancelled immediately. Access to premium features is now limited.
              </p>
            </div>
          `}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/pricing" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reactivate Subscription
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            We'd love to have you back! If you change your mind, you can reactivate your subscription anytime.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Opsless Team
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2024 Opsless. All rights reserved.</p>
        </div>
      </div>
    `
  },
  
  'subscription-changed': {
    subject: 'Subscription Plan Changed',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Plan Updated Successfully</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your subscription has been changed</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your subscription has been successfully changed from <strong>${data.oldPlanName}</strong> 
            to <strong>${data.newPlanName}</strong>.
          </p>
          
          <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #155724; margin-top: 0;">New Plan Features:</h3>
            <ul style="color: #155724; line-height: 1.8;">
              ${Object.entries(data.newFeatures).map(([key, value]) => {
                if (typeof value === 'boolean' && value) {
                  return `<li>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>`;
                } else if (typeof value === 'number') {
                  return `<li>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value}</li>`;
                }
                return '';
              }).join('')}
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Enjoy your new plan features! If you have any questions, our support team is here to help.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Opsless Team
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2024 Opsless. All rights reserved.</p>
        </div>
      </div>
    `
  }
};

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production: Use SMTP (Gmail, SendGrid, etc.)
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Development: Use Ethereal Email for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER || 'test@example.com',
        pass: process.env.ETHEREAL_PASS || 'testpass'
      }
    });
  }
};

// Send email function
export const sendEmail = async ({ to, subject, template, data }) => {
  try {
    const transporter = createTransporter();
    
    if (!emailTemplates[template]) {
      throw new Error(`Email template '${template}' not found`);
    }
    
    const templateData = emailTemplates[template];
    const html = templateData.html(data);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@opsless.com',
      to,
      subject: subject || templateData.subject,
      html
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Email sent (development):', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    } else {
      console.log('Email sent successfully:', info.messageId);
    }
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send custom email
export const sendCustomEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@opsless.com',
      to,
      subject,
      html,
      text
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Custom email sent (development):', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    } else {
      console.log('Custom email sent successfully:', info.messageId);
    }
    
    return info;
  } catch (error) {
    console.error('Error sending custom email:', error);
    throw error;
  }
};

export default { sendEmail, sendCustomEmail }; 