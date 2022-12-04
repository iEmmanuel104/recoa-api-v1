const multer = require("multer");

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  }
  else {
    cb("Please upload only images.", false);
  }
  //  allow 5 images only
  if (req.files.length > 5) {
    return cb("Only 5 images allowed", false);
  }

};

var storage = multer.diskStorage({
  destination: "images",
  filename: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error("Please upload an image."));
    }
    cb(null, `Recoa__${Date.now()}_${file.originalname}`);
    },
});


var uploadFile = multer({ storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: imageFilter });

module.exports = uploadFile;




