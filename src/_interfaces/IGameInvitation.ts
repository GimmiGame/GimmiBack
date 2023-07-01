export interface IGameInvitation {
    _id: string
    gameRoomID: string;
    from: string;
    to: string;
    sendingDate: string;
    status: string;
}
