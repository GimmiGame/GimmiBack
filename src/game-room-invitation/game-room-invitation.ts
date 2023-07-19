import mongoose, { Types } from "mongoose";
import RequestStatusEnum from "src/_enums/request-status-enum";

export const GameInvitationSchema = new mongoose.Schema({
    gameRoom: {
        type: Types.ObjectId,
        required: true,
        ref: "GameRoom",
    },
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
    status: {
        type: String,
        default: RequestStatusEnum.PENDING,
    }
})




