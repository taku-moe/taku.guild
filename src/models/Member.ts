import mongoose, { Schema } from "mongoose";

interface IMember {
  _id: string;
  member_id: string;
}

const schema = new Schema<IMember>(
  {
    _id: { type: String, required: true },
    member_id: { type: String, required: true, unique: true },
  },
  {
    versionKey: false,
  }
);

export const Member = mongoose.model<IMember>("Member", schema);
