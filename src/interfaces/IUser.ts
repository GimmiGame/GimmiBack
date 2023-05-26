export interface IUser {
  _id: string;
  pseudo: string;
  email: string;
  password: string;
  description: string;
  friendList: string[];
  status: string;
}