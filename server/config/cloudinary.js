const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const cloudinaryStorage = require('multer-storage-cloudinary');
const CloudinaryStorage = cloudinaryStorage.CloudinaryStorage || cloudinaryStorage;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skillsphere/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skillsphere/resumes',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw',
  },
});

const uploadAvatar = multer({ storage: avatarStorage });
const uploadResume = multer({ storage: resumeStorage });

module.exports = { cloudinary, uploadAvatar, uploadResume };