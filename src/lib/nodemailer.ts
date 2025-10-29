import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
  console.warn(
    'SMTP environment variables are not fully set. Email sending will be disabled.'
  );
}

// Create the transporter object
export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: parseInt(smtpPort || '587', 10),
  secure: parseInt(smtpPort || '587', 10) === 465, // true for 465, false for other ports
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

// Function to verify the connection
export const verifyNodemailerConnection = async () => {
  if (!smtpHost) return false; // Don't try if not configured
  try {
    await transporter.verify();
    console.log('Nodemailer SMTP connection verified successfully.');
    return true;
  } catch (error) {
    console.error('Nodemailer SMTP connection verification failed:', error);
    return false;
  }
};

// Re-usable email sending function
export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  if (!smtpHost) {
    console.error('Email sending disabled. SMTP not configured.');
    // In dev, you might want to log the email to the console instead:
    // console.log(`--- DEV EMAIL (Sending Disabled) ---`);
    // console.log(`To: ${to}`);
    // console.log(`Subject: ${subject}`);
    // console.log(`Body: ${html}`);
    // console.log(`-----------------------------------`);
    throw new Error('Email service is not configured on the server.');
  }

  const mailOptions = {
    from: `"CN Events" <${smtpUser}>`, // Sender address (name and email)
    to: to, // List of receivers
    subject: subject, // Subject line
    html: html, // HTML body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send password reset email.');
  }
};