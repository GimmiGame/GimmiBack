import { Module } from '@nestjs/common';
import { GameRoomService } from './game-room.service';
import { GameRoomController } from './game-room.controller';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from "@nestjs/mongoose";
import { GameRoomSchema } from "./game-room";
import { UserSchema } from "../user/user";
import { JwtModule } from "@nestjs/jwt";
import { UserService } from "../user/user.service";


@Module({
  imports:[
    UserModule,
    MongooseModule.forFeature([{
      name: 'GameRoom',
      schema: GameRoomSchema
    },{
      name: 'User',
      schema: UserSchema
    }
    ]),
    JwtModule
  ],
  controllers: [GameRoomController],
  providers: [GameRoomService],
  exports: [GameRoomService]
})
export class GameRoomModule {}
