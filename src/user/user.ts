import * as mongoose from "mongoose";
import { UserStatusEnum } from "../enums/user-status-enum";
export const UserSchema = new mongoose.Schema({
  pseudo: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
    default: null,
  },
  password: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "Hello, I'm a new user !",
  },
  gameSessions:{
    type: [String],
  },
  friendList : {
    type: [String],
  },
  roomPartys: {
    type: [String],
  },
  chatRooms:{
    type: [String],
  },
  userGameResults:{
    type: [String],
  },
  friendRequests:{
    type: [String],
  },
  roomPartyInvitations:{
    type: [String],
  },
  chatRoomInvitations:{
    type: [String],
  },
  status: {
    type: String,
    default: UserStatusEnum.OFFLINE,
  }
})
