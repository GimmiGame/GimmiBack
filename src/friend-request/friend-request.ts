import * as mongoose from "mongoose";
import RequestStatusEnum from "../enums/request-status-enum";

 export const FriendRequestSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
    ref: "User",
  },
  to: {
    type: String,
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





