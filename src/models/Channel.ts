import mongoose, { Schema } from "mongoose";
import { settings } from "../settings";
mongoose.connect(settings.database_url);

export type ChannelTypes = "voice" | "text";

export interface IChannel {
  name: string;
  _id: string;
  type: ChannelTypes;
}

const schema = new Schema<IChannel>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
  },
  {
    versionKey: false,
  }
);

export const Channel = mongoose.model<IChannel>("Channel", schema);
