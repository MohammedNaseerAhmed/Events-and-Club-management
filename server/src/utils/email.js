import nodemailer from 'nodemailer';

// Create transporter (you'll need to configure this with your email service)
const createTransporter = () => {
  // For development, you can use a test account or configure with real SMTP
  if (process.env.NODE_ENV === 'development') {
    // Using Ethereal Email for development (creates test accounts)
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'ethereal.pass'
      }
    });
  }
  
  // For production, use your actual email service
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

export const sendEmail = async (emailData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@vnrvjiet.com',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

export const sendWelcomeEmail = async (userEmail, userName) => {
  const emailData = {
    to: userEmail,
    subject: 'Welcome to VNR VJIET Clubs!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to VNR VJIET Clubs!</h2>
        <p>Hello ${userName},</p>
        <p>Welcome to our clubs platform! You can now explore events, join clubs, and stay updated with campus activities.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Get Started:</h3>
          <ul>
            <li>Browse available clubs</li>
            <li>Register for events</li>
            <li>Stay updated with notifications</li>
          </ul>
        </div>
        <p>Best regards,<br>VNR VJIET Clubs Team</p>
      </div>
    `
  };
  
  return sendEmail(emailData);
};

export const sendRecruitmentEmail = async (userEmail, userName, clubName, message) => {
  const emailData = {
    to: userEmail,
    subject: `Join ${clubName} - VNR VJIET`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Join ${clubName}!</h2>
        <p>Hello ${userName},</p>
        <p>You've been invited to join <strong>${clubName}</strong> at VNR VJIET.</p>
        <p>${message || 'We have exciting events and activities planned for our members!'}</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Club Information:</h3>
          <p><strong>Club:</strong> ${clubName}</p>
        </div>
        <p>To join our club, please register at: <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/register">Register Here</a></p>
        <p>Best regards,<br>${clubName} Team</p>
      </div>
    `
  };
  
  return sendEmail(emailData);
};
