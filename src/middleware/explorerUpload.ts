import multer from "multer";
const storage = multer.diskStorage({
  destination: "./uploads/temp",
  filename: (req, file, next) => {
    const uniqueKey = Date.now();
    const fileName = file.originalname.replace(/\s/g, "_");
    next(null, `${uniqueKey}-${fileName}`);
  },
});
export const upload = multer({ storage });
