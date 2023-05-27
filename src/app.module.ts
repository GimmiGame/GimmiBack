import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { GameInvitationModule } from './game-invitation/game-invitation.module';
import { UserModule } from './user/user.module';
import { GameRoomModule } from './game-room/game-room.module';
import * as dotenv from 'dotenv';

dotenv.config();

const DB_URI = process.env.MONGO_URI;

@Module({
  imports: [
    MongooseModule.forRoot(DB_URI),
    FriendRequestModule,
    GameInvitationModule,
    UserModule,
    GameRoomModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
