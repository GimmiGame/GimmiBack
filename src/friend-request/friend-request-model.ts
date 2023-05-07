import * as mongoose from 'mongoose';
import RequestStatusEnum from "../enums/request-status-enum";
export const FriendRequestSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  sendingDate: {
    type: String,
  },
  status: {
    type: String,
    default: RequestStatusEnum.PENDING,
  },
});

export interface FriendRequestModel {
  _id: string,
  from: string,
  to: string,
  sendingDate: string,
  status: string
}
