import { Module } from '@nestjs/common';
import { FriendRequestController } from './friend-request.controller';
import { FriendRequestService } from './friend-request.service';
import { MongooseModule } from "@nestjs/mongoose";
import { FriendRequestSchema } from "./friend-request";
import { UserModule } from "../user/user.module";

@Module({
  //Allows us to inject the FriendRequestModel into the service and instantiate it
  imports:[
    UserModule,
    MongooseModule.forFeature([{
      name: 'FriendRequest',
      schema: FriendRequestSchema
    }])
  ],
  controllers: [FriendRequestController],
  providers: [FriendRequestService]
})
export class FriendRequestModule {}
