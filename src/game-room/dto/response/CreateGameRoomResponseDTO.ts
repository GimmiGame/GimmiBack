import { ApiProperty } from "@nestjs/swagger";

export class CreateGameRoomResponseDTO {

    @ApiProperty()
    _id: string;
    @ApiProperty({
        type: String,
        description: 'If the game-room creation request was sent successfully, this field will be filled with the message containing id',
        default: 'Game room created with id : gameroom#134252 created.'
    })
    message: string;
}