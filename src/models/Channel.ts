import mongoose, { Schema } from "mongoose";
import {Channel as IChannel} from "@taku.moe/types";

const schema = new Schema<IChannel>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
  },
  {
    versionKey: false,
  }
);

export const Channel = mongoose.model<IChannel>("Channel", schema);
