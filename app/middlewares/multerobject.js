const multer = require("multer");

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  }
  else {
    cb("Please upload only images.", false);
  }
  //  allow 5 images only
  // if (req.file.length > 5) {
  //   return cb("You can upload only 5 images.", false);
  // }
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




