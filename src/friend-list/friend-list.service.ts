import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger
} from "@nestjs/common";
import {Model} from "mongoose";
import { InjectModel } from '@nestjs/mongoose';
import { IFriendList } from "../interfaces/IFriendList";
import { IUser } from "../interfaces/IUser";

@Injectable()
export class FriendListService {

  constructor(@InjectModel('FriendList') private readonly friendListModel: Model<IFriendList>, @InjectModel('User') private readonly userModel: Model<IUser>) {
  }

  async getAllFriendLists(): Promise<IFriendList[]> {
    let friendLists: IFriendList[] = [];
    try {
      friendLists = await this.friendListModel.find()
        .populate('owner')
        .populate('friends')
    }
    catch (error) {
      Logger.log("No friend list found.\n Details => " + error);
    }

    friendLists = friendLists.map(friendList => {
      return {
        _id: friendList._id,
        owner: friendList.owner,
        friends: friendList.friends
      }
    })

    return friendLists;
  }

  async createFriendList(owner : string ): Promise<IFriendList> {
    const user : IUser = await this.userModel.findOne({pseudo: owner});
    if(!user) {
      throw new BadRequestException('Owner does not exist');
    }

    let newFriendList;
    //Check if friend list already exists for this user
    try {
      const existingFriendList = await this.friendListModel.findOne({ owner: user._id });

      if (existingFriendList) {
        throw new ConflictException('Friend list already exists. Useless to create a new one.');
      }

    }catch (e) {
      Logger.log("No friend list found.\n Details => " + e);
    }

    //Create new friend list
    try {
      newFriendList = new this.friendListModel({
        owner: user._id,
        friends: []
      })
    }catch (e) {
      throw new BadRequestException('Could not create friend list. Details => ' + e);
    }

    //Save new friend list
    try {
      await newFriendList.save();
    }
    catch (e) {
      throw new InternalServerErrorException('Could not save friend list. Details => ' + e);
    }

    return newFriendList;

  }


}
