import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import {format} from 'date-fns';
import { Model } from "mongoose";
import { IFriendRequest } from "../interfaces/IFriendRequest";
import { CreateFriendRequestDTO } from "./dto/CreateFriendRequestDTO";

@Injectable()
export class FriendRequestService {

    constructor(@InjectModel('FriendRequest') private readonly friendRequestModel : Model<IFriendRequest>) {}
    //friendRequestConstructor is a mongoose model that we can use to create new documents in the database
    createRequest(createFriendRequestDTO: CreateFriendRequestDTO) {

        //Check if the friend request already exists
        try{
            this.friendRequestModel.findOne({
                from: createFriendRequestDTO.from,
                to: createFriendRequestDTO.to
            }).then((result) => {
                if(result){
                    //console.log('Friend request already exists');
                    throw new BadRequestException('Friend request already exists')
                }
            });
        } catch (err) {
            throw new BadRequestException('Could not check if friend request already exists. Error => ' + err);
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
            throw new BadRequestException('Could not create new friend request. Error => ' + err);
        }

        //Save new friend request
        //save() method is provided by mongoose
        return newRequest.save()
          .then((result) => {
            console.log(result);
            return 'FriendRequest with id : ' + result._id + ' created';
          })
          .catch((err) => {
            console.log(err);
            throw new BadRequestException('Could not save new friend request. Error => ' + err);
          });
    }


}
