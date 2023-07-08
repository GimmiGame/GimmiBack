import * as mongoose from "mongoose";
import RequestStatusEnum from "../_enums/request-status-enum";
import { Types } from "mongoose";

 export const FriendRequestSchema = new mongoose.Schema({
  from: {
    type: Types.ObjectId,
    required: true,
    ref: "User",
  },
  to: {
    type: Types.ObjectId,
    required: true,
    ref: "User",
  },
  sendingDate: {
    type: String,
  },
  status: {
    type: String,
    default: RequestStatusEnum.PENDING,
  }
});





