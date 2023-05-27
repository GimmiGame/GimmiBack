import { Module } from '@nestjs/common';
import { GameRoomService } from './game-room.service';
import { GameRoomController } from './game-room.controller';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from "@nestjs/mongoose";
import { GameRoomSchema } from './game-room';

@Module({
  imports:[
    UserModule,
    MongooseModule.forFeature([{
      name: 'GameRoom',
      schema: GameRoomSchema
    }])
  ],
  providers: [GameRoomService],
  controllers: [GameRoomController]
})
export class GameRoomModule {}
