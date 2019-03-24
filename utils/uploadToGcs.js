module.exports = (req, bucket) => {
  return new Promise((resolve, reject) => {
    if (!req.file) {
      return reject("No file uploaded");
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
      return reject(err);
    });

    // event listener when the uploading is finished
    fileStream.on("finish", () => {
      // Public url for directly fetching the file
      req.file.publicUrl = `https://storage.googleapis.com/${bucket.name}/${
        file.name
      }`;

      return resolve(req.file.publicUrl);
    });

    fileStream.end(req.file.buffer);
  });
};
