import mongoose from "mongoose";

export const GameRoomSchema = new mongoose.Schema({
    roomName: {
        type: String,
        required: true,
    },
    game: {
        type: String,
        required: true
    },
    players: {
        type: [String],
        default: null
    },
    creator: {
        type: String,
    },
    gameStarted: {
        type: Boolean,
        default: false
    },
    terminated: {
        type: Boolean,
        default: false
    },
    saved: {
        type: Boolean,
        default: false
    }

})