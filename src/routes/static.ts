import express from "express";
import fs from "fs";
import mimeType from "file-type";
const sharp = process.env.PROD ? require(process.cwd() + "/sharp") : require("sharp");

const SUPPORTED_IMAGE_MIMES = ["image/png", "image/png", "image/jpeg", "image/tiff", "image/avif", "image/webp", "image/gif"];

const router = express.Router();

router.get("/:folder/:filename", async (req, res) => {
  const { w, h } = req.query;
  const { folder, filename } = req.params;

  // Get the path of the target file
  const targetPath = process.cwd() + `/uploads/${folder}/${filename}`;

  // If the user doesn't wanna resize
  if (!w && !h) return res.status(200).sendFile(targetPath);

  // Load the file and check for mimetype
  const file = await fs.promises.readFile(targetPath);
  const mime = await mimeType.fromBuffer(file);
  if (!mime) return res.status(200).sendFile(targetPath);

  // If Jimp can process this file then do so
  if (SUPPORTED_IMAGE_MIMES.includes(mime.mime)) {
    const image = sharp(file);

    const width = parseInt(w as string) || undefined;
    const height = parseInt(h as string) || undefined;

    if (width && height) image.resize({width: width, height: height, fit: 'contain'});
    else image.resize({width: width, height: height});

    const buffer = await image.webp().toBuffer()

    return res.writeHead(200, [["Content-Type", 'image/webp']]).end(buffer);
  }

  return res.status(200).sendFile(targetPath);
});

export const staticRouter = router;
