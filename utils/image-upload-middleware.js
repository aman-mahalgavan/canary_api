const { bucket } = require("../configure/image-upload-setup");

module.exports = (req, res, next) => {
  if (!req.file) {
    next("No file uploaded");
  }

  // Create a new file for uploading

  const file = bucket.file(req.file.originalname);
  file.name = `${req.file.fieldname}-${Date.now()}`;

  const fileStream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  });

  // Catching errors for the file upload

  fileStream.on("error", err => {
    next(err);
    return;
  });

  // event listener when the uploading is finished
  fileStream.on("finish", () => {
    // Public url for directly fetching the file
    req.file.publicUrl = `https://storage.googleapis.com/${bucket.name}/${
      file.name
    }`;

    next();
    return;
  });

  fileStream.end(req.file.buffer);
};
