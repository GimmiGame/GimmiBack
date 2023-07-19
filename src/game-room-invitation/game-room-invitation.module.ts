import { Module } from '@nestjs/common';
import { GameRoomInvitationController } from './game-room-invitation.controller';
import { GameRoomInvitationService } from './game-room-invitation.service';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { GameInvitationSchema } from './game-room-invitation';
import { GameRoomModule } from 'src/game-room/game-room.module';
import { UserSchema } from "../user/user";
import { JwtModule } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { GameRoomService } from "../game-room/game-room.service";
import { GameRoomSchema } from "../game-room/game-room";

@Module({
  imports:[
    UserModule,
    MongooseModule.forFeature([{
      name: 'GameInvitation',
      schema: GameInvitationSchema
    },
    {
      name: 'User',
      schema: UserSchema
    },
    {
      name: 'GameRoom',
      schema: GameRoomSchema
    }
    ]),
    GameRoomModule,
    JwtModule
  ],
  controllers: [GameRoomInvitationController],
  providers: [GameRoomInvitationService],
  exports: [GameRoomInvitationService]
})
export class GameRoomInvitationModule {}
