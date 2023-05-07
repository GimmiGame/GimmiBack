import { Module } from '@nestjs/common';
import { GameInvitationController } from './game-invitation.controller';
import { GameInvitationService } from './game-invitation.service';

@Module({
  controllers: [GameInvitationController],
  providers: [GameInvitationService]
})
export class GameInvitationModule {}
