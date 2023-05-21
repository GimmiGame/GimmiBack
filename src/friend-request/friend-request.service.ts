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
    async getAllFriendRequests(): Promise<IFriendRequest[]> {
        let friendRequests;
        try {
            friendRequests = await this.friendRequestModel.find();
        } catch (err) {
            //We don't raise an exception here because we want to return an empty array if there are no friend requests in the database
            Logger.log('No friend requests found.\n Details => ' + err);
        }

        let friendRequestsResponse: IFriendRequest[] = [];

        //If there are friend requests, we map them to a friendRequestResponse
        if (friendRequests) {
            friendRequestsResponse = friendRequests.map(friendRequest => {
                return {
                    _id: friendRequest._id,
                    from: friendRequest.from,
                    to: friendRequest.to,
                    sendingDate: friendRequest.sendingDate,
                    status: friendRequest.status,
                };
            });
        }

        return friendRequestsResponse;
    }

    async getOneById(_id: string): Promise<IFriendRequest> {
        let friendRequest;
        try {
            friendRequest = await this.friendRequestModel.findById(_id);
        } catch (err) {
            throw new NotFoundException('No friend request found with id : ' + _id + '.\n Details => ' + err);
        }

        let friendRequestResponse: IFriendRequest;

        if (friendRequest) {
            friendRequestResponse = {
                _id: friendRequest._id,
                from: friendRequest.from,
                to: friendRequest.to,
                sendingDate: friendRequest.sendingDate,
                status: friendRequest.status,
            };
        }

        return friendRequestResponse;
    }

    async getRequestsByFromTo(from: string, to: string): Promise<IFriendRequest[]> {
        let friendRequests;
        try {
            friendRequests = await this.friendRequestModel.find({ from: from, to: to });
        } catch (err) {
            //No exception raised here because we want to return an empty array if there are no friend requests from this user
            Logger.log('No friend requests found from this User : ' + from + ' to this User : ' + to + '.\n Details => ' + err);
        }

        let friendRequestsResponse: IFriendRequest[] = [];

        //If there are friend requests, we map them to a friendRequestResponse
        if (friendRequests) {
            friendRequestsResponse = friendRequests.map(friendRequest => {
                return {
                    _id: friendRequest._id,
                    from: friendRequest.from,
                    to: friendRequest.to,
                    sendingDate: friendRequest.sendingDate,
                    status: friendRequest.status,
                };
            });
        }

        return friendRequestsResponse;
    }

    async getFriendRequestsFrom(from: string): Promise<IFriendRequest[]> {
        let friendRequests;
        try {
            friendRequests = await this.friendRequestModel.find({ from: from });
        } catch (err) {
            //No exception raised here because we want to return an empty array if there are no friend requests from this user
            Logger.log('No friend requests found from this User : ' + from + '.\n Details => ' + err);
        }

        let friendRequestsResponse: IFriendRequest[] = [];

        //If there are friend requests, we map them to a friendRequestResponse
        if (friendRequests) {
            friendRequestsResponse = friendRequests.map(friendRequest => {
                return {
                    _id: friendRequest._id,
                    from: friendRequest.from,
                    to: friendRequest.to,
                    sendingDate: friendRequest.sendingDate,
                    status: friendRequest.status,
                };
            });
        }

        return friendRequestsResponse;
    }

    async getFriendRequestsSentTo(to: string): Promise<IFriendRequest[]> {
        let friendRequests;
        try {
            friendRequests = await this.friendRequestModel.find({ to: to });
        } catch (err) {
            Logger.log('No friend requests sent to this User : ' + to + '.\n Details => ' + err);
        }

        let friendRequestsResponse: IFriendRequest[] = [];
        if (friendRequests) {
            friendRequestsResponse = friendRequests.map(friendRequest => {
                return {
                    _id: friendRequest._id,
                    from: friendRequest.from,
                    to: friendRequest.to,
                    sendingDate: friendRequest.sendingDate,
                    status: friendRequest.status,
                };
            });
        }

        return friendRequestsResponse;

    }

    async createRequest(createFriendRequestDTO: CreateFriendRequestDTO): Promise<CreateFriendRequestResponseDTO> {
        //Check if the friend request already exists
        let existingFriendRequest;
        try {
            existingFriendRequest = await this.friendRequestModel.findOne({
                from: createFriendRequestDTO.from,
                to: createFriendRequestDTO.to,
            });
        } catch (err) {
            Logger.log('No friend request found : ' + err + "\nCreating new one ...")
        }

        if (existingFriendRequest) {
            throw new BadRequestException('Friend request already exists');
        }

        //CREATE NEW FRIEND REQUEST OBJECT
        let newRequest;
        let currentDate = new Date()
        let formattedDate = format(currentDate, 'yyyy-MM-dd')
        try {
            newRequest = new this.friendRequestModel({
                ...createFriendRequestDTO,
                sendingDate: formattedDate
            });
        } catch (err) {
            throw new BadRequestException('Could not create new friend request.\n Details => ' + err);
        }

        //SAVE NEW FRIEND REQUEST
        //save() method is provided by mongoose
        let savedRequest;
        try {
            savedRequest = await newRequest.save()

        } catch (err) {
            throw new BadRequestException('Could not save new friend request.\n Details => ' + err);
        }

        //Return the created friend request with a message
        let createdRequest: CreateFriendRequestResponseDTO = {
            _id: savedRequest._id,
            message: 'Friend request with id : ' + savedRequest._id + ' created.',
        }

        return createdRequest;
    }

    async acceptRequest(_id: string): Promise<string> {
        //Check if the friend request exists
        let friendRequestToAccept;
        try {
            friendRequestToAccept = await this.friendRequestModel.findById(_id);
        } catch (err) {
            throw new BadRequestException('Friend request does not exist');
        }

        //UPDATE FRIEND REQUEST TO ACCEPTED
        let updatedRequest;
        try {
            updatedRequest = await this.friendRequestModel.updateOne(
              { _id: friendRequestToAccept._id },
              { status: RequestStatusEnum.ACCEPTED }
            );
        } catch (err) {
            throw new BadRequestException('Could not update friend request. Details => ' + err);
        }

        return 'FriendRequest with id : ' + friendRequestToAccept._id + ' accepted';

    }

    async refuseRequest(_id: string): Promise<string> {
        //Check if the friend request exists
        let friendRequestToDecline;
        try {
            friendRequestToDecline = await this.friendRequestModel.findById(_id);
        } catch (err) {
            throw new BadRequestException('Friend request does not exist');
        }

        //UPDATE FRIEND REQUEST TO REFUSED
        let updatedRequest;
        try {
            updatedRequest = await this.friendRequestModel.updateOne(
              { _id: friendRequestToDecline._id },
              { status: RequestStatusEnum.REFUSED }
            );
        } catch (err) {
            throw new BadRequestException('Could not refuse friend request. Details => ' + err);
        }

        return 'FriendRequest with id : ' + friendRequestToDecline._id + ' refused';

    }

    async deleteOneById(_id: string): Promise<string> {
        let result;
        try {
            result = await this.friendRequestModel.deleteOne({ _id: _id });
        } catch (err) {
            throw new NotFoundException('No friend request found with id : ' + _id + '. Details => ' + err);
        }

        return 'Friend request with id : ' + _id + ' deleted';
    }

    async deleteAllFrom(from: string): Promise<string> {
        let result;
        try {
            result = await this.friendRequestModel.deleteMany({ from: from });
        } catch (err) {
            throw new NotFoundException('No friend requests found from this User : ' + from + '. Details => ' + err);
        }

        return 'All Friend requests from : ' + from + ' deleted';
    }

    async deleteAllSentTo(to: string): Promise<string> {
        let result;
        try {
            result = await this.friendRequestModel.deleteMany({ to: to });
        } catch (err) {
            throw new NotFoundException('No friend requests sent to this User : ' + to + '. Details => ' + err);
        }

        return 'All Friend requests sent to : ' + to + ' deleted';
    }


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
