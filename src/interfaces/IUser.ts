export interface IUser {
  _id: string;
  pseudo: string;
  email: string;
  password: string;
  description: string;
  gameSessions: string[];
  friendList: string[];
  roomPartys: string[];
  chatRooms: string[];
  userGameResults: string[];
  friendRequests: string[];
  roomPartyInvitations: string[];
  chatRoomInvitations: string[];
  status: string;
}