import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {format} from 'date-fns';
import { Model } from "mongoose";
import { FriendRequestModel } from "./friend-request-model";

@Injectable()
export class FriendRequestService {

    constructor(@InjectModel('FriendRequest') private readonly friendRequestConstructor : Model<FriendRequestModel>) {}
    //friendRequestConstructor is a mongoose model that we can use to create new documents in the database
    createRequest(from: string, to: string) {
        //Check of parameters
        if(!from || !to) return 'Could not create friend request. Error => from or to is null';

        //Create new friend request
        let newRequest ;
        let currentDate = new Date()
        let formattedDate = format(currentDate, 'yyyy-MM-dd')
        try{
            newRequest = new this.friendRequestConstructor({
                from: from,
                to: to,
                sendingDate: formattedDate
            });
        } catch (err) {
            return 'Could not create friend request. Error => ' + err;
        }

        //Save new friend request
        //save() method is provided by mongoose
        return newRequest.save()
          .then((result) => {
            console.log(result);
            return 'FriendRequest with id : ' + result._id + ' created';
          })
          .catch((err) => {
              return 'Could not save friend request. Error => ' + err;
          });
    }


}
