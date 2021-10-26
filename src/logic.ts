import { readdir, stat, rename } from "fs/promises";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { File } from "@taku.moe/types";
import { settings } from "./settings";

export class APIError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Removes the extension from a filepath
 */
export const baseFileName = (targetPath: string) => {
  return path.basename(targetPath).replace(/\.[^/.]+$/, "");
};

/**
 * Gets all the files in a directory
 */
export const fetchDirectoryStats = async (targetPath: string): Promise<File[]> => {
  const filenames = await readdir(targetPath);
  const files = await Promise.all(filenames.map(async (filename) => fetchFileStats(targetPath + "/" + filename)));
  return files;
};

/**
 * Recursively deletes folders trol
 */
export const recursiveDelete = async (targetPath: string) => {
  if(!fs.existsSync(targetPath)) return;

  fs.readdirSync(targetPath).forEach(file => {
    const currentPath = targetPath + "/" + file;
    if(fs.statSync(currentPath).isDirectory()) {
      recursiveDelete(currentPath);
    } 
    fs.unlinkSync(currentPath);
  });

  fs.rmdirSync(targetPath);
};

/**
 * Gets details for a file at a given path
 */
export const fetchFileStats = async (targetPath: string): Promise<File> => {
  const parsed = path.parse(targetPath);
  const stats = await stat(targetPath);
  const is_directory = stats.isDirectory();
  const file = {
    filename: parsed.name,
    size: stats.size,
    date_created: stats.birthtimeMs,
    date_modified: stats.mtimeMs,
    // TODO: Make this be the userID that uploaded this file
    uploaded_by: undefined,
    is_directory,
    extension: parsed.ext,
    download_link: ""
  };

  if (!file.is_directory){
    file.download_link = `${settings.hostname}/v1/download/${targetPath.substr(settings.explorer_directory.length)}`;
  }

  return file;
};

/**
 * Renames the garbage 9824192H4812H48912B491BH files multer saves
 * to the original file name the file had and returns the final path
 */
export const saveFile = async (tempPath: string, targetPath: string) => {
  await createDirectoriesIfNotExist(path.dirname(targetPath));
  await rename(tempPath, targetPath);
  return targetPath;
};

/**
 * Checks if a directory exists
 */
export const checkIfDirectoryExists = async (directoryPath: string) => {
  try {
    await fs.promises.stat(directoryPath);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * This function recursively creates nested
 * directories if they do not exist
 */
export const createDirectoriesIfNotExist = async (directoryPath: string) => {
  if (!(await checkIfDirectoryExists(directoryPath))) {
    await fs.promises.mkdir(directoryPath, { recursive: true });
  }
};

/**
 * Ensures that the user is not trying to escape root
 */
export const safeJoin = (...paths: string[]): string => {
  try {
    const out = path.join(settings.explorer_directory, ...paths);
    if (out.indexOf(path.normalize(settings.explorer_directory)) !== 0) {
      return "";
    }
    return out;
  } catch (error) {
    return "";
    
  }
};

/**
 * Gets the first file from a multipart form data
 */
export const getFirstFile = (req: Request) => {
  const files = req.files as Express.Multer.File[];
  const targetFile = files[0];
  if (!targetFile) throw new APIError(404, "sus file requestus");
  return targetFile;
};