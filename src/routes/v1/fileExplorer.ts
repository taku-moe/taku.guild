import express, { Request, Response } from "express";
import { fetchDirectoryStats, getFirstFile, safeJoin, saveFile, fetchFileStats, createDirectoriesIfNotExist, recursiveDelete } from "../../logic";
import fs from "fs";
import { ICreateDirectoryRequest, IDeleteRequest, IListDirectoryRequest, IListDirectoryResponse, IMoveRequest, IUploadRequest } from "../../types";
import { File } from "@taku.moe/types";
import { settings } from "../../settings";
import { upload } from "../../middleware/explorerUpload";

type IRequest<T = any, P = any> = Request<P, {}, T>;
type IResponse<T = any> = Response<T | {code: string, error?: any}>;

const router = express.Router();

router.post("/ls", async (req: IRequest<IListDirectoryRequest>, res: IResponse<IListDirectoryResponse>) => {
  fetchDirectoryStats(safeJoin(req.body.path))
    .then(files => res.status(200).json({ files }))
    .catch(() => res.status(404).send({code: 'dir.notFoundException'}));
});

router.delete("/rm", async (req: IRequest<IDeleteRequest>, res: IResponse<{}>)=> {
  recursiveDelete(safeJoin(req.body.path))
    .then(() => res.status(200).send())
    .catch(error => res.status(404).send({code: 'file.notFoundException', error}));
});

router.put("/mkdir", async (req: IRequest<ICreateDirectoryRequest>, res: IResponse<{}>) => {
  createDirectoriesIfNotExist(safeJoin(req.body.path))
    .then(() => res.status(200).send())
    .catch(error => res.status(404).send({code: 'directory.creationFailException', error}));
});

router.post("/mv", async (req: IRequest<IMoveRequest>, res: IResponse<{}>) => {
  const readPath = safeJoin(req.body.from);
  const writePath = safeJoin(req.body.to);

  fs.promises.rename(readPath, writePath)
    .then(() => res.status(200).send())
    .catch(error => res.status(404).send({code: 'file.notFoundException', error}));
});

router.post("/upload", upload.any(), async (req: IRequest<{ json: string }>, res: IResponse<File | File[]>) => {
  const targetFile = getFirstFile(req);
  const body = JSON.parse(req.body.json) as IUploadRequest;

  // The target location of the file.
  const targetPath = safeJoin(body.path, targetFile.originalname);

  // Save the file
  const savedFilePath = await saveFile(targetFile.path, targetPath);
  
  return res.status(201).json(await fetchFileStats(savedFilePath));
});

router.get("/download/:filepath(*)", async (req: IRequest<undefined, { filepath: string }>, res: IResponse<undefined>) => {
  return res.sendFile(req.params.filepath, { root: settings.explorer_directory });
});

export default router;
