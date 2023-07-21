import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

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
    currentGame: string;

    @ApiProperty({
        default: "Mouss"
    })
    @IsNotEmpty()
    @IsString()
    creator: string;

    @ApiProperty({
        default: 20
    })
    @IsNotEmpty()
    @IsNumber()
    maxPlayers: number;

}