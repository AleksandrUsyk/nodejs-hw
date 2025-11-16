import { Session } from '../models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/time.js';
import crypto from 'crypto';

export const createSession = async (userId) => {
  // 1. Генеруємо ОБИДВА токени як випадкові рядки
  const accessToken = crypto.randomBytes(32).toString('base64');
  const refreshToken = crypto.randomBytes(32).toString('base64');

  // 2. Встановлюємо час життя
  const accessTokenValidUntil = new Date(Date.now() + FIFTEEN_MINUTES);
  const refreshTokenValidUntil = new Date(Date.now() + ONE_DAY);

  // 3. Створюємо сесію в БД
  const session = await Session.create({
    userId,
    accessToken, // Зберігаємо випадковий рядок
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return session;
};

export const setSessionCookies = (res, session) => {
  const isProd = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true,
    secure: isProd, // только HTTPS на проде
    sameSite: isProd ? 'none' : 'lax', // кросс-домен на проде, lax на локале
  };

  res.cookie('accessToken', session.accessToken, {
    ...cookieOptions,
    maxAge: FIFTEEN_MINUTES,
  });

  res.cookie('refreshToken', session.refreshToken, {
    ...cookieOptions,
    maxAge: ONE_DAY,
  });

  res.cookie('sessionId', session._id, {
    ...cookieOptions,
    maxAge: ONE_DAY,
  });
};
