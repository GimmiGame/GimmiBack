import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import {format} from 'date-fns';
import { Model } from "mongoose";
import { IFriendRequest } from "../_interfaces/IFriendRequest";
import { CreateFriendRequestDTO } from "./dto/request/CreateFriendRequestDTO";
import RequestStatusEnum from "../enums/request-status-enum";
import { CreateFriendRequestResponseDTO } from "./dto/response/CreateFriendRequestResponseDTO";
import { IFriendList } from "../_interfaces/IFriendList";
import { IUser } from "../_interfaces/IUser";

@Injectable()
export class FriendRequestService {

    constructor(@InjectModel('FriendRequest') private readonly friendRequestModel: Model<IFriendRequest>,
                @InjectModel('FriendList') private readonly friendListModel: Model<IFriendList>,
                @InjectModel('User') private readonly userModel: Model<IUser>) {}

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

    ////async getOneById(_id: string): Promise<IFriendRequest> {}

    //async getRequestsByFromTo(from: string, to: string): Promise<IFriendRequest[]> {}

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

    async createRequest(createFriendRequestDTO: CreateFriendRequestDTO): Promise<CreateFriendRequestResponseDTO> {
        //Get users object from dto containing users pseudo
        let sender ;
        let receiver ;
        try {
            sender = await this.userModel.findOne({pseudo: createFriendRequestDTO.from});
            receiver = await this.userModel.findOne({pseudo: createFriendRequestDTO.to});
        }catch(err) {
            throw new BadRequestException('Could not get users. Details => ' + err);
        }

        //Check if the friend request already exists
        let friendRequestFound ;
        try {
            friendRequestFound = await this.friendRequestModel.findOne({from: sender._id, to: receiver._id});
        }catch(err) {
            throw new BadRequestException('Could not get friend request. Details => ' + err);
        }

        //If the friend request already exists and is refused or accepted, we update the sending date and the status
        if (friendRequestFound) {
            try {
                await this.updateExistingRequest(friendRequestFound);
            }catch(err) {
                throw new BadRequestException('Could not update friend request. Details => ' + err);
            }

            return {
                _id: friendRequestFound._id,
                message: 'Friend request with id : ' + friendRequestFound._id + ' sent again.'
            }
        }

        //Create friend request
        let createdRequest : IFriendRequest;
        try {
            createdRequest = await this.friendRequestModel.create({
                from: sender._id,
                to: receiver._id,
                sendingDate: format(new Date(), 'dd/MM/yyyy').toString(),
            });
        }catch(err) {
            throw new BadRequestException('Could not create friend request. Details => ' + err);
        }

        return {
            _id: createdRequest._id,
            message: 'Friend request with id : ' + createdRequest._id + ' created.'
        };
    }

    //async acceptRequest(_id: string): Promise<string> {}

    //async refuseRequest(_id: string): Promise<string> {}

    //async deleteAllFrom(from: string): Promise<string> {}

    //async deleteAllSentTo(to: string): Promise<string> {}


    //MAYBE USELESS
    /*async updateRequest(createFriendRequestDTO: CreateFriendRequestDTO, status: RequestStatusEnum) {
        //Check if the friend request already exists
        let friendRequestToUpdate ;
        try {
            friendRequestToUpdate = await this.friendRequestModel.findOne({
                from: createFriendRequestDTO.from,
                to: createFriendRequestDTO.to,
            });
        }catch(err) {
            Logger.log('No friend request to update found : '+ err)
        }

        if (!friendRequestToUpdate) {
            throw new BadRequestException('Friend request does not exist');
        }

        //Update friend request
        let updatedRequest ;
        try{
            updatedRequest = await this.friendRequestModel.updateOne(
                {_id: friendRequestToUpdate._id},
                {status: status}
            );
        }catch(err) {
            throw new BadRequestException('Could not update friend request. Details => ' + err);
        }
        return 'FriendRequest with id : ' + friendRequestToUpdate._id + ' updated to status : ' + status;
    }*/


    private async updateExistingRequest(createdFriendRequest : IFriendRequest) : Promise<void> {
        switch(createdFriendRequest.status) {
            case RequestStatusEnum.PENDING:
                throw new BadRequestException('Friend request already exists and is PENDING');
                break;

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
