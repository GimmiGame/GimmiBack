import { Module } from '@nestjs/common';
import { GameInvitationController } from './game-invitation.controller';
import { GameInvitationService } from './game-invitation.service';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { GameInvitationSchema } from './game-invitation';
import { GameRoomModule } from 'src/game-room/game-room.module';

@Module({
  imports:[
    UserModule,
    MongooseModule.forFeature([{
      name: 'GameInvitationRequest',
      schema: GameInvitationSchema
    }]),
    GameRoomModule
  ],
  controllers: [GameInvitationController],
  providers: [GameInvitationService]
})
export class GameInvitationModule {}
