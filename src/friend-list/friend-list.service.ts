import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger
} from "@nestjs/common";
import {Model} from "mongoose";
import { InjectModel } from '@nestjs/mongoose';
import { IFriendList } from "../_interfaces/IFriendList";
import { IUser } from "../_interfaces/IUser";

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

  async getOneFriendList(owner: string): Promise<IFriendList> {

    let friendList: IFriendList;
    //Check if owner exists
    const ownerUser : IUser = await this.userModel.findOne({pseudo: owner});
    if(!ownerUser) {
      throw new BadRequestException('Owner does not exist');
    }

    //Check if friend list exists for this user
    try {
      friendList = await this.friendListModel.findOne({ owner: ownerUser._id })
        .populate('owner')
        .populate('friends')
    }
    catch (error) {
      throw new InternalServerErrorException('Could not find friend list. Details => ' + error);
    }

    if(!friendList) {
      throw new BadRequestException('No friend list found for this user');
    }

    return {
      _id: friendList._id,
      owner: friendList.owner,
      friends: friendList.friends
    }

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
      throw new ConflictException(e);
    }

    //Create new friend list
    try {
      newFriendList = new this.friendListModel({
        owner: user._id,
        friends: []
      })
    }catch (e) {
      throw new BadRequestException('Could not create instance of friend list. Details => ' + e);
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

  async addFriendToList(owner: string, friend: string): Promise<IFriendList> {

    //Check if owner exists
    const ownerUser : IUser = await this.userModel.findOne({pseudo: owner});
    if(!ownerUser) {
      throw new BadRequestException('Owner does not exist');
    }

    //Check if friend exists
    const friendUser : IUser = await this.userModel.findOne({pseudo: friend});
    if(!friendUser) {
      throw new BadRequestException('Friend does not exist');
    }

    //Check if friend list exists for this user
    const existingFriendList = await this.friendListModel.findOne({ owner: ownerUser._id });
    if (!existingFriendList) {
      throw new BadRequestException('Friend list does not exist');
    }

    //Check if friend is already in friend list
    if(existingFriendList.friends.includes(friendUser._id)) {
      throw new BadRequestException('Friend is already in friend list');
    }

    //Add friend to friend list
    existingFriendList.friends.push(friendUser._id);

    //Save friend list
    try {
      await existingFriendList.save();
    }
    catch (e) {
      throw new InternalServerErrorException('Could not save friend list. Details => ' + e);
    }

    return existingFriendList;
  }

  async removeFriendFromList(owner: string, friend: string): Promise<IFriendList> {

      //Check if owner exists
      const ownerUser : IUser = await this.userModel.findOne({pseudo: owner});
      if(!ownerUser) {
        throw new BadRequestException('Owner does not exist');
      }

      //Check if friend exists
      const friendUser : IUser = await this.userModel.findOne({pseudo: friend});
      if(!friendUser) {
        throw new BadRequestException('Friend does not exist');
      }

      //Check if friend list exists for this user
      const existingFriendList = await this.friendListModel.findOne({ owner: ownerUser._id });
      if (!existingFriendList) {
        throw new BadRequestException('Friend list does not exist');
      }

      //Check if friend is already in friend list
      if(!existingFriendList.friends.includes(friendUser._id)) {
        throw new BadRequestException('Friend is not in friend list');
      }

      //Remove friend from friend list
      existingFriendList.friends = existingFriendList.friends.filter(friend => friend.toString() !== friendUser._id.toString());


    //Save friend list
      try {
        await existingFriendList.save();
      }
      catch (e) {
        throw new InternalServerErrorException('Could not save friend list. Details => ' + e);
      }

      return existingFriendList;
  }


}
