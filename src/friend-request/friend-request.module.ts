import { Module } from '@nestjs/common';
import { FriendRequestController } from './friend-request.controller';
import { FriendRequestService } from './friend-request.service';
import { MongooseModule } from "@nestjs/mongoose";
import { FriendRequestSchema } from "./friend-request";
import { UserModule } from "../user/user.module";
import { FriendListService } from "../friend-list/friend-list.service";
import { FriendListSchema } from "../friend-list/friend-list";
import { UserService } from "../user/user.service";
import { UserSchema } from "../user/user";
import { JwtModule } from "@nestjs/jwt";

@Module({
  //Allows us to inject the FriendRequestModel into the service and instantiate it
  imports:[
    UserModule,
    MongooseModule.forFeature([{
        name: 'FriendRequest',
        schema: FriendRequestSchema
      },
      {
        name: 'FriendList',
        schema: FriendListSchema
      },
      {
        name: 'User',
        schema: UserSchema
      }
    ]),
    JwtModule
  ],
  controllers: [FriendRequestController],
  providers: [FriendRequestService,FriendListService,UserService],
  exports: [FriendRequestService]
})
export class FriendRequestModule {}
