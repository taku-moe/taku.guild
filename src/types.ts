import { File } from "@taku.moe/types";

export interface IListDirectoryRequest {
  path: string;
}
export type ICreateDirectoryRequest = IListDirectoryRequest;
export type IDownloadRequest = IListDirectoryRequest;
export type IDeleteRequest = IListDirectoryRequest;

export type IListDirectoryResponse = File[];

export interface IUploadRequest {
  path: string;
}

export interface IMoveRequest {
  from: string;
  to: string;
}