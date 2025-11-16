import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { sendEmail } from '../utils/sendMail.js';
import jwt from 'jsonwebtoken';

// ----------------------- REGISTER -----------------------
export const registerUser = async (req, res, next) => {
  try {
    const { email, password, ...rest } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createHttpError(400, 'Email in use'));
    }

    // ❗ Обов’язкове явне хешування (вимога ТЗ)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      ...rest,
    });

    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

// ----------------------- LOGIN -----------------------
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(createHttpError(401, 'Invalid email or password'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(createHttpError(401, 'Invalid email or password'));
    }

    // ❗ Видаляємо стару сесію (одна сесія на юзера)
    await Session.deleteOne({ userId: user._id });

    // ❗ Створюємо нову сесію через сервіс
    const session = await createSession(user._id);

    // ❗ Встановлюємо куки через сервіс
    setSessionCookies(res, session);

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in a user!',
      data: {
        accessToken: session.accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ----------------------- REFRESH -----------------------
export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;

    if (!sessionId || !refreshToken) {
      return next(createHttpError(401, 'Session not found'));
    }

    const oldSession = await Session.findById(sessionId);
    if (!oldSession) {
      return next(createHttpError(401, 'Session not found'));
    }

    if (oldSession.refreshToken !== refreshToken) {
      return next(createHttpError(401, 'Invalid refresh token'));
    }

    if (new Date() > oldSession.refreshTokenValidUntil) {
      return next(createHttpError(401, 'Refresh token expired'));
    }

    await Session.deleteOne({ _id: sessionId });

    // ❗ Створюємо нову сесію через сервіс
    const newSession = await createSession(oldSession.userId);

    // ❗ Встановлюємо куки через сервіс
    setSessionCookies(res, newSession);

    res.status(200).json({ message: 'Session refreshed' });
  } catch (err) {
    next(err);
  }
};

// ----------------------- LOGOUT -----------------------
export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;

    if (sessionId) {
      await Session.findByIdAndDelete(sessionId);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// ----------------------- REQUEST RESET EMAIL -----------------------
export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Анти-юзер-енумерація — завжди повертаємо 200
    if (!user) {
      return res.status(200).json({
        message: 'Password reset email sent successfully',
      });
    }

    const token = jwt.sign(
      {
        sub: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' },
    );

    const resetLink = `${process.env.FRONTEND_DOMAIN}/auth/reset-password?token=${token}`;

    // ❗ Відправка email з використанням SMTP_FROM (вимога ТЗ)
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      html: `
        <p>Hello, ${user.username}</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
      from: process.env.SMTP_FROM,
    });

    res.status(200).json({
      message: 'Password reset email sent successfully',
    });
  } catch (err) {
    next(err);
  }
};

// ----------------------- RESET PASSWORD -----------------------
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next(createHttpError(401, 'Invalid or expired token'));
    }

    const user = await User.findOne({
      _id: payload.sub,
      email: payload.email,
    });

    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }

    // Хешуємо новий пароль вручну — строго за ТЗ
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (err) {
    next(err);
  }
};
