import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import {format} from 'date-fns';
import { Model } from "mongoose";
import { IFriendRequest } from "../interfaces/IFriendRequest";
import { CreateFriendRequestDTO } from "./dto/CreateFriendRequestDTO";
import RequestStatusEnum from "../enums/request-status-enum";

@Injectable()
export class FriendRequestService {

    constructor(@InjectModel('FriendRequest') private readonly friendRequestModel : Model<IFriendRequest>) {}
    //friendRequestConstructor is a mongoose model that we can use to create new documents in the database

    async getAllFriendRequests() {
        let friendRequests ;
        try {
            friendRequests = await this.friendRequestModel.find();
        }catch(err) {
            throw new NotFoundException('No friend requests found. Details => ' + err);
        }
        return friendRequests.map((friendRequest) => ({
            _id : friendRequest._id,
            from : friendRequest.from,
            to : friendRequest.to,
            sendingDate : friendRequest.sendingDate,
            status : friendRequest.status,
        }));
    }

    async getOneById(_id: string) {
        let friendRequest ;
        try {
            friendRequest = await this.friendRequestModel.findById(_id);
        }catch(err) {
            throw new NotFoundException('No friend request found with id : ' + _id + '. Details => ' + err);
        }
        return {
            _id : friendRequest._id,
            from : friendRequest.from,
            to : friendRequest.to,
            sendingDate : friendRequest.sendingDate,
            status : friendRequest.status,
        };
    }

    async getFriendRequestsFrom(from: string) {
        let friendRequests ;
        try {
            friendRequests = await this.friendRequestModel.find({from: from});
        }catch(err) {
            throw new NotFoundException('No friend requests found from this User : ' + from + '. Details => ' + err);
        }
        return friendRequests.map((friendRequest) => ({
            _id : friendRequest._id,
            from : friendRequest.from,
            to : friendRequest.to,
            sendingDate : friendRequest.sendingDate,
            status : friendRequest.status,
        }));
    }

    async getFriendRequestsSentTo(to: string) {
        let friendRequests ;
        try {
            friendRequests = await this.friendRequestModel.find({to: to});
        }catch(err) {
            throw new NotFoundException('No friend requests sent to this User : ' + to + '. Details => ' + err);
        }
        return friendRequests.map((friendRequest) => ({
            _id : friendRequest._id,
            from : friendRequest.from,
            to : friendRequest.to,
            sendingDate : friendRequest.sendingDate,
            status : friendRequest.status,
        }));
    }

    async createRequest(createFriendRequestDTO: CreateFriendRequestDTO) {
        //Check if the friend request already exists
        let existingFriendRequest ;
        try {
            existingFriendRequest = await this.friendRequestModel.findOne({
                from: createFriendRequestDTO.from,
                to: createFriendRequestDTO.to,
            });
        }catch(err) {
            Logger.log('No friend request found : '+ err + "\nCreating new one ...")
        }

        if (existingFriendRequest) {
            throw new BadRequestException('Friend request already exists');
        }

        //Create new friend request
        let newRequest ;
        let currentDate = new Date()
        let formattedDate = format(currentDate, 'yyyy-MM-dd')
        try{
            newRequest = new this.friendRequestModel({
                ...createFriendRequestDTO,
                sendingDate: formattedDate
            });
        } catch (err) {
            throw new BadRequestException('Could not create new friend request. Details => ' + err);
        }

        //Save new friend request
        //save() method is provided by mongoose
        let result ;
        try{
            result = await newRequest.save()
        }catch(err) {
            throw new BadRequestException('Could not save new friend request. Details => ' + err);
        }

        return 'FriendRequest with id : ' + result._id + ' created';
    }

    async acceptRequest(_id: string) {
        //Check if the friend request exists
        let friendRequestToAccept ;
        try {
            friendRequestToAccept = await this.friendRequestModel.findById(_id);
        }catch(err) {
            Logger.log('No friend request found : '+ err)
        }

        if (!friendRequestToAccept) {
            throw new BadRequestException('Friend request does not exist');
        }

        //Update friend request to accepted
        let updatedRequest ;
        try{
            updatedRequest = await this.friendRequestModel.updateOne(
                {_id: friendRequestToAccept._id},
                {status: RequestStatusEnum.ACCEPTED}
            );
        }catch(err) {
            throw new BadRequestException('Could not accept friend request. Details => ' + err);
        }

        return 'FriendRequest with id : ' + friendRequestToAccept._id + ' accepted';

    }

    async refuseRequest(_id: string) {
        //Check if the friend request exists
        let friendRequestToDecline ;
        try {
            friendRequestToDecline = await this.friendRequestModel.findById(_id);
        }catch(err) {
            Logger.log('No friend request found : '+ err)
        }

        if (!friendRequestToDecline) {
            throw new BadRequestException('Friend request does not exist');
        }

        //Update friend request to rejected
        let updatedRequest ;
        try{
            updatedRequest = await this.friendRequestModel.updateOne(
                {_id: friendRequestToDecline._id},
                {status: RequestStatusEnum.REJECTED}
            );
        }catch(err) {
            throw new BadRequestException('Could not refuse friend request. Details => ' + err);
        }

        return 'FriendRequest with id : ' + friendRequestToDecline._id + ' refused';

    }


    //MAYBE USELESS
    async updateRequest(createFriendRequestDTO: CreateFriendRequestDTO, status: RequestStatusEnum) {
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
    }




}
