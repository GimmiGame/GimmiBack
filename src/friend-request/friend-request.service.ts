import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import {format} from 'date-fns';
import { Model } from "mongoose";
import { IFriendRequest } from "../interfaces/IFriendRequest";
import { CreateFriendRequestDTO } from "./dto/CreateFriendRequestDTO";

@Injectable()
export class FriendRequestService {

    constructor(@InjectModel('FriendRequest') private readonly friendRequestModel : Model<IFriendRequest>) {}
    //friendRequestConstructor is a mongoose model that we can use to create new documents in the database
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


}
