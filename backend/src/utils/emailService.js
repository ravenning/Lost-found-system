const nodemailer = require('nodemailer');

const sendNotificationEmail = async (user, notification) => {
  const mailOptions = {
    from: '"Lost & Found Admin" <noreply@lostandfound.com>',
    to: user.email,
    subject: notification.title,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5;">${notification.title}</h2>
        <p style="font-size: 16px; color: #334155;">${notification.message}</p>
        ${notification.link ? `<a href="http://localhost:5173${notification.link}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4f46e5; color: #fff; text-decoration: none; border-radius: 4px;">View Details</a>` : ''}
      </div>
    `
  };

  try {
    console.log(`[EMAIL MOCK] Sending email to ${user.email}: ${notification.title}`);
    // If you add real SMTP credentials to .env, you can initialize nodemailer here and send it.
    // let transporter = nodemailer.createTransport({...});
    // let info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendNotificationEmail };
