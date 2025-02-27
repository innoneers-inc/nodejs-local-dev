const { format } = require("util");
const { badRequest } = require("boom");
const express = require("express");

const { Storage } = require("@google-cloud/storage");
const Multer = require("multer");
const { verifyToken } = require("../middlewares");

const router = express.Router({ mergeParams: true });

const storage = new Storage();

// Multer is required to process file uploads and make them available via
// req.files.
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

// A bucket is a container for objects (files).
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

router.use([verifyToken]);

// Process the file upload and upload to Google Cloud Storage.
router.post("/", multer.single("file"), (req, res, next) => {
  if (!req.file) {
    next(badRequest("No file uploaded."));
    return;
  }

  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(`${req.user.username}/${req.file.originalname}`);
  const blobStream = blob.createWriteStream({
    resumable: false,
  });

  blobStream.on("error", (err) => {
    next(err);
  });

  blobStream.on("finish", () => {
    // The public URL can be used to directly access the file via HTTP.
    res.status(200).json({
      name: req.file.originalname,
    });
  });

  blobStream.end(req.file.buffer);
});

// Get list of all files from specific user folder.
router.get("/", async (req, res, next) => {
  const folder = req.user.username;

  try {
    const [files] = await bucket.getFiles({ prefix: `${folder}/` });
    const fileNames = files.map((file) => {
      return file.name.split(folder + "/")[1];
    });
    res.status(200).json({ files: fileNames });
  } catch (err) {
    next(err);
  }
});

// Process the file upload and upload to Google Cloud Storage.
router.get("/:fileName", (req, res, next) => {
  const folder = req.user.username;
  const fileName = req.params.fileName;
  const file = bucket.file(`${folder}/${fileName}`);

  file
    .createReadStream()
    .on("error", (err) => {
      next(err);
    })
    .pipe(res);
});

module.exports = router;
