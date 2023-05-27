import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateGameRoomRequestDTO {
    
    @ApiProperty({
        description: "The room name",
        default: "Room1"
    })
    @IsNotEmpty()
    @IsString()
    roomName: string;

    @ApiProperty({
        default: "morpion"
    })
    @IsNotEmpty()
    @IsString()
    game: string;

    @ApiProperty({
        default: "this.user"
    })
    @IsNotEmpty()
    @IsString()
    creator: string;

}