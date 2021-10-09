import mongoose, { Schema } from "mongoose";
import { settings } from "../settings";
mongoose.connect(settings.database_url);

interface IMember {
  _id: string;
  member_id: string;
}

const schema = new Schema<IMember>(
  {
    _id: { type: String, required: true},
    member_id: { type: String, required: true, unique: true },
  },
  {
    versionKey: false,
  }
);

export const Member = mongoose.model<IMember>("Member", schema);