import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

export const saveFileToCloudinary = async (buffer) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log('☁️ Cloudinary config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Not set',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not set',
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'avatars',
        resource_type: 'image',

        // ⭐ Обов'язкові параметри згідно ТЗ
        overwrite: true,
        unique_filename: false,
        // або замість цього можна use_filename: true
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('✅ Cloudinary upload result:', result.secure_url);
          resolve(result);
        }
      },
    );

    Readable.from(buffer).pipe(stream);
  });
};
