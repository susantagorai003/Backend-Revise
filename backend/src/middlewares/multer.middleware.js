const multer = require("multer");
const path = require("path");
const fs = require("fs");

const tempPath = path.join(process.cwd(), "public", "temp");

// Create directory if it doesn't exist
if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempPath);
    },

    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage
});

module.exports = upload;