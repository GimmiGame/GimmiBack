import { IUser } from "./IUser";

export interface IFriendList {
  _id: string,
  owner: IUser,
  friends: IUser[]
}