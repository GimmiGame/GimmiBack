import * as mongoose from "mongoose";
import { Types } from "mongoose";

export const FriendListSchema = new mongoose.Schema({
  owner : {
    type: Types.ObjectId,
    required: true,
    ref: "User",
  },
  friends: {
    type: [Types.ObjectId],
    default: [],
    ref: "User",
  }
})

