const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Use unique filename
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

router.post("/image", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    res.status(200).json({
        success: true,
        message: "Upload successful",
        imageUrl: "http://localhost:4000" + imagePath,
    });
});

router.get('/', (req, res) => {
    res.send(`
    <html>
      <body>
        <h2>Upload an Image</h2>
        <form action="/src/upload/image" method="POST" enctype="multipart/form-data">
          <input type="file" name="image" accept="image/*" required />
          <button type="submit">Upload</button>
        </form>
      </body>
    </html>
  `);
});

module.exports = router;