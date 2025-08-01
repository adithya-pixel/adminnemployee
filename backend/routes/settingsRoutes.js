const express = require('express');
const router = express.Router();
const multer = require('multer');
const Settings = require('../models/settings');
const cloudinary = require('../utils/cloudinary');

const storage = multer.memoryStorage(); //  Use memoryStorage for direct buffer upload
const upload = multer({ storage });

router.post('/upload-logo/:id', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    //  Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { folder: 'logos' },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ error: 'Cloudinary upload failed' });
        }

        // Save logo URL in DB
        const updated = await Settings.findByIdAndUpdate(
          req.params.id,
          { logoUrl: result.secure_url },
          { new: true }
        );

        res.json(updated);
      }
    );

    result.end(req.file.buffer); // Send file buffer to Cloudinary stream
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
