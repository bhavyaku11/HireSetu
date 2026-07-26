import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const originalName = file.originalname || '';
  const fileExt = originalName.split('.').pop().toLowerCase();

  const isPdf = file.mimetype === 'application/pdf' || fileExt === 'pdf';
  const isDocx =
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.mimetype === 'application/docx' ||
    fileExt === 'docx';

  if (isPdf || isDocx) {
    cb(null, true);
  } else {
    const err = new Error('Invalid file type. Only PDF and DOCX files are allowed.');
    err.code = 'INVALID_FILE_TYPE';
    cb(err, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter,
}).any();

export const handleFileUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size exceeds maximum limit of 5MB' });
        }
        if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ message: 'Only a single file upload is allowed' });
        }
        return res.status(400).json({ message: `File upload error: ${err.message}` });
      } else if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No file provided' });
    }

    if (req.files.length > 1) {
      return res.status(400).json({ message: 'Only a single file upload is allowed' });
    }

    req.file = req.files[0];
    next();
  });
};

import path from 'path';
import fs from 'fs';

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads/avatars');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const userId = req.user ? req.user.id : 'anon';
    const uniqueSuffix = `avatar-${userId}-${Date.now()}${ext}`;
    cb(null, uniqueSuffix);
  },
});

const avatarFileFilter = (req, file, cb) => {
  const originalName = file.originalname || '';
  const fileExt = originalName.split('.').pop().toLowerCase();
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];

  if (allowedMimeTypes.includes(file.mimetype) || allowedExts.includes(fileExt)) {
    cb(null, true);
  } else {
    const err = new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    err.code = 'INVALID_FILE_TYPE';
    cb(err, false);
  }
};

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max
  },
  fileFilter: avatarFileFilter,
}).any();

export const handleAvatarUpload = (req, res, next) => {
  avatarUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size exceeds maximum limit of 2MB' });
        }
        if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ message: 'Only a single image upload is allowed' });
        }
        return res.status(400).json({ message: `File upload error: ${err.message}` });
      } else if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    if (req.files.length > 1) {
      return res.status(400).json({ message: 'Only a single image upload is allowed' });
    }

    req.file = req.files[0];
    next();
  });
};
