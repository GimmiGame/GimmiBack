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
        .populate({
          path: 'owner',
          select: 'pseudo'
        })
        .populate({
          path: 'friends',
          select: 'pseudo status'
        });
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
        .populate({
          path: 'owner',
          select: 'pseudo'
        })
        .populate({
          path: 'friends',
          select: 'pseudo status'
        });
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

  //Add friend to friend list of owner and add owner to friend list of friend
  async acceptFriendshipOfUsers(owner: string, friend: string): Promise<void> {
      //ADDING IN FIRST FRIEND LIST OF FRIEND//

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

      //Check if friend list exists for this user and create it if not
      let existingFriendList = await this.friendListModel.findOne({ owner: ownerUser._id });
      if (!existingFriendList) {
        await this.createFriendList(owner);
        existingFriendList = await this.friendListModel.findOne({ owner: ownerUser._id });
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

      //ADDING IN SECOND FRIEND LIST OF FRIEND//

      //Check if friend list exists for this user
      let existingFriendList2 = await this.friendListModel.findOne({ owner: friendUser._id });
      if (!existingFriendList2) {
        await this.createFriendList(friend);
        existingFriendList2 = await this.friendListModel.findOne({ owner: friendUser._id });
      }

      //Check if friend is already in friend list
      if(existingFriendList2.friends.includes(ownerUser._id)) {
        throw new BadRequestException('Friend is already in friend list');
      }

      //Add friend to friend list
      existingFriendList2.friends.push(ownerUser._id);

      //Save friend list
      try {
        await existingFriendList2.save();
      }
      catch (e) {
        throw new InternalServerErrorException('Could not save friend list. Details => ' + e);
      }

  }

  async suppressFriendshipOfUsers(owner: string, friend: string): Promise<void> {

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

    //Check if friend list exists for this user
    const existingFriendListFriend = await this.friendListModel.findOne({ owner: friendUser._id });
    if (!existingFriendListFriend) {
      throw new BadRequestException('Friend list does not exist');
    }

    //Check if friend is already in friend list
    if(!existingFriendListFriend.friends.includes(ownerUser._id)) {
      throw new BadRequestException('Friend is not in friend list');
    }

    //Remove friend from friend list
    existingFriendListFriend.friends = existingFriendListFriend.friends.filter(friend => friend.toString() !== ownerUser._id.toString());

    //Save friend list
    try {
      await existingFriendListFriend.save();
    }
    catch (e) {
      throw new InternalServerErrorException('Could not save friend list. Details => ' + e);
    }

  }

  //Create friend list for user
  async createFriendList(owner : string ): Promise<void> {
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

  }





  //CAN BE USEFUL SEPARATELY//
  async addFriendToList(owner: string, friend: string): Promise<void> {

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

  }

  async removeFriendFromList(owner: string, friend: string): Promise<void> {

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

  }

  //Be careful we only check if friend is in one list and return . Not in both
  async areFriends(pseudo1: string, pseudo2: string): Promise<boolean> {
    let user1;
    let user2;
    try {
      user1 = await this.userModel.findOne({pseudo: pseudo1});
      user2 = await this.userModel.findOne({pseudo: pseudo2});
    }catch(err) {
      throw new BadRequestException('Could not get users. Details => ' + err);
    }

    let friendList1;
    let friendList2;
    try {
      friendList1 = await this.getOneFriendList(user1.pseudo);
      friendList2 = await this.getOneFriendList(user2.pseudo);
    }catch(err) {
      throw new BadRequestException('Could not get friend lists. Details => ' + err);
    }

    for (const friend of friendList1.friends) {
      if (friend.pseudo === user2.pseudo) {
        return true;
      }
    }
    for (const friend of friendList2.friends) {
      if (friend.pseudo === user1.pseudo) {
        return true;
      }
    }

    return false;
  }

}
