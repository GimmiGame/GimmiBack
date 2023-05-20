import { ApiProperty } from "@nestjs/swagger";

export class CreateFriendRequestResponseDTO {
  @ApiProperty()
  _id: string;

  @ApiProperty({
    type: String,
    description: 'If the friend request was sent successfully, this field will be filled with the message containing id',
    default: 'Friend request with id : 12315456Toto created.'
  })
  message: string;

}