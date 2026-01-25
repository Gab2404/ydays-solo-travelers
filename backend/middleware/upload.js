const multer = require('multer');
const path = require('path');
const fs = require('fs');

// S'assurer que le dossier uploads existe
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Nom unique : timestamp + extension
    const name = file.originalname.split(' ').join('_').split('.')[0];
    const extension = path.extname(file.originalname);
    cb(null, name + Date.now() + extension);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;