import { ApiProperty } from "@nestjs/swagger";

export class GameRoomInvitationResponseDTO {
    @ApiProperty()
    roomInvitationID: string;
  
    @ApiProperty({
      type: String,
      description: 'If the game room invitation request was sent successfully, this field will be filled with the message containing id',
      default: 'game room invitation request with id : 1343#game_invitation created.'
    })
    message: string;
}