export interface IGameRoom {
    roomName: string;
    currentGame: string;
    players: string[];
    creator: string;
    maxPlayers: number;
}