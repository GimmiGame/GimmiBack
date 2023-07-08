import * as mongoose from "mongoose";
import { UserStatusEnum } from "../_enums/user-status-enum";

export const UserSchema = new mongoose.Schema({
  pseudo: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String || null,
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
  status: {
    type: String,
    default: UserStatusEnum.OFFLINE,
  }
})





