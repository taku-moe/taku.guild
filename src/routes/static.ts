import express from "express";
import fs from "fs";
import Jimp from "jimp";
import mimeType from 'file-type';

const SUPPORTED_JIMP_MIMES = ['image/png', 'image/jpeg', 'image/bmp']

const router = express.Router();

router.get("/:folder/:filename", async (req, res) => {
  const {w, h} = req.query;
  const {folder, filename} = req.params;

  // Get the path of the target file
  const targetPath = process.cwd() + `/uploads/${folder}/${filename}`;
  
  // If the user doesn't wanna resize
  if (!w && !h) return res.status(200).sendFile(targetPath);

  // Load the file and check for mimetype
  const file = await fs.promises.readFile(targetPath);
  const mime = await mimeType.fromBuffer(file);
  if (!mime) return res.status(500).send();

  // If Jimp can process this file then do so
  if (SUPPORTED_JIMP_MIMES.includes(mime.mime)) {
    const image = await Jimp.read(file);

    const width = parseInt(w as string);
    const height = parseInt(h as string);

    const clampedWidth = Math.min(width, image.bitmap.width);
    const clampedHeight = Math.min(height, image.bitmap.height);

    const topEdge = (image.bitmap.height - clampedHeight) * 0.5;
    const leftEdge = (image.bitmap.width - clampedWidth) * 0.5;

    if (width && height) image.crop(leftEdge, topEdge, clampedWidth, clampedHeight);
    else {
      const originalAspectRatio = image.bitmap.width / image.bitmap.height;
      
      // If the image is gonna end up having 0 width or height just send the original
      // comparison with NaN always returns false
      if (clampedWidth / originalAspectRatio < 1 || originalAspectRatio * clampedHeight < 1){
        return res.status(200).sendFile(targetPath);
      }

      else image.resize(clampedWidth || Jimp.AUTO, clampedHeight || Jimp.AUTO);
    }

    const buffer = await image.getBufferAsync(mime.mime);

    return res.writeHead(200, [['Content-Type', mime.mime]]).end(buffer);
  };

  return res.status(200).sendFile(targetPath);
});

export const staticRouter = router;
