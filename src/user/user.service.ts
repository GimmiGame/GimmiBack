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
import { IUser } from "../_interfaces/IUser";
import { SignUpDTO } from "./dto/request/SignUpDTO";
import { AuthCredentialsDTO } from "./dto/request/AuthCredentialsDTO";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { IToken } from "../_interfaces/IToken";
import { IPayload } from "../_interfaces/IPayload";
import { UserStatusEnum } from "../_enums/user-status-enum";
import { UserRequestResponseDTO } from "./dto/response/UserRequestResponseDTO";
import { FriendListService } from "../friend-list/friend-list.service";

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>, private jwtService : JwtService, private friendListService : FriendListService) { }

  async create(signUpDTO : SignUpDTO) : Promise<IToken> {

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

    //CREATE THE TOKEN
    const payload = {
      pseudo: createdUser.pseudo,
      subject: createdUser._id
    }
    const generatedToken: IToken = {
      token: this.jwtService.sign(payload)
    }

    //Init user table linked attributes (important)
    this.initUserattributes(createdUser.pseudo);

    //Update the user status
    await this.updateUserStatus(createdUser.pseudo, UserStatusEnum.ONLINE);

    return generatedToken;
  }

  async signIn(authCredentialsDTO : AuthCredentialsDTO) : Promise<IToken>{

    const isUserValid = await this.isUserValid(authCredentialsDTO.pseudo, authCredentialsDTO.password);

    if(!isUserValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user : IUser = await this.userModel.findOne({pseudo: authCredentialsDTO.pseudo});

    const payload : IPayload = {
      pseudo: user.pseudo,
      subject: user._id,

    }

    const generatedToken: IToken = {
      token: this.jwtService.sign(payload)
    }

    //Update the user status
    await this.updateUserStatus(user.pseudo, UserStatusEnum.ONLINE);

    return generatedToken;
    //return 'User ' + user.pseudo + ' successfully connected';
  }

  async signOut(pseudo: string) : Promise<string> {
    await this.updateUserStatus(pseudo, UserStatusEnum.OFFLINE);
    return 'User ' + pseudo + ' successfully disconnected';
  }

  async getAllUsers() : Promise<UserRequestResponseDTO[]> {
    let users : IUser[];
    try{
      users = await this.userModel.find();
    }catch(error) {
      Logger.log('No users found\n Details => ' + error);
    }

    const usersResponse : UserRequestResponseDTO[] = users.map(user => {
      return {
        _id: user._id,
        pseudo: user.pseudo,
        email: user.email,
        description: user.description,
        status: user.status
      }
    })

    return usersResponse;
  }

  async getUserByPseudo(pseudo: string) : Promise<UserRequestResponseDTO> {
    let user : IUser;
    try{
      user = await this.userModel.findOne({pseudo: pseudo});
    }catch(error) {
      Logger.log('No user found\n Details => ' + error);
    }

    const userResponse : UserRequestResponseDTO = {
      _id: user._id,
      pseudo: user.pseudo,
      email: user.email,
      description: user.description,
      status: user.status
    }

    return userResponse;
  }





  //PRIVATE METHODS


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

  private async updateUserStatus(pseudo: string, status: string) : Promise<void> {
    const user = await this.userModel.findOne({pseudo: pseudo});
    if(!user) {
      throw new NotFoundException('User ' + pseudo + ' not found');
    }

    user.status = status;
    await user.save();
  }

  private initUserattributes(pseudo : string) : void {
    this.friendListService.createFriendList(pseudo)
  }

}
