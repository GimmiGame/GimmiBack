import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IUser } from "../interfaces/IUser";
import { SignUpDTO } from "./dto/request/SignUpDTO";
import { AuthCredentialsDTO } from "./dto/request/AuthCredentialsDTO";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) { }

  async create(signUpDTO : SignUpDTO) : Promise<IUser> {

   //Check if the user already exists
    const isUserExistant : boolean = await this.isUserExistant(signUpDTO.pseudo);
    if(isUserExistant) {
      throw new ConflictException('User ' + signUpDTO.pseudo + ' already exists. Connect with your password or change your pseudo.');
    }

    //CREATE WITH THE PASSWORD ENCRYPTED
    const encryptedPassword = await bcrypt.hash(signUpDTO.password, 10);
    const newUser = new this.userModel({
      ...signUpDTO,
      password: encryptedPassword,
    })

    //SAVE THE USER
    let createdUser;
    try{
      createdUser = await newUser.save();
    }catch(error) {
      throw new InternalServerErrorException('Error while saving the user')
    }

    return createdUser ;
  }

  async signIn(authCredentialsDTO : AuthCredentialsDTO){
    let user : IUser;
    const isUserValid = await this.isUserValid(authCredentialsDTO.pseudo, authCredentialsDTO.password);

    if(!isUserValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    //GET THE USER
    try{
      user = await this.userModel.findOne({pseudo: authCredentialsDTO.pseudo});
    }catch(error) {
      throw new InternalServerErrorException('Error while getting the user')
    }

    //TODO : RETURN THE TOKEN + User.status.Connected

    //UPDATE THE USER STATUS

    //UPDATE THE USER TOKEN

    //RETURN THE USER

    return 'User ' + user.pseudo + ' successfully connected';
  }



  private async isUserExistant(pseudo: string) : Promise<boolean> {
    const userExistant : IUser = await this.userModel.findOne({pseudo: pseudo});
    if(userExistant) {
      return true;
    }
    return false;
  }

  private async isUserValid(pseudo: string, password: string) : Promise<boolean> {

    //CHECK IF THE USER EXISTS
    const user = await this.userModel.findOne({pseudo: pseudo});
    if(!user) {
      return false ;
    }

    //CHECK IF THE PASSWORD IS CORRECT
    const hasGoodCredentials = await bcrypt.compare(password, user.password);
    if(!hasGoodCredentials) {
      return false ;
    }

    return true ;
  }
}
