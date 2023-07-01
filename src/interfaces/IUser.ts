export interface IUser {
  _id: string;
  pseudo: string;
  email: string | null
  password: string;
  description: string | null ;
  status: string;
}