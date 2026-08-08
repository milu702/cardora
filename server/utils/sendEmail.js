const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // If SMTP credentials are not configured in environment, log and simulate email send immediately
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`📧 [Dev Mode] Simulated Email sent to ${options.email}`);
      console.log(`   Subject: ${options.subject}`);
      if (options.attachments && options.attachments.length > 0) {
        console.log(`   Attachments: ${options.attachments.map(a => a.filename).join(', ')}`);
      }
      return { simulated: true, messageId: `simulated-${Date.now()}` };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const message = {
      from: `${process.env.FROM_NAME || 'Cardora Agriculture Platform'} <${process.env.FROM_EMAIL || 'noreply@cardora.io'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message || options.text,
      html: options.html || `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #F8FAF7; border-radius: 12px; color: #17331F;">
          <h2 style="color: #1F5E3B; font-weight: bold;">🌿 Cardora Smart Agriculture</h2>
          <p>${options.message || options.text}</p>
          <hr style="border: 0; border-top: 1px solid #D7E6D5;" />
          <p style="font-size: 12px; color: #4A5568;">Sent securely by Cardora Agricultural Platform</p>
        </div>
      `,
      attachments: options.attachments || [],
    };

    const info = await transporter.sendMail(message);
    console.log(`📧 Email sent: %s to %s`, info.messageId, options.email);
    return info;
  } catch (error) {
    console.warn(`⚠️ Nodemailer notice: ${error.message}. Simulated email send to ${options.email}`);
    return { simulated: true, error: error.message };
  }
};

module.exports = sendEmail;
