const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const multer = require('multer');

// @desc    Upload single image
// @route   POST /api/upload
// @access  Public
router.post('/', (req, res) => {
    // Wrap upload in a function to handle errors explicitly
    const uploadSingle = upload.single('file');

    uploadSingle(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred (e.g. File too large)
            console.error("Multer Error:", err);
            return res.status(400).json({ 
                success: false, 
                message: `Lỗi upload: ${err.message}`,
                code: err.code 
            });
        } else if (err) {
            // An unknown error occurred (e.g. File type filter)
            console.error("Unknown Upload Error:", err);
            return res.status(400).json({ 
                success: false, 
                message: err.message || 'Lỗi không xác định khi upload ảnh.' 
            });
        }

        // Check if file is present
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'Không tìm thấy file gửi lên. Vui lòng kiểm tra lại.' 
            });
        }

        try {
            // Construct the full URL
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

            res.status(200).json({
                success: true,
                data: {
                    url: fileUrl,
                    filename: req.file.filename,
                    mimetype: req.file.mimetype,
                    size: req.file.size
                }
            });
        } catch (processError) {
            console.error("Processing Error:", processError);
            res.status(500).json({ success: false, message: 'Lỗi xử lý file sau khi upload.' });
        }
    });
});

module.exports = router;