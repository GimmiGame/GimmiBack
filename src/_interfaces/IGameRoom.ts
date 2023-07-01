export interface IGameRoom {
    _id: string;
    roomName: string;
    game: string;
    players: string[];
    creator: string;
    gameStarted: boolean;
    gameTerminated: boolean;
    gameSaved: boolean;
}