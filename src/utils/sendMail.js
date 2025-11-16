import nodemailer from 'nodemailer';
import createHttpError from 'http-errors';

// Універсальна утиліта для надсилання листів
export const sendEmail = async (options) => {
  try {
    // Створюємо транспортер
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Перевіряємо обов’язкові поля
    if (!options.to || !options.subject || !options.html) {
      throw createHttpError(400, 'Missing required email fields');
    }

    // Формуємо лист
    const mailOptions = {
      from: process.env.SMTP_FROM,
      ...options, // to, subject, html, cc, attachments etc.
    };

    // Надсилаємо
    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw createHttpError(500, 'Failed to send email');
  }
};
