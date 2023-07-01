import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import {format} from 'date-fns';
import { Model } from "mongoose";
import { IFriendRequest } from "../interfaces/IFriendRequest";
import { CreateFriendRequestDTO } from "./dto/request/CreateFriendRequestDTO";
import RequestStatusEnum from "../enums/request-status-enum";
import { CreateFriendRequestResponseDTO } from "./dto/response/CreateFriendRequestResponseDTO";

@Injectable()
export class FriendRequestService {

    constructor(@InjectModel('FriendRequest') private readonly friendRequestModel: Model<IFriendRequest>) {
    }

    //INFOS
    //friendRequestConstructor is a mongoose model that we can use to create new documents in the database
    //For each function if we have empty array, we return an empty array (easier to handle on the front)
    /*async getAllFriendRequests(): Promise<IFriendRequest[]> {

    }

    async getOneById(_id: string): Promise<IFriendRequest> {

    }

    async getRequestsByFromTo(from: string, to: string): Promise<IFriendRequest[]> {

    }

    async getFriendRequestsFrom(from: string): Promise<IFriendRequest[]> {

    }

    async getFriendRequestsSentTo(to: string): Promise<IFriendRequest[]> {

    }

    async createRequest(createFriendRequestDTO: CreateFriendRequestDTO): Promise<CreateFriendRequestResponseDTO> {
        //Check if the friend request already exists
        let existingFriendRequest;

    }

    async acceptRequest(_id: string): Promise<string> {

    }

    async refuseRequest(_id: string): Promise<string> {

    }

    async deleteAllFrom(from: string): Promise<string> {

    }

    async deleteAllSentTo(to: string): Promise<string> {

    }*/


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


}
