import { Module } from '@nestjs/common';
import { FriendListController } from './friend-list.controller';
import { FriendListService } from './friend-list.service';
import { UserModule } from "../user/user.module";
import { MongooseModule } from "@nestjs/mongoose";
import { FriendListSchema } from "./friend-list";
import { UserService } from "../user/user.service";
import { UserSchema } from "../user/user";
import { JwtModule } from "@nestjs/jwt";


@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([{
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
  controllers: [FriendListController],
  providers: [FriendListService,UserService],
  exports: [FriendListService]
})
export class FriendListModule {}
