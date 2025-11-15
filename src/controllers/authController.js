import createHttpError from 'http-errors';
import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { sendMail } from '../utils/sendMail.js';
import { User } from '../models/user.js';

// === Request reset email ===
export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Ищем пользователя по email
    const user = await User.findOne({ email });

    // Если пользователя нет — возвращаем успех, чтобы не выдавать информацию
    if (!user) {
      return res
        .status(200)
        .json({ message: 'Password reset email sent successfully' });
    }

    // Генерируем JWT токен (15 минут жизни)
    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' },
    );

    const frontendDomain = process.env.FRONTEND_DOMAIN.replace(/\/$/, '');
    const link = `${frontendDomain}/reset-password?token=${token}`;

    // Читаем и компилируем HTML-шаблон письма
    const templatePath = path.resolve(
      'src',
      'templates',
      'reset-password-email.html',
    );
    const templateRaw = await fs.readFile(templatePath, 'utf8');
    const template = handlebars.compile(templateRaw);
    const html = template({ name: user.username || user.email, link });

    // Отправляем письмо
    try {
      await sendMail({
        to: user.email,
        subject: 'Password reset',
        html,
      });
    } catch (sendErr) {
      console.error('Error sending reset email:', sendErr);
      throw createHttpError(
        500,
        'Failed to send the email, please try again later.',
      );
    }

    return res
      .status(200)
      .json({ message: 'Password reset email sent successfully' });
  } catch (err) {
    next(err);
  }
};

// === Reset password ===
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Верифицируем токен
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next(createHttpError(401, 'Invalid or expired token'));
    }

    const { sub, email } = payload;

    // Находим пользователя
    const user = await User.findOne({ _id: sub, email });
    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }

    // Хэшируем новый пароль и сохраняем
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};
