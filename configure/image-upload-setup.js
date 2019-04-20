const multer = require("multer");
const { memoryStorage } = multer;
const express = require("express");
const { Storage } = require("@google-cloud/storage");
const path = require("path");

// Instantiate a storage client
const googleCloudStorage = new Storage({
  projectId: "canary-234512",
  keyFilename: "Canary-b769603c59ad.json"
});

// Multer is required to process file uploads and make them available via
// req.files.
// const m = multer({
//   storage: memoryStorage(),
//   limits: {
//     fileSize: 5 * 1024 * 1024 // no larger than 5mb
//   }
// });

// A bucket is a container for objects (files).
const bucket = googleCloudStorage.bucket("canary_storage");

// const storage = multer.diskStorage({
//   destination: "./Frontend/public/uploads/",
//   filename: function(req, file, cb) {
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   }
// });

// Init Upload
const upload = multer({
  storage: memoryStorage(),
  limits: { fileSize: 2000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}
module.exports = { upload, bucket };
