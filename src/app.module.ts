import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { GameRoomInvitationModule } from './game-room-invitation/game-room-invitation.module';
import { UserModule } from './user/user.module';
import { GameRoomModule } from './game-room/game-room.module';
import { FriendListModule } from './friend-list/friend-list.module';
import { SocketModule } from './socket/socket.module';
import { MorpionScriptService } from './morpion_script/morpion_script.service';
import * as dotenv from 'dotenv';

dotenv.config();

const DB_URI = process.env.MONGO_URI;

@Module({
  imports: [
    MongooseModule.forRoot(DB_URI),
    FriendRequestModule,
    GameRoomInvitationModule,
    UserModule,
    GameRoomModule,
    FriendListModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
