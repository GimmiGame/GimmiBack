import mongoose from "mongoose";
import RequestStatusEnum from "src/_enums/request-status-enum";

export const GameInvitationSchema = new mongoose.Schema({
    gameRoomID: {
        type: String,
        required: true,
    },
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    sendingDate: {
        type: String
    },
    status: {
        type: String,
        default: RequestStatusEnum.PENDING,
      }
})




