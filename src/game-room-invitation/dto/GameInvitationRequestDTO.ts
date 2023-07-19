import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class GameRoomInvitationRequestDTO {

    @ApiProperty({
        default: "6471294f74ae51832b3483e5",
        description: "THe ID of the game room you want to invite"
    })
    @IsNotEmpty()
    @IsString()
    gameRoomID: string;

    @ApiProperty({
        description: 'The pseudo of the user who sent the game invitation request',
        default: 'dsbdfbshb_USERID_TEST_gfopxopmc'
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