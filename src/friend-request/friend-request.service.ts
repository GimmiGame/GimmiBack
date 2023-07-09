import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import {format} from 'date-fns';
import { Model } from "mongoose";
import { IFriendRequest } from "../_interfaces/IFriendRequest";
import { CreateFriendRequestDTO } from "./dto/request/CreateFriendRequestDTO";
import RequestStatusEnum from "../_enums/request-status-enum";
import { IFriendList } from "../_interfaces/IFriendList";
import { IUser } from "../_interfaces/IUser";
import { FriendListService } from "../friend-list/friend-list.service";

@Injectable()
export class FriendRequestService {

    constructor(@InjectModel('FriendRequest') private readonly friendRequestModel: Model<IFriendRequest>,
                @InjectModel('FriendList') private readonly friendListModel: Model<IFriendList>,
                @InjectModel('User') private readonly userModel: Model<IUser>,

                private readonly friendListService : FriendListService) {}

    //INFOS
    //friendRequestConstructor is a mongoose model that we can use to create new documents in the database
    //For each function if we have empty array, we return an empty array (easier to handle on the front)

    async getAllFriendRequests(): Promise<IFriendRequest[]> {
        let friendRequestsFound : IFriendRequest[] = [];
        try {
            friendRequestsFound = await this.friendRequestModel.find()
              .populate({
                  path : 'from',
                  select: 'pseudo'
              })
              .populate({
                  path : 'to',
                  select: 'pseudo'
              });
        }catch(err) {
            throw new BadRequestException('Could not get friend requests. Details => ' + err);
        }

        return friendRequestsFound;

    }

    async getFriendRequestsFrom(sender: string): Promise<IFriendRequest[]> {
        let user ;
        try {
            user = await this.userModel.findOne({pseudo: sender});
        }catch(err) {
            throw new BadRequestException('Could not get user. Details => ' + err);
        }

        let friendRequestsFound : IFriendRequest[] = [];
        try {
            friendRequestsFound = await this.friendRequestModel.find({from: user._id})
              .populate({
                  path : 'from',
                  select: 'pseudo'
              })
              .populate({
                  path : 'to',
                  select: 'pseudo'
              });
        }catch(err) {
            throw new BadRequestException('Could not get friend requests. Details => ' + err);
        }
        
        return friendRequestsFound;
    }

    async getFriendRequestsSentTo(receiver: string): Promise<IFriendRequest[]> {
        let user ;
        try {
            user = await this.userModel.findOne({pseudo: receiver});
        }catch(err) {
            throw new BadRequestException('Could not get user. Details => ' + err);
        }

        let friendRequestsFound : IFriendRequest[] = [];
        try {
            friendRequestsFound = await this.friendRequestModel.find({to: user._id})
              .populate({
                  path : 'from',
                  select: 'pseudo'
              })
              .populate({
                  path : 'to',
                  select: 'pseudo'
              });
        }catch(err) {
            throw new BadRequestException('Could not get friend requests. Details => ' + err);
        }
        
        return friendRequestsFound;
    }

    async createRequest(createFriendRequestDTO: CreateFriendRequestDTO): Promise<void> {
        //Get users object from dto containing users pseudo
        let sender ;
        let receiver ;
        try {
            sender = await this.userModel.findOne({pseudo: createFriendRequestDTO.from});
            receiver = await this.userModel.findOne({pseudo: createFriendRequestDTO.to});
        }catch(err) {
            throw new BadRequestException('Could not get users. Details => ' + err);
        }

        //Check if the users are already friends
        const areAlreadyFriends = await this.friendListService.areFriends(createFriendRequestDTO.from, createFriendRequestDTO.to)

        if(areAlreadyFriends) {
            throw new ConflictException('Users are already friends');
        }

        //Check if the friend request already exists
        let friendRequestFound ;
        try {
            friendRequestFound = await this.friendRequestModel.findOne({from: sender._id, to: receiver._id});
        }catch(err) {
            throw new ConflictException('Could not get friend request. Details => ' + err);
        }

        //If the friend request already exists and is refused or accepted, we update the sending date and the status
        if (friendRequestFound) {
            try {
                await this.updateExistingRequest(friendRequestFound);
            }catch(err) {
                throw new BadRequestException('Could not update friend request. Details => ' + err);
            }

        }else{
            //If the friend request does not exist, we create it
            try {
                await this.friendRequestModel.create({
                    from: sender._id,
                    to: receiver._id,
                    sendingDate: format(new Date(), 'dd/MM/yyyy').toString(),
                });
            }catch(err) {
                throw new BadRequestException('Could not create friend request. Details => ' + err);
            }
        }
    }

    async acceptRequest(_id: string): Promise<void> {
        //Check if the friend request exists
        let friendRequestFound ;
        try {
            friendRequestFound = await this.friendRequestModel.findOne({_id: _id});
        }catch(err) {
            throw new BadRequestException('Could not get friend request. Details => ' + err);
        }

        if (!friendRequestFound) {
            throw new BadRequestException('Friend request does not exist');
        }

        //get users objects
        let sender ;
        let receiver ;
        try {
            sender = await this.userModel.findById(friendRequestFound.from);
            receiver = await this.userModel.findById(friendRequestFound.to);
        }catch (err) {
            throw new BadRequestException('Could not get users. Details => ' + err);
        }

        //Add to friend lists of users
        try {
            await this.friendListService.acceptFriendshipOfUsers(sender.pseudo, receiver.pseudo);
        }catch (err) {
            throw new BadRequestException('Could not accept friend request. Details => ' + err);
        }

        //Update friend request status
        try{
            switch(friendRequestFound.status) {
                case RequestStatusEnum.PENDING:
                    await this.friendRequestModel.updateOne({_id: _id}, {
                        status: RequestStatusEnum.ACCEPTED,
                    }
                    );
                    break;
                    default:
                        throw new BadRequestException('Friend request status is refused or already accepted.');
            }
        }catch(err) {
            throw new BadRequestException('Could not update friend request. Details => ' + err);
        }
    }

    async refuseRequest(_id: string): Promise<void> {
        //Supprimer la demande d'amitié
        try {
            await this.friendRequestModel.deleteOne({_id: _id});
        }catch(err) {
            throw new BadRequestException('Could not refuse friend request. Details => ' + err);
        }
    }


    async deleteOne(_id: string): Promise<void> {
        //Delete friend request
        try {
            await this.friendRequestModel.deleteOne({_id: _id});
        }catch(err) {
            throw new BadRequestException('Could not delete friend request. Details => ' + err);
        }
    }



    private async updateExistingRequest(createdFriendRequest : IFriendRequest) : Promise<void> {
        switch(createdFriendRequest.status) {
            case RequestStatusEnum.PENDING:
                throw new BadRequestException('Friend request already exists and is PENDING');
            default:
                try {
                    await this.friendRequestModel.updateOne(
                      { _id: createdFriendRequest._id },
                      {
                          sendingDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                          status: RequestStatusEnum.PENDING
                      }
                    );
                }catch(err) {
                    throw new BadRequestException('Could not update friend request. Details => ' + err);
                }
                break;
        }
    }

}
