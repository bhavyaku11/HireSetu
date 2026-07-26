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
