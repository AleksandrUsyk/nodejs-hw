import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // базова перевірка
    if (!options.to || !options.subject || !options.html) {
      throw new Error('Missing required email fields');
    }

    const mailOptions = {
      from: options.from || process.env.SMTP_USER, // дефолт
      ...options,
    };

    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};
