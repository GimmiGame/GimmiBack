import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class GameRoomInvitationRequestDTO {

    @ApiProperty({
        default: "Room1",
        description: "THe name of the game room to join"
    })
    @IsNotEmpty()
    @IsString()
    roomName: string;

    @ApiProperty({
        description: 'The pseudo of the user who sent the game invitation request',
        default: 'Mouss'
      })
      @IsNotEmpty()
      @IsString()
      from: string;
    
      @ApiProperty({
        description: 'The pseudo of the user to receive the game invitation request',
        default: 'test'
      })
      @IsNotEmpty()
      @IsString()
      to: string;
}