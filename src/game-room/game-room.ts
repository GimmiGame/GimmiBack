import mongoose, { Types } from "mongoose";

export const GameRoomSchema = new mongoose.Schema({
    roomName: {
        type: String,
        required: true,
        unique: true,
    },
    currentGame: {
        //put type ObjectId with ref Game when game is created
        type: String,
    },
    players: {
        type: [Types.ObjectId],
        default: [],
        ref: "User",
    },
    creator: {
        type: Types.ObjectId,
        required: true,
        ref: "User",
    },
    maxPlayers: {
        type: Number,
        default: 20
    }

})