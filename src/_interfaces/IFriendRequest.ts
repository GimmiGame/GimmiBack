import { IUser } from "./IUser";

export interface IFriendRequest {
  _id: string,
  from: IUser
  to: IUser
  sendingDate: string,
  status: string
}