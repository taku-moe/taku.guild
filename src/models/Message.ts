import mongoose, { Schema } from "mongoose";
import { settings } from "../settings";
mongoose.connect(settings.database_url);

export interface IAttachment {
  name: string;
  link: string;
}

export class Attachment implements IAttachment {
  public name: string;
  public link: string;

  constructor(file: Express.Multer.File) {
    this.name = file.originalname;
    this.link = `${settings.hostname}/static/${file.filename}`;
  }
}

export interface IMessage extends mongoose.Document, IWSMessage {
  _id: string;
  created_at: number;
}

export interface IWSMessage {
  content?: string;
  attachments?: Attachment[];
  channel_id: string;
  author_id: string;
  replying_to?: string;
}

const schema = new Schema<IMessage>(
  {
    // The message's ID
    _id: { type: String, required: true },
    // Epoch when the message is sent
    created_at: { type: Number, required: true },
    // The text content of the message
    content: { type: String },
    // The attachment array that contains urls to the attachments of the message
    // @ts-ignore
    attachments: { type: Array },
    // The id of the channel where the message was sent
    channel_id: { type: String, required: true },
    // The id of the user who sent the message
    author_id: { type: String, required: true },
    // The message they are replying to if any
    replying_to: {type: String, required: false},
  },
  {
    versionKey: false,
  }
);

export const Message = mongoose.model<IMessage>("Message", schema);
