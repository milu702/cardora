const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const message = {
      from: `${process.env.FROM_NAME || 'Cardora Agriculture Platform'} <${process.env.FROM_EMAIL || 'noreply@cardora.io'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #F8FAF7; border-radius: 12px; color: #17331F;">
          <h2 style="color: #1F5E3B; font-weight: bold;">🌿 Cardora Smart Agriculture</h2>
          <p>${options.message}</p>
          <hr style="border: 0; border-top: 1px solid #D7E6D5;" />
          <p style="font-size: 12px; color: #4A5568;">Sent securely by Cardora Agricultural Platform</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(message);
    console.log(`📧 Email sent: %s`, info.messageId);
    return info;
  } catch (error) {
    console.warn(`⚠️ Nodemailer notice: ${error.message}. Simulated email send to ${options.email}`);
    return { simulated: true };
  }
};

module.exports = sendEmail;
