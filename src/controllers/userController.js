import createHttpError from 'http-errors';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { User } from '../models/user.js';

export const updateUserAvatar = async (req, res, next) => {
  try {
    // Проверяем, что файл пришёл
    if (!req.file || !req.file.buffer) {
      throw createHttpError(400, 'No file');
    }

    // Проверяем авторизованного пользователя
    if (!req.user || !req.user._id) {
      throw createHttpError(401, 'Unauthorized');
    }

    // Загружаем в Cloudinary
    let uploadResult;
    try {
      uploadResult = await saveFileToCloudinary(req.file.buffer);
    } catch {
      throw createHttpError(500, 'Failed to upload avatar, please try again');
    }

    const avatarUrl = uploadResult.secure_url;

    // Обновляем пользователя
    await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true },
    );

    res.status(200).json({ url: avatarUrl });
  } catch (err) {
    next(err);
  }
};
