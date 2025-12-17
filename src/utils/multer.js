// utils/uploadCloudinary.js
const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig');
const normalizeFileName = require('./normalizeName');

// multer memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Chỉ cho phép JPG / PNG'));
    }
});

// tạo tên file unique
const generateUniqueName = (originalname) => {
    const base = normalizeFileName(originalname).replace(/\.[^/.]+$/, '');
    const random = Math.random().toString(36).substring(2, 8);
    return `${Date.now()}-${random}-${base}`;
};

// upload cloudinary
const uploadToCloudinary = (file, subFolder = '') => {
    if (!file) throw new Error('File không tồn tại');

    const folder = subFolder
        ? `coffee-app/${subFolder}`
        : 'coffee-app';

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: generateUniqueName(file.originalname),
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        ).end(file.buffer);
    });
};

// xóa ảnh
const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
};

module.exports = {
    upload,
    uploadToCloudinary,
    deleteFromCloudinary
};
